const axios = require('axios');
const argv = require('yargs').argv;
const config = require('../config.json');

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
    constructor() {
        this.args = ['host_port', 'dex_url', 'dex_port']; 
        this.config = this.setConfig({ ...config });
        this.idManager = new IdManager();
    };

    setConfig(config) {
        for (let arg of this.args)
            config[arg] = (argv[arg] !== undefined) ? argv[arg] : config[arg];
        return config;
    };

    parseData(data) {
        return objectFromData.parse(data);
    };

    sendRequest(method, data) {
        let txData = {
            jsonrpc: config.json_rcp_version,
            method: method,
            id: this.idManager.createRequestId()
        };
        if (data)
            txData.params = data;

        logsCreator.msg(JSON.stringify(txData));

        return axios.post(`${this.config.dex_url}:${this.config.dex_port}/${this.config.api_version}`, txData);
    };

    transferRequest(reqData, straightRequest) { 
        // straightRequest - request without using the extention
        // request like "GET/ tokens" and "GET/ pools"
        return new Promise((resolve, reject) => {
            let data = {};
            if (straightRequest) {
                data.type = reqData;
                reqData = undefined;
            } else {
                reqData = reqData[0];
                data = this.parseData(reqData.data);
                reqData.data = data.parameters;
            }
            this.sendRequest(data.type, reqData)
            .then(res => {
                this.idManager.completeRequestId(res.data.id);
                this.idManager.deleteOldRequests();
                if (straightRequest) {
                    let response = res.data;
                    resolve((response.result) ? response.result : response.error);
                } else {
                    resolve({
                        err: res.data.error,
                        result: res.data.result
                    });
                }
            }, error => {
                logsCreator.err(error);
                reject({ error: `Internal server error: ${error}` });
            });
        });
    };
};

module.exports = TransferPoint;