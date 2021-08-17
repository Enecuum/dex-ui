const express = require("express")
const router  = express.Router()

const webpack_config = require("../../webpack.config")
const bundleName     = webpack_config.output.filename
const pubDir         = webpack_config.output.path

router.get(`/${bundleName}`, (req, res, next) => {
    res.render(pubDir + bundleName)
})

module.exports = router