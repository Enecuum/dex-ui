class CookieProcessor {
    constructor (pubKey, defaultPath) {
        this._path = defaultPath
        this._pubKey = pubKey
        this._cookieTTL = 1000 * 60 * 60 * 24; // one day
        this._history = this.#filter(document.cookie, pubKey)
    }

    #filter (freshCookie, pubKey) {
        let stringHistory = freshCookie.split(/; ?/);
        let history = {};
        for (let i in stringHistory)
            if (new RegExp(pubKey).test(stringHistory[i])) {
                let keyValue = stringHistory[i].split('=')
                history[keyValue[0]] = keyValue[1]
            }
        return history
    }

    #findNoteByHash (hash) {
        let concatenatedKey = this._pubKey + hash
        return {[concatenatedKey] : this._history[concatenatedKey]}
    }

    #encodeKeyValue (key, value) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(value)
    }

    #buildNewCookie (newValue, options) {
        for (let optionKey in options)
            newValue += `; ${this.#encodeKeyValue(optionKey, options[optionKey])}`
        return newValue;
    }

    #writeCookie (key, value, options={}) {
        options.path = this._path
        if (options.expires !== -1)
            options.expires = (new Date().getTime() + this._cookieTTL).toUTCString()
        let keyValueString = this.#encodeKeyValue(this._pubKey+key, value)
        document.cookie = this.#buildNewCookie(keyValueString, options)
    }

    /* ===================================================================== */

    getAllHistory () {
        return this._history
    }

    getOneNote (txHash) {
        return this.#findNoteByHash(txHash)
    }

    get () {
        return {
            allHistory : this.getAllHistory,
            oneNote : this.getOneNote
        }
    }

    set (key, value) {
        this.#writeCookie(key, value)
    }

    rm (key) {
        this.#writeCookie(key, '', {expires : -1})
    }
}

export default CookieProcessor;