const readline = require("readline")
const express  = require("express")
const crypto   = require("crypto")
const https    = require("https")
const path     = require("path")
const fs       = require("fs")

const JSONRPCUtil = require("../utils/JSONRPCUtil")
const AxiosUtil   = require("../utils/AxiosUtil")
const IPScanner   = require("../utils/IPScanner")
const cReadFiles   = require("../utils/readFiles")

const serviceType = require("../service_type.json")

let oldConsole = console.log.bind(console)
console.log = (...args) => oldConsole("* ", args)


class Service_Client {
    constructor (args, config) {
        this.rootFlag = args.root
        this.p = args.p
        this.peer = this._setPeer(args.peer, config)
        this.port = this._setPort(args.port, config)
        this.name = this._setName(args.name)
        this.cnfg = config
        this.app  = express()
        this.authToken = null
        this.commonAuthData = {
            hash : "",
            salt : ""
        }

        this.app.use(express.json())
    }

    _validateServiceType (type) {
        if (Object.keys(serviceType).indexOf(type))
            return type
        else
            return null
    }

    _setServiceType (type, config) {
        if (type)
            return this._validateServiceType(type)
        if (config.local_service_type)
            return this._validateServiceType(config.local_service_type)
        return null
    }

    _setPort (port, config) {
        if (port)
            return port
        if (config.local_service_port)
            return config.local_service_port
        return 0 // 'express' auto search
    }

    _setPeer (peer, config) {
        if (peer)
            return peer
        if (config.remote_service_url && config.remote_service_port)
            return `${config.remote_service_url}:${config.remote_service_port}`
        return null
    }


    _setName (name) {
        if (name)
            return name
        return this._generateName()
    }

    _generateName () {
        let hash = crypto.createHash("md5")
        hash.update((new Date().getTime() + Math.random() * Math.pow(2, 64)).toString())
        return `ds_${hash.digest("hex")}`
    }

    _getTLSRequirements () {
        const httpsPath = "../../https/"
        return new Promise((resolve, reject) => {
            let files = [
                { cert : path.resolve(__dirname, httpsPath + "server1.crt") },
                { key : path.resolve(__dirname, httpsPath + "server1.key") },
                { ca : path.resolve(__dirname, httpsPath + "rootCA.crt") }
            ]
            cReadFiles(files)
                .then(filesData => {
                    if (filesData === null) // array 'files' is empty
                        reject()
                    else
                        resolve(filesData)
                })
                .catch((err) => {reject(err)})
        })
    }

    _setNetUtils (filesData) {
        this.axiosUtil = new AxiosUtil(this.peer,  new https.Agent({
            rejectUnauthorized : false,
            ...filesData
        }))
        this.jsonrpcUtil = new JSONRPCUtil(this.cnfg, this.peer, this.axiosUtil)
    }

    _sendConnectionRequest (filesData) {
        // filesData - {crt, key, ca}
        this.ipScanner = new IPScanner()
        this._setNetUtils(filesData)
        let ip = this.ipScanner.getHostAddress()
        return this.jsonrpcUtil.execRequest("connect", [ this.name, ip, this.port, this.serviceType ])
    }

    _executeAuthenticationRequest (resolve, reject, passphrase) {
        this.jsonrpcUtil.execRequest("authentication", [ this.name, passphrase ])
            .then(res => {
                this.authToken = res.token
                this.refreshToken = res.refresh_token
                resolve()
            })
            .catch(err => reject(err))
    }


    _authenticateService (response) {
        return new Promise((resolve, reject) => {
            if (response.auth) {
                if (this.p) {
                    this._executeAuthenticationRequest(resolve, reject, this.p)
                } else if (this.cnfg.passphrase) {
                    this._executeAuthenticationRequest(resolve, reject, this.cnfg.passphrase)
                } else {
                    this.rl.question("Enter passphrase: ", (passphrase) => {
                        this._executeAuthenticationRequest(resolve, reject, passphrase)
                    })
                }
            }
            else
                reject(response)
        })
    }

    _connectToService () {
        return new Promise((resolve) => {
            console.log("_getTLSRequirement")
            this._getTLSRequirements()
                .then(filesData => {
                    console.log("_sendConnectionRequest")
                    this._sendConnectionRequest(filesData)
                        .then(res => {
                            console.log("_authenticateService")
                            this._authenticateService(res)
                                .then(() => {
                                    console.log(`Service -> '${this.name}' <- successfully authenticated!`)
                                    resolve(true)
                                })
                                .catch(err => {
                                    console.log(err)
                                    resolve(false)
                                })
                        })
                        .catch(err => {
                            console.log(err)
                            resolve(false)
                        })
                })
                .catch(err => console.log(err))
        })
    }

    _checkConfiguration () {
        let netRule = /^https?:\/\/[0-9|a-z|\.]+:[0-9]+/
        if (!netRule.test(this.peer))
            return {
                err : `Error: wrong peer '${this.peer}', url must satisfy the expression '${netRule}'`
            }
        return true
    }

    _countPassphraseHash (passphrase) {
        let passphraseHash, saltLength = this.commonAuthData.salt.length
        passphrase = passphrase.toString()

        const cycles = 2
        let offset = saltLength / cycles
        for (let i = 0; i < cycles; ) {
            let hash = crypto.createHash("md5")
            hash.update(passphrase + this.commonAuthData.salt.substring(i * offset, ++i * offset - 1))
            passphraseHash = hash.digest("hex")
        }
        return passphraseHash
    }

    _generateSalt () {
        this.commonAuthData.salt = crypto.createHash("md5").update(new Date().getTime().toString()).digest("hex")
    }

    _handlePassphrase () {
        return new Promise(resolve => {
            if (this.p) {
                this.commonAuthData.hash = this._countPassphraseHash(this.p)
                resolve()
            } else if (this.cnfg.passphrase) {
                this.commonAuthData.hash = this._countPassphraseHash(this.cnfg.passphrase)
                resolve()
            } else
                this.rl.question("Create root passphrase: ", (passphrase) => {
                    this.commonAuthData.hash = this._countPassphraseHash(passphrase)
                    resolve()
                })
        })
    }

    async startClientSteps () {
        let configReadiness = this._checkConfiguration()
        if (configReadiness.err) {
            console.log(configReadiness.err)
            return -1
        }
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        if (!this.rootFlag) {
            this.connectionStatus = await this._connectToService()
            if (!this.connectionStatus)
                console.log(`Stop service connection: service name -> '${this.name}'`)
        } else {
            this._generateSalt()
            await this._handlePassphrase()
            this._getTLSRequirements()
                .then(filesData => this._setNetUtils(filesData))
        }

        // crutch - i don't know "why?", but in "hotDev.js" you mustn't use config or args for passphrase (asynchronous things)
        // type passphrase in console when you run all services without isolated docker containers
        // this.rl.close()
    }
}

module.exports = Service_Client
