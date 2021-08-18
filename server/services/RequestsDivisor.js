const express = require("express")

const T_Service = require("../templates/T_Service")


class RequestsDivisor extends T_Service {
    constructor (args, config) {
        super(args, config)

        this.serviceType = "rd"

        this.CRH_app = express() // handler for outer clients requests (CRH - client request handler)

        this.CRH_app.use(express.json())

        // for ddl-service
        this.CRH_app.get(`/api/${this.cnfg.api_version}*`, (req, res) => {
            let dexDataLoaders = this.peersByType.ddl
            this._execRequestToSpecialService(dexDataLoaders, req, res)
        })

        // for fl-service
        this.CRH_app.get("/*", (req, res) => {
            let fileLoaders = this.peersByType.fl
            this._execRequestToSpecialService(fileLoaders, req, res)
        })
    }

    _filterServices (services) {
        return services.filter(serviceName => this.peers[serviceName].status === 1)
    }

    _execRequestToSpecialService (services, req, res) {
        services = this._filterServices(services)
        if (!services.length) {
            res.status(500)
            res.end()
            return
        }
        let sName = services[Math.floor(Math.random() * services.length)]
        this.jsonrpcUtil.execRequest("internal_request", [this.peers[sName].token, req.url], this._countUrl(sName))
            .then(result => {
                res.status(200)
                res.setHeader('Content-Type', result.contentType)
                if (result.data.base64encoding) {
                    res.setHeader('Content-Length', result.data.content.length)
                    res.send(Buffer.from(result.data.content, 'base64'))
                } else
                    res.send(result.data)
            })
            .catch(error => {
                if (error.stateCode)
                    res.status(error.stateCode)
                else
                    res.status(500)
                res.end()
            })
    }

    _countUrl (sName) {
        let service = this.peers[sName]
        return `https://${service.host}:${service.port}`
    }

    startClientsRequestsHandler (port) {
        this.CRH_app.listen(port, err => {
            if (err) console.log(err)
            else console.log("Receiver of client request is successfully running at port:", port)
        })
    }
}

module.exports = RequestsDivisor