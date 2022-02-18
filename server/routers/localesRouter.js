const express = require("express")
const router  = express.Router()
const path    = require("path")

const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const staticLocales  = {
    en : require(path.resolve(__dirname, "../../public/locales/en/translation.js")),
    ru : require(path.resolve(__dirname, "../../public/locales/ru/translation.js"))
}

router.post('/ru/*', (req, res, next) => {
    res.send(jsonrpcResponse(req.body.id, true, staticLocales.ru, "application/json"))
}).post('/en/*', (req, res, next) => {
    res.send(jsonrpcResponse(req.body.id, true, staticLocales.en, "application/json"))
})

router.post(`/*`, (req, res, next) => {
    res.send(jsonrpcResponse(req.body.id, true, staticLocales.en, "application/json"))
})

module.exports = router