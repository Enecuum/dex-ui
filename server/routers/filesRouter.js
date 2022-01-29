const express   = require("express")
const router    = express.Router()
const path      = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const jsonrpcErrors  = require("../json-rpc_errors.json")
const webpack_config = require("../../webpack.config")()
const pubDir         = webpack_config.output.path

function readAndSend (req, res, cType) {
    cReadFiles([{data: path.join(pubDir, req.url)}], null)
        .then(file => {
            res.send(jsonrpcResponse(req.body.id, true, {content : JSON.stringify(file.data), JSONToBufferEncoding : true}, cType))
        })
        .catch(() => {
            res.send(jsonrpcResponse(req.body.id, false, jsonrpcErrors.noContent))
        })
}

router.post(`/site\.webmanifest`, (req, res, next) => {
    readAndSend(req, res, "text/html")
}).post(`/*\.woff$`, (req, res, next) => {
    readAndSend(req, res, "application/font-woff")
}).post(`/*\.svg$`, (req, res, next) => {
    readAndSend(req, res, "image/svg+xml")
}).post(`/*\.ttf$`, (req, res, next) => {
    readAndSend(req, res, "application/x-font-ttf")
}).post(`/*\.eot$`, (req, res, next) => {
    readAndSend(req, res, "application/vnd.ms-fontobject")
}).post(`/*\.otf$`, (req, res, next) => {
    readAndSend(req, res, "font/opentype")
}).post(`/*\.png$`, (req, res, next) => {
    readAndSend(req, res, "image/png")
}).post(`/*\.(jpeg|jpg)$`, (req, res, next) => {
    readAndSend(req, res, "image/jpeg")
})

module.exports = router