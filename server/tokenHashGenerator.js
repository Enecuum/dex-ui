const crypto = require('crypto');

function createTokenHash(pubkey) {
    let hash = crypto.createHash('md5');
    hash.update(pubkey + new Date().getTime() + Math.random() * Math.pow(2, 64));
    return hash.digest('hex');
};

module.exports = {
    createTokenHash : createTokenHash
};