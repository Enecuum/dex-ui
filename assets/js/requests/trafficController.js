// TODO create event listener for avoiding inactivity
// TODO reduce requests

class TrafficController {
    constructor () {
        this.permission = true;
    };

    getBalance (requestData) {
        return this.control(Enecuum.balanceOf, requestData);
    };

    sendTransaction (requestData) {
        return this.control(Enecuum.sendTransaction, requestData);
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
            return new Promise((resolve) => resolve({lock : true}));    
    };
};

let trafficController = new TrafficController();

export default trafficController;