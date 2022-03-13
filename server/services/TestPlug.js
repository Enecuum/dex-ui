const T_Service = require("../templates/T_Service")

const jsonrpcResponse = require("../utils/jsonrpcResponceCreator")

const dexPools      = require("../testPlugData/dexPools")
const dexTickers    = require("../testPlugData/dexTickers")
const balances      = require("../testPlugData/balanceAll")
const tokensInfo    = require("../testPlugData/tokenInfo")
const networkInfo   = require("../testPlugData/networkInfo")
const nativeToken   = require("../testPlugData/nativeToken")
const stats         = require("../testPlugData/stats")
const dexFarms      = require("../testPlugData/dexFarms")
const contractPriceList = require("../testPlugData/contractPriceList")


class TestPlug extends T_Service {
    constructor(args, config) {
        super(args, config)

        this.serviceType = "tp" // test plug

        this.app.post("/*", (req, res, next) => {
            let urlPath = req.body.params[1]
            let method = urlPath.replace(`/api/${config.api_version}/`, "")

            if (method === "get_dex_pools")
                this.sendDexData(req, res, dexPools)
            else if (method === "get_tickers_all")
                this.sendDexData(req, res, dexTickers)
            else if (method === "network_info")
                this.sendDexData(req, res, networkInfo)
            else if (/.*get_dex_farms.*/.test(method))
                this.sendDexData(req, res, dexFarms)
            else if (/.*balance_all.*/.test(method))
                this.sendDexData(req, res, balances)
            else if (method === "contract_pricelist")
                this.sendDexData(req, res, contractPriceList)
            else if (/.*token_info.*/.test(method)) {
                let hash = method.replace("token_info?hash=", "")
                let tokenInfo = tokensInfo.find(token => token.hash === hash)
                if (tokenInfo)
                    this.sendDexData(req, res, [tokenInfo])
                else
                    this.sendDexData(req, res, [{}])
            } else if (method === "native_token")
                this.sendDexData(req, res, nativeToken)
            else if (method === "stats")
                this.sendDexData(req, res, stats)
            else
                this.sendDexData(req, res, [{}])
        })
    }

    sendDexData (req, res, data) {
        res.send(jsonrpcResponse(req.body.id, true, data, "application/json"))
    }
}

module.exports = TestPlug