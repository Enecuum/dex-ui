const express = require("express")
const router  = express.Router()

const webpack_config = require("../../webpack.config")
const pubDir         = webpack_config.output.path

router.get(`/*`, (req, res, next) => {
    if (req.baseUrl === "/index.html") {
        res.render(pubDir + "index.html", {title: "Enex"})
    } else {
        res.redirect(301, "/index.html'")
    }
})

module.exports = router