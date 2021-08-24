const argv = require("yargs").argv

const config = require("../../config.json")

const RequestsDivisor = require("../services/RequestsDivisor")

const requestsDivisor = new RequestsDivisor({
    root : true,
    port : argv.port,
    name : "rd(root)"
}, config)
console.log(argv)
let run = function () {
    requestsDivisor.startClientSteps()
        .then(res => {
            if (res !== -1)
                requestsDivisor.startServer()
            requestsDivisor.startClientsRequestsHandler(argv.o_port)
        })
}

// o_port - port for the client request server
// port - port for the internal command server
run()