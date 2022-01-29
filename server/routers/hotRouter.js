const express = require("express")
const router  = express.Router()
const path    = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const webpack_config = require("../../webpack.config")()
const pubDir         = webpack_config.output.path

const entries = Object.keys(webpack_config.entry)
const hotChunkNames = hotUpdateNames(webpack_config.output.hotUpdateChunkFilename)
const hotMainNames = hotUpdateNames(webpack_config.output.hotUpdateMainFilename)

function hotUpdateNames (hotUpdateTemplate) {
    return entries.map(el => {
        return `/${hotUpdateTemplate.replace("[runtime]", el)}`
    })
}

router.post(`/*`, (req, res, next) => {
    let filePath = (req.baseUrl + req.url).replace("_", entries[0])
    if (hotChunkNames.includes(filePath)) {
        let hotPath = path.join(pubDir, filePath)
        cReadFiles([{data: hotPath}])
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "application/javascript"))
            })
    } else if (hotMainNames.includes(filePath)) {
        let hotPath = path.join(pubDir, filePath)
        cReadFiles([{data: hotPath}])
            .then(file => {
                res.send(jsonrpcResponse(req.body.id, true, file.data, "application/json"))
            })
    }
})

module.exports = router