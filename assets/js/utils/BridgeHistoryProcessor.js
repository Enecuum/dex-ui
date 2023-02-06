class BridgeHistoryProcessor {
	constructor() {

    }

    getBridgeHistoryArray() {
        let history = [];
        let lsHistory = localStorage.getItem('bridge_history');
        if (lsHistory !== undefined && lsHistory !== null && (typeof lsHistory === 'string')) {
            let parsedHistory = JSON.parse(lsHistory);
            history = parsedHistory;
        }
        return history
    }

    initiateHistoryStorage(item) {
        localStorage.setItem('bridge_history', JSON.stringify([item]));
    }

    addBridgeHistoryItem(item) {
        let history = this.getBridgeHistoryArray();
        history.push(item);
        localStorage.setItem('bridge_history', JSON.stringify(history));
    }

    getUserHistory(enqExtUserId, web3ExtUserId) {
        let userHistory = [];
        if((enqExtUserId !== undefined && enqExtUserId !== '') ||
            (web3ExtUserId !== undefined && web3ExtUserId !== '')) {
            let rawHistory = this.getBridgeHistoryArray();
            if (rawHistory.length > 0) {
                let web3ExtUserIdFormatted = web3ExtUserId ? web3ExtUserId.toUpperCase() : web3ExtUserId;
                userHistory = rawHistory.filter(function(elem) {
                    return (elem.initiator.toUpperCase().includes(enqExtUserId.toUpperCase()) || elem.initiator.toUpperCase().includes(web3ExtUserIdFormatted)) ? true : false;
                });
            }            
        }
        return userHistory;
    }
}

export default BridgeHistoryProcessor;