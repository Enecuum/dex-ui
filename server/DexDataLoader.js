const T_Service = require("./templates/T_Service")

const jsonrpcErrors = require("./json-rpc_errors.json")

class DexDataLoader extends T_Service {
    constructor(args, config) {
        super(args, config)

        this.dexUrl = `${config.dex_url}:${config.dex_port}/api/${config.api_version}/`

        this.app.use((req, res, next) => {
            res.setHeader("Content-Type", "application/json")
            res.send(JSON.stringify(this.jsonrpcUtil.makeResponseObject(req.body.id, false, jsonrpcErrors.notIdentified)))
        })
    }

    // loadContractPriceList () {
    //     this.axiosUtil.get(this.dexUrl)
    // }
    //
    // loadTickersInfo () {
    //
    // }
    //
    // loadDexPools () {
    //
    // }

}

module.exports = DexDataLoader