const readline = require("readline")
const express  = require("express")
const crypto   = require("crypto")
const https    = require("https")
const path     = require("path")
const fs       = require("fs")

const JSONRPCUtil = require("./JSONRPCUtil")
const AxiosUtil   = require("./AxiosUtil")
const IPScanner   = require("./IPScanner")


class Service_Client {
    constructor (args, config) {
        this.peer = this._setPeer(args.peer, config)
        this.port = this._setPort(args.port, config)
        this.name = this._setName(args.name)
        this.cnfg = config
        this.app  = express()
        this.rl   = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        this.authToken = null
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
        hash.update(new Date().getTime() + Math.random() * Math.pow(2, 64))
        return `ds_${hash.digest("hex")}`
    }

    _readFiles (filePaths) {
        return new Promise((resolve, reject) => {
            if (filePaths.length === 0) {
                resolve(null)
                return
            }
            let filePathObj = filePaths[0]                          // { key: "string" }
            let filePath = filePathObj[Object.keys(filePathObj)[0]] // get string from object
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.log("Error: can't read file:", filePath, "Info:", err)
                    reject()
                } else {
                    filePaths = filePaths.splice(0, 1)
                    this._readFiles(filePaths)
                        .then(res => {
                            let fileDataObj = { [Object.keys(filePathObj)[0]] : data }
                            if (res === null)
                                resolve(fileDataObj)
                            else
                                resolve({...res, ...fileDataObj})
                        })
                        .catch(() => reject())
                }
            })
        })
    }

    _getTLSRequirements () {
        return new Promise((resolve, reject) => {
            let files = [
                { cert: path.resolve(__dirname, "../https/server.crt") },
                { key: path.resolve(__dirname, "../https/server.key") },
                { ca: path.resolve(__dirname, "../https/ca.crt") }
            ]
            this._readFiles(files)
                .then(filesData => {
                    if (filesData === null) // array 'files' is empty
                        reject()
                    else
                        resolve(filesData)
                })
                .catch(() => reject())
        })
    }

    _sendConnectionRequest (filesData) {
        // filesData - {crt, key, ca}
        this.ipScanner = new IPScanner()
        this.axiosUtil = new AxiosUtil(this.peer,  new https.Agent({
            ...filesData
        }))
        this.jsonrpcUtil = new JSONRPCUtil(this.cnfg, this.peer, this.axiosUtil)
        let ip = this.ipScanner.getHostAddress()
        return this.jsonrpcUtil.execRequest("connect", [ this.name, ip, this.port ])
    }

    _authenticateService (response) {
        return new Promise((resolve, reject) => {
            let data = response.data.result
            if (data && data.auth)
                this.rl.question("Enter passphrase: ", (passphrase) => {
                    this.jsonrpcUtil.execRequest("authentication", [ this.name, passphrase ])
                        .then(res => {
                            this.authToken = res.token
                            this.refreshToken = res.refresh_token
                            resolve()
                        })
                        .catch(err => reject(err))
                })
            else
                reject(response.data.error)
            this.rl.close()
        })
    }

    _connectToService () {
        return new Promise((resolve) => {
            this._getTLSRequirements()
                .then(filesData => {
                    this._sendConnectionRequest(filesData)
                        .then(res => {
                            this._authenticateService(res)
                                .then(() => {
                                    console.log("Service", this.name, "successfully authenticated!")
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
        })
    }

    _checkConfiguration () {
        let netRule = /^https?:\/\/[a-z|0-9]+:[0-9]+/
        if (!netRule.test(this.peer))
            return {
                err : `Error: wrong peer '${this.peer}', url must satisfy the expression '${netRule}'`
            }
        return true
    }

    async startClientSteps () {
        let configReadiness = this._checkConfiguration()
        if (configReadiness.err) {
            console.log(configReadiness.err)
            return
        }
        let connectionStatus = await this._connectToService()
        if (!connectionStatus){
            console.log("Stop service", this.name, "connection")
        }
    }
}

export default Service_Client