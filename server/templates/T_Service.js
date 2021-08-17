const crypto = require("crypto")
const https  = require("https")
const path   = require("path")
const fs     = require("fs")

const Service_Client = require("./Service_Client")

const jsonrpcErrors = require("../json-rpc_errors.json")
const serviceType   = require("../service_type.json")


class T_Service extends Service_Client {
    constructor (args, config) {
        super(args, config)

        this.peers = {}
        // this.peers = {
        //     name0 : {
        //         token        : ...,
        //         refresh_token: ...,
        //         host         : ...,
        //         port         : ...,
        //         status       : (0 - just created, 1 - authenticated, 2 - token must be refreshed)
        //     }
        // }
        this.peersByType = this.peers = Object.keys(serviceType).reduce((resObject, curType) => {
            return {...resObject, [curType] : []}
        }, {})
        // this.peersByType = {
        //     ddl : [name0, ...],
        //     fl : [name1, ...]
        // }
    }

    _handleJSONRPCRequests (req, res) {
        if (!this.jsonrpcUtil.isValidJSONRPCRequest(req.body) && !Array.isArray(req.body.params)) {
            console.log(req.body)
            this._jsonrpcResponse(res, false, jsonrpcErrors.doNotSatisfyJSONRPC, req.body.id)
            return
        }
        let body = req.body, opRes
        if (body.method === "connect") {
            opRes = this._saveNewServiceData(body.params)
            this._jsonrpcResponse(res, opRes.code === undefined, opRes, body.id)

        } else if (body.method === "authentication") {
            opRes = this._authenticateServiceOnServer(body.params)
            this._jsonrpcResponse(res, opRes.code === undefined, opRes, body.id)
        }
    }

    _authenticateServiceOnServer (params) {
        if (!params.length)
            return jsonrpcErrors.emptyFieldParams
        if (typeof params[0] !== "string" || typeof params[1] !== "string")
            return jsonrpcErrors.wrongTypeOfParams
        let name = params[0], passphrase = params[1]
        if (!this.peers[name])
            return  jsonrpcErrors.notIdentified
        let status = this.peers[name].status

        if      (status === 0)
            return this._authWithPassphrase(name, passphrase)
        else if (status === 1)
            return jsonrpcErrors.alreadyAuthenticated
        else if (status === 2)
            return this._refreshToken(name, params[1])
    }

    _getAuthTokenPair () {
        return {
            token : this._createAuthToken(),
            refresh_token : this._createAuthToken()
        }
    }

    _refreshToken (name, refreshToken) {
        if (this.peers[name].refresh_token === refreshToken) {
            let authTokens = this._getAuthTokenPair()
            this.peers[name] = {...authTokens}
            return authTokens
        } else
            return jsonrpcErrors.wrongRefreshToken
    }

    _authWithPassphrase (name,passphrase) {
        let hash = this._countPassphraseHash(passphrase)
        if (hash === this.commonAuthData.hash) {
            let authTokens = this._getAuthTokenPair()
            this.peers[name] = {...authTokens}
            return authTokens
        }
        else
            return jsonrpcErrors.wrongPassphrase
    }

    _createAuthToken () {
        let hash = crypto.createHash("md5")
        hash.update(new Date().getTime() + crypto.randomBytes(64))
        return hash.digest("hex")
    }

    _jsonrpcResponse (res, isResult, data, r_id) {
        res.setHeader('Content-Type', 'application/json')
        res.status(200)
        res.end(JSON.stringify(this.jsonrpcUtil.makeResponseObject(
            r_id,
            isResult,
            data
        )))
    }

    _saveNewServiceData (params) {
        if (!params.length)
            return jsonrpcErrors.emptyFieldParams
        if (typeof params[0] !== "string")
            return jsonrpcErrors.wrongTypeOfParams
        if (Object.keys(this.peers).indexOf(params[0]) + 1)
            return jsonrpcErrors.duplicatedNames
        if (Object.keys(serviceType).indexOf(params[3]) + 1)
            return jsonrpcErrors.wrongTypeOfService
        this.peers[params[0]] = {
            host : params[1],
            port : params[2],
            status : 0
        }
        this.peersByType[params[3]].push(params[0])
        return {auth : true}
    }

    _setServerLogic () {
        this.app.use((req, res, next) => {
            if (req.method === "POST" && req.body.jsonrpc)
                this._handleJSONRPCRequests(req, res)
            else
                next()
        })
    }

    startServer () {
        this._setServerLogic()
        console.log("Start server at port:", this.port)
        https.createServer({
            requestCert : true,
            rejectUnauthorized : false,
            cert : fs.readFileSync(path.resolve(__dirname, "../https/server1.crt")),
            key : fs.readFileSync(path.resolve(__dirname, "../https/server1.key")),
            ca : fs.readFileSync(path.resolve(__dirname, "../https/rootCA.crt"))
        }, this.app).listen(this.port)
    }
}

// server get name
// server write name
// server get passphrase
// server write token and send to clientService

module.exports = T_Service