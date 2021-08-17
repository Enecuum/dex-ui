const path    = require("path")
const i18n    = require("i18n")
const express = require("express")
const router  = express.Router()

const T_Service = require("./templates/T_Service")

const imageRouter  = require("./routers/filesRouter")
const htmlRouter   = require("./routers/htmlRouter")
const jsRouter     = require("./routers/jsRouter")

const jsonrpcErrors = require("./json-rpc_errors.json")

const  allowedLocales = ["en", "ru"]

i18n.configure({
    locales: allowedLocales,
    register: global,
    fallbacks:{ "ru": "en" },
    queryParameter: "lang",
    objectNotation: true,
    updateFiles: false,
    autoReload: false,
    syncFiles: false,
    staticCatalog: {
        ru : require(path.resolve(__dirname, "../public/locales/ru")),
        en : require(path.resolve(__dirname, "../public/locales/en"))
    },
    defaultLocale: "en"
})


class FileLoader extends T_Service {
    constructor(args, config) {
        super(args, config)

        this.app.use(i18n.init)

        this.app.use("/", this._getMainRouter())
        this.app.use("/images/{0,}", imageRouter)
        this.app.use("/html/{0,}", htmlRouter)
        this.app.use("/js/{0,}", jsRouter)
    }

    _sendError (res, req, errorMsg) {
        res.setHeader("Content-Type", "application/json")
        res.send(JSON.stringify(this.jsonrpcUtil.makeResponseObject(req.body.id, false, errorMsg)))
    }

    _getMainRouter () {
        return router.post("/", (req, res, next) => {
            if (req.body.method !== "internal") {
                this._sendError(req, res, jsonrpcErrors.needInternalMethod)
                return
            }
            if (!Array.isArray(req.body.params) || req.body.params.length === 0) {
                this._sendError(req, res, jsonrpcErrors.emptyFieldParams)
                return
            }

            let urlPath = req.body.params[0]
            let allowedPaths = ["images", "html", "js"]

            if (allowedPaths.some(path => urlPath.test(new RegExp(`/${path}.*/`))))
                res.redirect(urlPath)
            else
                res.redirect("html")
        })
    }
}

module.exports = FileLoader