module.exports = function cReadFiles (filePaths) {
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
                filePaths.splice(0, 1)
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