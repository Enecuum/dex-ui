const express   = require("express")
const router    = express.Router()
const path      = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const jsonrpcErrors  = require("../json-rpc_errors.json")
const webpack_config = require("../../webpack.config")
const pubDir         = webpack_config.output.path

function readAndSend (req, res, cType) {
    cReadFiles([{data: path.join(pubDir, req.url)}], "base64")
        .then(file => {
            res.send(jsonrpcResponse(req.body.id, true, {content : file.data, base64encoding : true}, cType))
        })
        .catch(() => {
            res.send(jsonrpcResponse(req.body.id, false, jsonrpcErrors.noContent))
        })
}

router.post(`/(*\.eot$)|(site\.webmanifest)`, (req, res, next) => {
    readAndSend(req, res, "text/html")
}).post(`/*\.woff$`, (req, res, next) => {
    readAndSend(req, res, "application/font-woff")
}).post(`/*\.svg$`, (req, res, next) => {
    readAndSend(req, res, "image/svg+xml")
}).post(`/*\.ttf$`, (req, res, next) => {
    readAndSend(req, res, "application/x-font-ttf")
}).post(`/*\.otf$`, (req, res, next) => {
    readAndSend(req, res, "font/opentype")
}).post(`/*\.(png|jpeg|jpg)$`, (req, res, next) => {
    readAndSend(req, res, "image/png")
})

module.exports = router