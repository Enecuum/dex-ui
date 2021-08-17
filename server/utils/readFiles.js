const fs = require("fs")

module.exports = function cReadFiles (filePaths, enc="utf-8") {
    return new Promise((resolve, reject) => {
        if (filePaths.length === 0) {
            resolve(null)
            return
        }
        let filePathObj = filePaths[0]                          // { key: "string" }
        let filePath = filePathObj[Object.keys(filePathObj)[0]] // get string from object
        fs.readFile(filePath, { encoding : enc}, (err, data) => {
            if (err) {
                console.log("Error: can't read file:", filePath, "Info:", err)
                reject()
            } else {
                filePaths.splice(0, 1)
                cReadFiles(filePaths)
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