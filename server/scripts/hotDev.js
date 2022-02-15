const argv = require("yargs").argv

const config = require("../../config.json")

const RequestsDivisor = require("../services/RequestsDivisor")
const FilesLoader     = require("../services/FileLoader")
const DexDataLoader   = require("../services/DexDataLoader")

const clientsGate = config.dex_port
const requestsDivisor = new RequestsDivisor({
    root : true,
    port : 1235,
    // name : "root", use webpack development mode
    p : "root"
}, config)
const filesLoader     = new FilesLoader({
    peer: "https://localhost:1235",
    port : 1236,
    name : "file_loader",
    p : "root"
}, config)
const dexDataLoader   = new DexDataLoader({
    peer: "https://localhost:1235",
    port : 1237,
    p : "root"
}, config)

function startService (service) {
    return new Promise((resolve => {
        service.startClientSteps()
            .then(res => {
                if (res !== -1) {
                    service.startServer()
                }
                resolve()
            })
    }))
}

function raiseService (services) {
    if (services.length === 0)
        return
    let service = services[0]
    services.splice(0, 1)
    startService(service)
        .then(() => raiseService(services))
}

function run () {
    startService(requestsDivisor)
        .then(() => {
            requestsDivisor.startClientsRequestsHandler(clientsGate)
            let servicesToRaise = [filesLoader, dexDataLoader]
            raiseService(servicesToRaise)
        })
}

run ()
