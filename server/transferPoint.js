const axios = require('axios');
const config = require('../config.json');
const tokenHashGen = require('./tokenHashGenerator');

const ObjectFromData = require('../web-enq/packages/web-enq-utils/src/objectFromData');
const objectFromData = new ObjectFromData();
const { LogsCreator, filters } = require('./logsCreator');
const logsCreator = new LogsCreator(config.dex_url, filters.FULL);

BigInt.prototype.toJSON = function () {
    return this.toString();
};

class IdManager {
    constructor() {
        this.idBorder = 2 ** 32;
        this.timeBorder = 60 * 60 * 1000;
        this.lastId = config.lat_request_id;
        this.type = {
            REQUEST: 'request',
            DONE: 'done'
        };
        this.ids = [];
    };

    createRequestId() {
        if (this.lastId > this.idBorder)
            this.lastId = 0;
        this.ids.push({
            id: ++this.lastId,
            date: new Date(),
            type: this.type.REQUEST
        });
        return this.lastId;
    };

    completeRequestId(id) {
        this.ids = this.ids.map(el => {
            if (el.id == id)
                el.type = this.type.DONE;
            return el;
        });
    };

    deleteOldRequests() {
        this.ids = this.ids.map(el => {
            if (new Date() - el.date < this.timeBorder)
                return el;
        });
    };
};

class TransferPoint {
    constructor (argv) {
        this.args = ['host_port', 'dex_url', 'dex_port']; 
        this.config = this.setConfig({ ...config }, argv);
        this.idManager = new IdManager();
    };

    setConfig (config, argv) {
        for (let arg of this.args)
            config[arg] = (argv[arg] !== undefined) ? argv[arg] : config[arg];
        return config;
    };

    parseData (data) {
        return objectFromData.parse(data);
    };

    sendRequest (method, data) {
        let txData = {
            jsonrpc: config.json_rcp_version,
            method: method,
            id: this.idManager.createRequestId()
        };
        if (data)
            txData.params = this.objToArray(data, method);
        logsCreator.msg(JSON.stringify(txData));
        return axios.post(`${this.config.dex_url}:${this.config.dex_port}/${this.config.api_version}`, txData);
    };

    createToken (ticker, emission, pubkey) {
        return new Promise((resolve, reject) => {
            this.sendRequest('create_token', {
                hash     : tokenHashGen.createTokenHash(pubkey),
                ticker   : ticker,
                emission : (emission) ? emission : 0
            })
            .then(res => {
                logsCreator.msg(JSON.stringify(res.data));
                resolve(res);
            },
            err => {
                logsCreator.err(err);
                reject(err);
            })
        });
    };

    faucet (id, hash, amount) {
        return new Promise((resolve, reject) => {
            this.sendRequest('fauset', {
                id : id,
                hash : hash,
                amount : amount
            })
            .then(res => {
                logsCreator.msg(JSON.stringify(res.data));
                resolve(res);
            },
            err => {
                logsCreator.err(err);
                reject(err);
            })
        });
    };

    handleRequest (req, responseRule) {
        return new Promise((resolve, reject) => {
            this.idManager.deleteOldRequests();
            this.sendRequest(req.type, req.data)
            .then(res => {
                resolve(responseRule(res));
                this.idManager.completeRequestId(res.data.id);
                logsCreator.msg(JSON.stringify(res.data));
            },
            error => {
                logsCreator.err(error);
                reject({ error: `Internal server error: ${error}` });
            });
        });
    };

    filterData (req) {
        req = (Array.isArray(req)) ? req[0] : req;
        if (req.data.type == 'user_balance') {
            req.type = req.data.type;
            req.data = req.data.params;
            return req;
        }
        if (req.data != 0) {
            let data = this.parseData(req.data);
            req.data = data.parameters;
            req.type = data.type;
            req.data.from = req.from;
        } else
            req.data = undefined;
        return req;
    };

    straightRequest (type) {
        let req = {
            type : type
        };
        return this.handleRequest(req, res => {
            let response = res.data;
            return (response.result) ? response.result : response.error;
        });
    };

    transferRequest (req) {
        req = this.filterData(req);
        return this.handleRequest(req, res => {
            return {
                err: res.data.error,
                result: res.data.result
            };
        });
    };

    objToArray (obj, method) {
        if (method == 'create_pool' || method == 'add_liquidity') {
            return [obj.from, obj.asset_1, obj.amount_1, obj.asset_2, obj.amount_2];
        } else if (method == 'swap') {
            return [obj.from, obj.asset_in, obj.amount_in, obj.asset_out];
        } else if (method == 'remove_liquidity') {
            return [obj.from, obj.lt, obj.amount];
        } else if (method == 'user_balance'){
            return [obj.id]
        } else if (method == 'create_token') {
            return [obj.hash, obj.ticker, obj.emission];
        } else if (method == 'fauset') {
            return [obj.id, obj.hash, obj.amount];
        } else {
            return [];
        }
    };
};

module.exports = TransferPoint;