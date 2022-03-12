const path = require("path")
const config = require(path.resolve(__dirname, "../config.json"))

module.exports = {
    launch: {
        headless: process.env.HEADLESS !== "false",
        product: "chrome",
        defaultViewport: null,
        args: [
            "--disable-extensions-except=" + config.test.chromeExtension.path,
            "--load-extension=" + config.test.chromeExtension.path
        ]
    }
}