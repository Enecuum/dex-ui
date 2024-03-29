const express = require("express")
const fs = require("fs")
const path = require("path")
const cors = require("cors")

const T_Service = require("../templates/T_Service")

const w_config = require("../../webpack.config")()


class RequestsDivisor extends T_Service {
    constructor (args, config) {
        super(args, config)

        this.serviceType = "rd"

        this.CRH_app = express() // handler for outer clients requests (CRH - client request handler)

        this.CRH_app.use(express.json())

        // this.CRH_app.use((req, res, next) => {
        //     console.log(req.url)
        //     next()
        // })

        if (w_config.mode === "development") {
            const webpack              = require("webpack")
            const webpackDevMiddleware = require("webpack-dev-middleware")
            const webpackHotMiddleware = require("webpack-hot-middleware")

            let hmr_plugin = new webpack.HotModuleReplacementPlugin()
            w_config.entry.app.unshift('webpack-hot-middleware/client?reload=true&timeout=1000')
            if (w_config.plugins && Array.isArray(w_config.plugins))
                w_config.plugins.push(hmr_plugin)
            else
                w_config.plugins = [ hmr_plugin ]
            let compiler = webpack(w_config)

            this.CRH_app.use(webpackDevMiddleware(
                compiler,
                {
                    publicPath : w_config.output.path,
                    writeToDisk : true
                }
            ))
            this.CRH_app.use(webpackHotMiddleware(compiler));
        }

        // this.CRH_app.use((req, res, next) => {
        //     let usrIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        //     fs.appendFileSync(path.join(__dirname, "../../logs/usrs.log"), `${usrIp}\n`, {encoding: "utf-8"})
        //     next()
        // })

        // for tp-service
        this.CRH_app.get(`/api/${this.cnfg.api_version}*`, (req, res, next) => {
            let testPlug = this.peersByType.tp
            let services = this._filterServices(testPlug)
            if (!services)
                next()
            else
                this._execRequestToSpecialService(testPlug, req, res)
        })

        // for ddl-service
        this.CRH_app.get(`/api/${this.cnfg.api_version}*`, (req, res) => {
            let dexDataLoaders = this.peersByType.ddl
            this._execRequestToSpecialService(dexDataLoaders, req, res)
        })

        // for fl-service
        this.CRH_app.get("/*", cors({
            origin: 'http://localhost'
        }), (req, res) => {
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
                if (result.data.JSONToBufferEncoding)
                    res.send(Buffer.from(JSON.parse(result.data.content).data))
                else
                    res.send(result.data)
            })
            .catch(error => {
                if (error && error.stateCode)
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