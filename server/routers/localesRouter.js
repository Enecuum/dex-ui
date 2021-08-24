const express = require("express")
const router  = express.Router()
const path    = require("path")

const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const staticLocales  = {
    en : require(path.resolve(__dirname, "../../public/locales/en/translation.json")),
    ru : require(path.resolve(__dirname, "../../public/locales/ru/translation.json"))
}
const allowedLocales = ["ru", "ru\\-RU", "en", "en\\-US"].reduce((previous, current, index) => previous + "|" + current)

router.post(`/[${allowedLocales}]*`, (req, res, next) => {
    let locale = ""
    if (req.url === "/ru-RU/translation.json" || req.url === "/ru/translation.json") {
        locale = "ru"
    } else if (req.url === "/en-US/translation.json" || req.url === "/en/translation.json") {
        locale = "en"
    }
    res.send(jsonrpcResponse(req.body.id, true, staticLocales[locale], "application/json"))
})

router.post(`/*`, (req, res, next) => {
    res.send(jsonrpcResponse(req.body.id, true, staticLocales.en, "application/json"))
})

module.exports = router