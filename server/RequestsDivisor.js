const express = require("express")

const T_Service = require("./templates/T_Service")


class RequestsDivisor extends T_Service {
    constructor (args, config) {
        super(args, config)

        this.CRH_app = express() // handler for outer clients requests (CRH - client request handler)

        this.CRH_app.use(express.json())

        // for ddl-service
        this.CRH_app.get(`/api/${this.config.api_version}*`, (req, res) => {
            let dexDataLoaders = this.peersByType.ddl
            this._execRequestToSpecialService(dexDataLoaders, req, res)
        })

        // for fl-service
        this.CRH_app.get("/*", (req, res) => {
            let fileLoaders = this.peersByType.fl
            this._execRequestToSpecialService(fileLoaders, req, res)
        })
    }

    _pullApiMethod (url) {
        return url.substring(url.match(/https?:\/\/[a-z|0-9]+(:[0-9]+)?/)[0].length)
    }

    _execRequestToSpecialService (services, res, req) {
        if (!services.length) {
            res.status(500)
            res.end()
            return
        }
        let sName = services[Math.floor(Math.random() * services.length)]
        this.jsonrpcUtil.execRequest("internal_request", [this._pullApiMethod(req.url)], this._countUrl(sName))
            .then(result => {
                res.setHeader('Content-Type', result.contentType)
                res.status(200)
                res.end(result.data)
            })
            .catch(error => {
                if (error.stateCode)
                    res.status(error.stateCode)
                else
                    res.status(500)
                res.end(error)
            })
    }

    _countUrl (sName) {
        let service = this.peers[sName]
        return `https://${service.host}:${service.port}`
    }

    startClientsRequestsHandler (port) {
        this.CRH_app.listen(port, err => {
            if (err) console.log(err)
            else console.log("Server is successfully running on port:", port)
        })
    }
}

module.exports =  RequestsDivisor