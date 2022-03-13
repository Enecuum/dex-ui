const argv = require("yargs").argv

const config = require("../../config.json")

const TestPlug = require("../services/TestPlug")

const testPlug = new TestPlug({
    peer: argv.peer ? argv.peer : "https://localhost:1235",
    port : argv.port ? argv.port : 1238,
    name : argv.name ? argv.name : "test_plug",
    p : argv.p ? argv.p : "root"
}, config)

let run = function () {
    testPlug.startClientSteps().then(res => {
        if (res !== -1)
            testPlug.startServer()
    })
}

run()