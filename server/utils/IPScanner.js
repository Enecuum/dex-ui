const networkInterfaces = require('os').networkInterfaces;
const nets = networkInterfaces();


class IPScanner {
    getHostAddress () {
        for (const name of Object.keys(nets))
            for (const net of nets[name])
                if (net.family === 'IPv4' && !net.internal)
                    return net.address
    }
}

module.exports = IPScanner
