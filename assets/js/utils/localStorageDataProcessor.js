class LocalStorageDataProcessor {
    constructor (pubKey, net) {
        this._pubKey = pubKey
        this._net = net
        this._txTTL = 1000 * 60 * 60 * 24 // one day
    }

    updNet (net) {
        this._net = net
    }

    updPubKey (pubkey) {
        this._pubKey = pubkey
    }

    _getObjectData (concatenatedKey) {
        try {
            return JSON.parse(localStorage.getItem(concatenatedKey))
        } catch (e) {
            return null
        }
    }

    _isFreshTx (data) {
        try {
            return data.date > (new Date).getTime() - this._txTTL
        } catch (e) {
            return null
        }
    }

    _getHistory () {
        let keys = Object.keys(localStorage)
        let validKeys = keys.filter(key => (new RegExp(`^${this._pubKey}[a-z|0-9]{64}$`)).test(key))

        return validKeys.reduce((history, concatenatedKey) => {
            let data = this._getObjectData(concatenatedKey)
            if (this._isFreshTx(data)) {
                if (data.net === this._net)
                    history[concatenatedKey.substring(this._pubKey.length)] = data
            } else {
                this._removeNote(concatenatedKey, true)
            }
            return history
        }, {})
    }

    _getNote (txHash) {
        let data = this._getObjectData(this._pubKey + txHash)
        if (this._isFreshTx(data)) {
            if (data.net === this._net)
                return {[txHash]: data}
        } else {
            this._removeNote(txHash)
        }
        return null
    }

    _writeNewNote (txHash, status, txType, interpolateParams) {
        localStorage.setItem(this._pubKey + txHash, JSON.stringify({
            status : Number(status),
            type : txType,
            interpolateParams : interpolateParams,
            date : (new Date).getTime(),
            net  : this._net,
        }))
    }

    _writeNonHistoricalData (key, value, withoutPubKey=false) {
        let pubkey = withoutPubKey ? "" : this._pubKey
        localStorage.setItem(pubkey + key, value)
    }

    _getNonHistoricalData (key, withoutPubKey=false) {
        let pubkey = withoutPubKey ?  "" : this._pubKey
        return localStorage.getItem(pubkey + key)
    }

    _removeNote (txHash, concatenated) {
        if (concatenated)
            localStorage.removeItem(txHash)
        else
            localStorage.removeItem(this._pubKey + txHash)
    }

    _removeHistory () {
        let history = this._getHistory()
        Object.keys(history).forEach(hash => {
            if (history[hash].status != 0)
                this._removeNote(hash)
        })
    }
}

const lsdp = new LocalStorageDataProcessor()

lsdp.write  = lsdp._writeNewNote.bind(lsdp)
lsdp.remove = {
    history : lsdp._removeHistory.bind(lsdp),
    note    : lsdp._removeNote.bind(lsdp)
}
lsdp.get    = {
    history : lsdp._getHistory.bind(lsdp),
    note    : lsdp._getNote.bind(lsdp)
}
lsdp.simple = {
    write : lsdp._writeNonHistoricalData.bind(lsdp),
    get : lsdp._getNonHistoricalData.bind(lsdp)
}

export default lsdp