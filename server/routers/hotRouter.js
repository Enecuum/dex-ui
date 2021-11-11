const express = require("express")
const router  = express.Router()
const path    = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const webpack_config = require("../../webpack.config")
const pubDir         = webpack_config.output.path

router.post(`/*`, (req, res, next) => {
    if (req.baseUrl + req.url === `/${webpack_config.output.hotUpdateChunkFilename}`) {
        let hotPath = path.join(pubDir, webpack_config.output.hotUpdateChunkFilename)
        cReadFiles([{data: hotPath}])
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "application/javascript"))
            })
    } else if (req.baseUrl + req.url === `/${webpack_config.output.hotUpdateMainFilename}`) {
        let hotPath = path.join(pubDir, webpack_config.output.hotUpdateMainFilename)
        cReadFiles([{data: hotPath}])
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "application/json"))
            })
    }
})

module.exports = router