const express   = require("express")
const router    = express.Router()
const path      = require("path")

const cReadFiles = require("../utils/readFiles")
const imgDir     = require(path.resolve(__dirname, "../../assets/img/"))

router.get(`/*\.(otf|ttf|png|svg|eot|woff)$`, (req, res, next) => {
    let urlArr = req.url.split("/")
    let file   = urlArr[urlArr.length - 1]
    cReadFiles([{file : path.resolve(imgDir, file)}])
        .then(files => {
            res.setHeader("Content-Type", "text/html")
            res.send(files.file)
        })
        .catch(error => {
            res.setHeader("Content-Type", "text/html")
            res.send("Error occurs while read file")
        })
})

module.exports = router