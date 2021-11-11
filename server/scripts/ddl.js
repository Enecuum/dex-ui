const argv = require("yargs").argv

const config = require("../../config.json")

const DexDataLoader = require("../services/DexDataLoader")

const dexDataLoader = new DexDataLoader({
    peer : argv.peer,
    port : argv.port,
    p    : argv.p,
    name : "ddl"
}, config)

let run = function () {
    dexDataLoader.startClientSteps()
        .then(res => {
            if (res !== -1)
                dexDataLoader.startServer()
        })
}

run()