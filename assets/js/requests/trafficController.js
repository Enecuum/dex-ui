class TrafficController {
    constructor () {
        this.permission = true;
        this.timeout = 60 * 1000;
        this.timeoutDescriptor = this.createTimeout();
        this.establishListener();
    };

    establishListener () { // inactivity controller
        document.addEventListener('mousemove', event => {
            clearTimeout(this.timeoutDescriptor);
            this.permission = true;
            this.timeoutDescriptor = this.createTimeout();
        });
    };

    createTimeout () {
        return setTimeout(() => {
            this.permission = false;
        }, this.timeout);
    };

    getBalance (requestData) {
        return this.control(ENQweb3lib.balanceOf, requestData);
    };

    sendTransaction (requestData) {
        return this.control(ENQweb3lib.sendTransaction, requestData);
    };

    simpleRequest (url, requestData) {
        return this.control(fetch, requestData, url);
    };

    control (reqFunc, reqData, url) {
        if (this.permission)
            if (url)
                return reqFunc(url, reqData);
            else
                return reqFunc(reqData);
        else
            return new Promise((resolve) => resolve({ lock : true }));  
    };
};

let trafficController = new TrafficController();

export default trafficController;