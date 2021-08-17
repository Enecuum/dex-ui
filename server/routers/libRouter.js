const express = require("express")
const router  = express.Router()
const path    = require("path")

const cReadFiles = require("../utils/readFiles")
const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const config = require("../../config.json")

router.post(`/`, (req, res, next) => {
    cReadFiles([{data : path.resolve(__dirname, "../../", config.web3_enq_path)}])
        .then(file => {
            res.send(jsonrpcResponse(req.body.id, true, file.data, "application/javascript"))
        })
})

module.exports = router