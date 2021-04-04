const os = require('os');
const net_ifaces = os.networkInterfaces();

const filters = {
    FULL : 'without filters',
    NOTHING : 'without logs',
    ERRORS : 'only errors'
};

class LogsCreator {
    constructor (url, mode) {
        this.url = url;
        this.div = {
            bold : '\n============================================================\n',
            thin : '\n------------------------------------------------------------\n'
        };
        this.mode = (mode) ? mode : filters.FULL;
        this.startMessage();
    };

    // ------------------------------- utils

    log (text, header) {
        if (this.mode != filters.NOTHING) {
            let prefix = (header) ? '' : '    ';
            console.log(prefix + text);
        }
    };

    isValidFamily (family) {
        const validFamilies = ['IPv4', 'IPv6'];
        return (validFamilies.indexOf(family) == -1) ? false : true;
    };

    getNetProps () {
        let nets = Object.keys(net_ifaces);
        for (let netName of nets) {
            let iface = net_ifaces[netName].find(iface => {
                if (net_ifaces[netName].length <= 2 && netName.toLowerCase().indexOf('virtual') == -1)
                    if (this.isValidFamily(iface.family) && !iface.internal)
                        return iface;
            });
            if (iface)
                return iface;
        };
    };

    getDate () {
        return `Time: ${new Date()}`;
    };

    getDivisor (bold) {
        return (bold) ? this.div.bold : this.div.thin;
    };

    // ------------------------------- messages

    startMessage () {
        let netProps = this.getNetProps();
        this.log(this.getDivisor(true));
        this.log(`Run transfer point`, true);
        this.log(`IP - ${netProps.address}`, true);
        this.log(`MAC - ${netProps.mac}`, true);
        this.log(`Remote server: ${this.url}`, true);
        this.log(`Message filter: ${this.mode}`, true);
        this.log(this.getDivisor(true));
    };

    printMsgHead () {
        this.log(this.getDate());
    };

    err (err) {
        this.printMsgHead();
        this.log(`Error: ${err}`);
        this.log(this.getDivisor());
    };

    msg (msg) {
        if (this.mode != filters.ERRORS) {
            this.printMsgHead();
            this.log(`Message: ${msg}`);
        }
    };
};

module.exports = {
    LogsCreator,
    filters
};
