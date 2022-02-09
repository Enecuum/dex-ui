const express = require("express")
const router  = express.Router()
const path    = require("path")

const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const staticLocales  = {
    en : require(path.resolve(__dirname, "../../public/locales/en/translation.js")),
    ru : require(path.resolve(__dirname, "../../public/locales/ru/translation.js"))
}
const allowedLocales = ["ru", "ru\\-RU", "en", "en\\-US"].reduce((previous, current, index) => previous + "|" + current)

router.post(`/[${allowedLocales}]*`, (req, res, next) => {
    let locale = ""
    if (req.url === "/ru-RU/translation.js" || req.url === "/ru/translation.js") {
        locale = "ru"
    } else if (req.url === "/en-US/translation.js" || req.url === "/en/translation.js") {
        locale = "en"
    }
    res.send(jsonrpcResponse(req.body.id, true, staticLocales[locale], "application/json"))
})

router.post(`/*`, (req, res, next) => {
    res.send(jsonrpcResponse(req.body.id, true, staticLocales.en, "application/json"))
})

module.exports = router