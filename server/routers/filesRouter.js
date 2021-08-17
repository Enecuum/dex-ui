const express   = require("express")
const router    = express.Router()
const path      = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const jsonrpcErrors  = require("../json-rpc_errors.json")
const webpack_config = require("../../webpack.config")
const pubDir         = webpack_config.output.path

router.post(`/(*\.(otf|ttf|eot|woff|svg)$)|(site\.webmanifest)`, (req, res, next) => {
    console.log(req.url)
    cReadFiles([{data: path.join(pubDir, req.url)}])
        .then(file => {
            res.send(jsonrpcResponse(req.body.id, true, file.data, "text/html"))
        })
        .catch(() => {
            res.send(jsonrpcResponse(req.body.id, false, jsonrpcErrors.noContent))
        })
})

router.post(`/*\.(png|jpeg|jpg)$`, (req, res, next) => {
    cReadFiles([{data: path.join(pubDir, req.url)}], "base64")
        .then(file => {
            res.send(jsonrpcResponse(req.body.id, true, {content : file.data, image : true}, "image/png"))
        })
        .catch(() => {
            res.send(jsonrpcResponse(req.body.id, false, jsonrpcErrors.noContent))
        })
})

module.exports = router