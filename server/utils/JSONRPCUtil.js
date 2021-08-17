class RequestsManager {
    constructor (config) {
        this.idBorder = 2 ** 32
        this.timeBorder = 60 * 60 * 1000
        this.lastId = config.last_request_id
        this.type = {
            PENDING: 'pending',
            DONE: 'done',
            ERR: 'error'
        }
        this.requests = []
    }

    createRequestNote (data) {
        if (this.lastId > this.idBorder)
            this.lastId = 0;
        this.requests.push({
            id: ++this.lastId,
            date: new Date(),
            type: this.type.PENDING,
            data: data
        })
        return this.lastId
    }

    completeRequest (id, success) {
        this.requests = this.requests.map(el => {
            if (el.id === id)
                el.type = (success) ? this.type.DONE : this.type.ERR
            return el;
        });
    }

    deleteOldRequests () {
        this.requests = this.requests.map(el => {
            if (new Date() - el.date < this.timeBorder)
                return el;
        });
    }

    getInfo () {
        return this.requests
    }
}

class JSONRPCUtil {
    constructor (config, url, axiosUtil) {
        this.requestsManager = new RequestsManager(config)
        this.clearSeconds = 5
        this.version = config.json_rcp_version
        this.axiosUtil = axiosUtil
        this.url = url
        this._clearCycle()
    }

    _clearCycle () {
        setInterval(() => {
            this.requestsManager.deleteOldRequests()
        }, this.clearSeconds * 1000)
    }

    _isError (res) {
        return res.data.error !== undefined
    }

    isValidJSONRPCRequest (body) {
        const requiredFields = ["method", "params", "id"]
        let bodyProps = Object.keys(body)
        if (!bodyProps.length)
            return false
        return bodyProps.every(el => {
            return requiredFields.indexOf(el) !== -1
        })
    }

    makeResponseObject (r_id, result, data) {
        return {
            jsonrpc : this.version,
            [result ? "result" : "error"] : data,
            id : r_id
        }
    }

    execRequest (method, params, anotherUrl) {
        return new Promise((resolve, reject) => {
            let data = {
                method : method,
                params : params
            }
            let id = this.requestsManager.createRequestNote(data)
            this.axiosUtil.post({
                jsonrpc : this.version,
                ...data,
                id : id
            }, anotherUrl)
                .then(res => {
                    this.requestsManager.completeRequest(res.data.id)
                    if (this._isError(res))
                        reject(res.data.error)
                    else
                        resolve(res.data.result)
                })
                .catch(err => {
                    console.log(err)
                    reject()
                })
        })
    }
}

module.exports = JSONRPCUtil
