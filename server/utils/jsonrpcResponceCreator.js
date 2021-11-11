const config = require("../../config.json")

module.exports = function (r_id, result, content, cType) {
    let responseData = (result) ? {
        result : {
            data : content,
            contentType : cType
        }
    }: {
        error : content
    }
    return JSON.stringify({
        jsonrpc : config.version,
        ...responseData,
        id : r_id
    })
}