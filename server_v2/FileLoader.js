const express = require("express")
const router  = express.Router()

const T_Service = require("./T_Service")

const localeRouter = require("./routers/localeRouter")
const imageRouter  = require("./routers/imageRouter")
const fontRouter   = require("./routers/fontRouter")
const htmlRouter   = require("./routers/htmlRouter")
const jsRouter     = require("./routers/jsRouter")


class FileLoader extends T_Service {
    constructor(args, config) {
        super(args, config)

        this.app.use("/locales/{0,}", localeRouter)
        this.app.use("/images/{0,}", imageRouter)
        this.app.use("/fonts/{0,}", fontRouter)
        this.app.use("/html/{0,}", htmlRouter)
        this.app.use("/js/{0,}", jsRouter)
    }
}