class CookieProcessor {
    constructor (pubKey, defaultPath) {
        this._path = defaultPath
        this._pubKey = pubKey
        this._cookieTTL = 1000 * 60 * 60 * 24; // one day
        this._history = this._filter(document.cookie, pubKey)
    }

    _filter (freshCookie, pubKey) {
        let stringHistory = freshCookie.split(/; ?/);
        let history = {};
        for (let i in stringHistory)
            if (new RegExp(pubKey).test(stringHistory[i])) {
                let keyValue = stringHistory[i].split('=')
                history[keyValue[0]] = keyValue[1]
            }
        return history
    }

    _findNoteByHash (hash) {
        let concatenatedKey = this._pubKey + hash
        let result = this._history[concatenatedKey];
        if (result === undefined)
            return result;
        return {[concatenatedKey] : this._history[concatenatedKey]}
    }

    _encodeKeyValue (key, value) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(value)
    }

    _buildNewCookie (newValue, options) {
        for (let optionKey in options)
            newValue += `; ${this._encodeKeyValue(optionKey, options[optionKey])}`
        return newValue;
    }

    _writeCookie (key, value, options={}) {
        options.path = this._path
        if (options.expires != -1)
            options.expires = new Date((Date.now() + this._cookieTTL)).toUTCString()
        let keyValueString = this._encodeKeyValue(this._pubKey+key, value)
        document.cookie = this._buildNewCookie(keyValueString, options)
    }

    _getAllHistory () {
        return this._history
    }

    _getOneNote (txHash) {
        return this._findNoteByHash(txHash)
    }

    /* ===================================================================== */

    /**
     * Get: all - all notes are linked with your account, note - one note (by tx hash)
     * @returns {{all: any, note: any}}
     */
    get () {
        this._history = this._filter(document.cookie, this._pubKey)
        return {
            all  : this._getAllHistory.bind(this),
            note : this._getOneNote.bind(this)
        }
    }

    /**
     * Set or update key=value pair
     * @param key - transaction hash
     * @param value - transaction status (0 - pending, 1 - duplicated, 2 - rejected, 3 - successful)
     */
    set (key, value) {
        this._writeCookie(key, value)
    }

    /**
     * Remove key=value pair by transaction's hash
     * @param key - transaction hash
     */
    rm (key) {
        this._writeCookie(key, '', {expires : -1})
    }
}

export default CookieProcessor;