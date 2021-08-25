const argv = require("yargs").argv

const config = require("../../config.json")

const FilesLoader = require("../services/FileLoader")

const filesLoader = new FilesLoader({
    peer : argv.peer,
    port : argv.port,
    p    : argv.p,
    name : "fl"
}, config)

let run = function () {
    filesLoader.startClientSteps()
        .then(res => {
            if (res !== -1)
                filesLoader.startServer()
        })
}

run()