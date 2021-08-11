const axios = require("axios")


class AxiosUtil {
    constructor (url, httpsAgent) {
        this.options = { httpsAgent : httpsAgent }
        this.url = url
    }

    _chooseUrl (anotherUrl) {
        return (anotherUrl) ? anotherUrl : this.url
    }

    post (data, anotherUrl) {
        return axios.post(this._chooseUrl(anotherUrl), data, this.options)
    }

    get (data, anotherUrl) {
        return axios.get(this._chooseUrl(anotherUrl), this.options)
    }
}

module.exports = AxiosUtil
