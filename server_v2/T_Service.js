const crypto = require("crypto")
const https  = require("https")
const path   = require("path")
const fs     = require("fs")

const jsonrpcErrors = require("./json-rpc_errors.json")

const Service_Client = require("./Service_Client")


class T_Service extends Service_Client {
    constructor () {
        super()

        this.commonAuthData = {
            hash : "must write interface to create passwords and share hashes",
            salt : "must write interface to create passwords and share hashes"
        }
        this.peers = {
            // [name] : {
            //     token        : ...,
            //     refresh_token: ...,
            //     host         : ...,
            //     port         : ...,
            //     status       : ... (0 - just created, 1 - authenticated, 2 - token must be refreshed)
            // }
        }

        this.app.use((req, res, next) => {
            if (req.method === "POST" && req.body.jsonrpc)
                this._handleJSONRPCRequests(req, res)
            else
                next()
        })
    }

    _handleJSONRPCRequests (req, res) {
        if (!this.jsonrpcUtil.isValidJSONRPCRequest(req.body) && Array.isArray(req.body.params)) {
            this._jsonrpcResponse(res, false, jsonrpcErrors.doNotSatisfyJSONRPC, req.body.id)
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
        let hash = this._createPassphraseHash(passphrase)
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

    _createPassphraseHash (passphrase) {
        passphrase = passphrase.toString()
        let hash = crypto.createHash("md5")
        let saltLength = this.commonAuthData.salt.length
        hash.update(passphrase + this.commonAuthData.salt.substring(0, saltLength / 2))
        hash.update(hash.digest("hex") + this.commonAuthData.salt.substring(saltLength / 2, saltLength-1))
        return hash.digest("base64")
    }

    _jsonrpcResponse (res, isResult, data, r_id) {
        res.status(200)
        res.setHeader('Content-Type', 'application/json')
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
        this.peers[params[0]] = {
            host : params[1],
            port : params[2],
            status : 0
        }
        return {auth : true}
    }

    startServer () {
        https.createServer({
            requestCert : true,
            rejectUnauthorized : true,
            ca : fs.readFileSync(path.resolve(__dirname, "../https/ca.crt"))
        }, /* (req, res) => {
            if (!req.client.authorized) {
                res.writeHead(401)
                return res.end('Invalid client certificate authentication.')
            }
        },*/ this.app).listen(this.port)
    }
}

// server get name
// server write name
// server get passphrase
// server write token and send to clientService

export default T_Service