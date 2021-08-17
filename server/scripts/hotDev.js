const argv = require("yargs").argv

const config = require("../../config.json")

const RequestsDivisor = require("../services/RequestsDivisor")
const FilesLoader     = require("../services/FileLoader")
const DexDataLoader   = require("../services/DexDataLoader")

const requestsDivisor = new RequestsDivisor({
    root : true,
    port : 1234,
    name : "root"
}, config)
const filesLoader     = new FilesLoader({
    peer: "https://localhost:1234",
    port : 1235,
    name : "file_loader"
}, config)
const dexDataLoader   = new DexDataLoader({
    peer: "https://localhost:1234",
    port : 1236
}, config)
const clientsGate = 1237

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
