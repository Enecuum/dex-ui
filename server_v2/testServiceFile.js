const argv = require("yargs").argv

const config = require("../config.json")

const T_Service = require("./T_Service")
const service = new T_Service(argv, config)

function run () {
    service.startClientSteps(argv.root)
        .then(res => {
            if (res !== -1) {
                service.startServer()
            }
        })
}

run ()