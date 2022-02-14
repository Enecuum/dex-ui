const express = require("express")
const router  = express.Router()
const path    = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const webpack_config = require("../../webpack.config")()
const config         = require("../../config.json")
const pubDir         = webpack_config.output.path

const entries = Object.keys(webpack_config.entry)
const bundles = bundleNames(webpack_config.output.filename)

function bundleNames (hotUpdateTemplate) {
    return entries.map(el => {
        return `/${hotUpdateTemplate.replace("[name]", el)}`
    })
}

router.post(`/*`, (req, res, next) => {
    let filePath = req.baseUrl + req.url
    if (/* bundles.includes(filePath) */ /^\/js\/enex\..+\.js$/.test(filePath)) {
        cReadFiles([{data: path.join(pubDir, req.baseUrl, req.url)}])
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "application/javascript"))
            })
    } else if (req.baseUrl === `/enqlib`) {
        cReadFiles([{data : path.resolve(__dirname, "../../", config.web3_enq_path)}])
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "application/javascript"))
            })
    } else {
        res.redirect(307, `/enex.app.js`)
    }
})

module.exports = router