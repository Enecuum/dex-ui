const axios = require('axios');
const argv = require('yargs').argv;
const config = require('../config.json');
const ObjectFromData = require('../web-enq/packages/web-enq-utils/src/objectFromData');
const objectFromData = new ObjectFromData();

BigInt.prototype.toJSON = function () {
    return this.toString();
};

class IdManager {
    constructor () {
        this.idBorder = 2**32;
        this.timeBorder = 60 * 60 * 1000;
        this.lastId = config.lat_request_id;
        this.type = {
            REQUEST : 'request',
            DONE : 'done'
        };
        this.ids = [];
    };

    createRequestId () {
        if (this.lastId > this.idBorder)
            this.lastId = 0;
        this.ids.push({
            id : ++this.lastId,
            date : new Date(),
            type : this.type.REQUEST
        });
        return this.lastId;
    };

    completeRequestId (id) {
        this.ids = this.ids.map(el => {
            if (el.id == id)
                el.type = this.type.DONE;
            return el;
        });
    };

    deleteOldRequests () {
        this.ids = this.ids.map(el => {
            if (new Date() - el.date < this.timeBorder)
                return el;
        });
    };
};

class TransferPoint {
    constructor () {
        this.args = ['host_port', 'dex_url', 'dex_port']; // p - dex port, u - dex url, hp - host port
        this.config = this.setConfig({...config});
        this.idManager = new IdManager();
    };

    setConfig (config) {
        for (let arg of this.args)
            config[arg] = (argv[arg] !== undefined) ? argv[arg] : config[arg];
        return config;
    };

    sendRequest (method, data) {
        console.log({
            jsonrpc : config.json_rcp_version,
            method : method,
            id : this.idManager.createRequestId(),
            params : data
        });
        return axios.post(`${this.config.dex_url}:${this.config.dex_port}/${this.config.api_version}`, {
            jsonrpc : config.json_rcp_version,
            method : method,
            id : this.idManager.createRequestId(),
            params : data
        });
    };

    parseData (data) {
        return objectFromData.parse(data);
    };
 
    transferRequest (reqData) {
        return new Promise((resolve, reject) => {
            let data = this.parseData(reqData.data);
            reqData.data = data.parameters;
            this.sendRequest(data.type, reqData)
            .then(res => {
                this.idManager.completeRequestId(res.data.id);
                this.idManager.deleteOldRequests();
                console.log(res.data);
                resolve({
                    err : res.data.error,
                    result : res.data.result
                });
            }, error => {
                console.log(error);
                reject({ error : `Internal server error: ${error}` });
            });
        });
    };
};

module.exports = TransferPoint;