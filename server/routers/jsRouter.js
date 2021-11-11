const express = require("express")
const router  = express.Router()
const path    = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const webpack_config = require("../../webpack.config")
const config         = require("../../config.json")
const bundleName     = webpack_config.output.filename
const pubDir         = webpack_config.output.path

router.post(`/*`, (req, res, next) => {
    if (req.baseUrl === `/${bundleName}`) {
        cReadFiles([{data: path.resolve(pubDir, bundleName)}])
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "application/javascript"))
            })
    } else if (req.baseUrl === `/enqlib`) {
        cReadFiles([{data : path.resolve(__dirname, "../../", config.web3_enq_path)}])
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "application/javascript"))
            })
    } else {
        res.redirect(307, `/${bundleName}`)
    }
})

module.exports = router