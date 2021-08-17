const express = require("express")
const router  = express.Router()
const path    = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const webpack_config = require("../../webpack.config")
const bundleName     = webpack_config.output.filename
const pubDir         = webpack_config.output.path

router.post(`/*`, (req, res, next) => {
    if (req.url === `/${bundleName}`) {
        cReadFiles([{data : path.resolve(pubDir, bundleName)}])
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "application/javascript"))
            })
    } else {
        res.redirect(307, req.baseUrl + `/${bundleName}`)
    }
})

module.exports = router