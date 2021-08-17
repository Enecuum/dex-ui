const express = require("express")
const router  = express.Router()
const path    = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const webpack_config = require("../../webpack.config")
const pubDir         = webpack_config.output.path

router.post(`/*`, (req, res, next) => {
    if (req.url === "/index.html") {
        cReadFiles([{data : path.resolve(pubDir, "index.html")}], "utf-8")
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "text/html"))
            })
    } else {
        res.redirect(307, req.baseUrl + "/index.html")
    }
})

module.exports = router