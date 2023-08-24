class BridgeHistoryProcessor {
	constructor() {

    }

    fragmentBridgeHistoryToSingleLocks() {
       let history = this.getBridgeHistoryArray();
       if (history.length > 0) {
           let locksArr = this.getBridgeHistoryLocksArray();
           history.forEach(function(itemOfBridgeHistory, index, array) {
               if (itemOfBridgeHistory.hasOwnProperty('lock') && itemOfBridgeHistory.lock?.transactionHash !== undefined) {
                   let txHash = itemOfBridgeHistory.lock.transactionHash;                   
                   let itemIsExistAsSingleLock = locksArr.find(function(singleLockItem) {
                       if (singleLockItem.lock?.transactionHash == txHash)
                           return true
                   });
                   if (itemIsExistAsSingleLock !== undefined) {
                       return
                   } else {
                       localStorage.setItem(`bh_lock_${txHash}`, JSON.stringify(itemOfBridgeHistory));
                   }                   
               }
           });
           localStorage.setItem('bridge_history_archive', JSON.stringify(history));
           localStorage.removeItem('bridge_history');
       }
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

    getBridgeHistoryLocksArray() {
        let locksArr = [];
        for(let key in localStorage) {
            if (key.includes('bh_lock_')) {
                locksArr.push(JSON.parse(localStorage.getItem(key)))
            }
        }
        return locksArr;        
    }

    initiateHistoryStorage(item) {
        localStorage.setItem('bridge_history', JSON.stringify([item]));
    }

    addBridgeHistoryItem(item) {
        let history = this.getBridgeHistoryArray();
        history.push(item);
        localStorage.setItem('bridge_history', JSON.stringify(history));
    }

    getUserHistoryFromTotalArray(enqExtUserId, web3ExtUserId) {
        let userHistory = [];
        if((enqExtUserId !== undefined && enqExtUserId !== '') ||
            (web3ExtUserId !== undefined && web3ExtUserId !== '')) {
            let rawHistory = this.getBridgeHistoryArray();
            if (rawHistory.length > 0) {
                let web3ExtUserIdFormatted = web3ExtUserId ? web3ExtUserId.toUpperCase() : web3ExtUserId;

                userHistory = rawHistory.filter(function(elem) {
                    return (elem.initiator.toUpperCase().includes(enqExtUserId.toUpperCase()) || elem.initiator.toUpperCase().includes(web3ExtUserIdFormatted.toUpperCase())) ? true : false;
                });
            }            
        }
        return userHistory;
    }

    getUserHistory(enqExtUserId, web3ExtUserId) {
        let userHistory = [];
        if ((enqExtUserId !== undefined && enqExtUserId !== '') ||
            (web3ExtUserId !== undefined && web3ExtUserId !== '')) {       
            let lockArr = [];
            let claimEthArr = [];
            let claimInitENQArr = [];
            let claimConfirmENQArr = []; 
            for(let key in localStorage) {
                if (key.includes('bh_lock_')) {
                    lockArr.push(JSON.parse(localStorage.getItem(key)))
                }
                if (key.includes('bh_claim_eth_')) {
                    claimEthArr.push(JSON.parse(localStorage.getItem(key)))
                }
                if (key.includes('bh_claim_init_enq_')) {                    
                    claimInitENQArr.push(JSON.parse(localStorage.getItem(key)))
                }
                if (key.includes('bh_claim_confirm_enq_')) {
                    claimConfirmENQArr.push(JSON.parse(localStorage.getItem(key)))
                }                
            }

            if (claimEthArr.length > 0) {
                claimEthArr.sort(function (a, b) {
                    return a.claimTxTimestamp - b.claimTxTimestamp;
                });
            }

            if (claimInitENQArr.length > 0) {
                claimInitENQArr.sort(function (a, b) {
                    return a.claimInitTxTimestamp - b.claimInitTxTimestamp;
                });
            }

            if (claimConfirmENQArr.length > 0) {
                claimConfirmENQArr.sort(function (a, b) {
                    return a.claimConfirmTxTimestamp - b.claimConfirmTxTimestamp;
                });
            }

            if (lockArr.length > 0) {
                lockArr.sort(function (a, b) {
                    return a.lock.timestamp - b.lock.timestamp;
                });
                userHistory = lockArr;

                lockArr.forEach(function(lock, lockIndex, lockArray){
                    claimEthArr.forEach(function(claim, claimIndex, claimArray){
                        if (lock.hasOwnProperty('validatorRes') && lock.validatorRes?.ticket_hash !== undefined &&
                            claim.hasOwnProperty('validatorRes') && claim.validatorRes?.ticket_hash !== undefined &&
                            lock.validatorRes.ticket_hash === claim.validatorRes.ticket_hash) {
                            lock.claimTxHash = claim.claimTxHash;
                            lock.claimTxTimestamp = claim.claimTxTimestamp;
                            localStorage.setItem(`bh_lock_${lock.lock.transactionHash}`, JSON.stringify(lock));
                        }
                    });
                    claimInitENQArr.forEach(function(claim, claimIndex, claimArray){
                        if (lock.hasOwnProperty('validatorRes') && lock.validatorRes?.ticket_hash !== undefined &&
                            claim.hasOwnProperty('validatorRes') && claim.validatorRes?.ticket_hash !== undefined &&
                            lock.validatorRes.ticket_hash === claim.validatorRes.ticket_hash) {
                            lock.claimInitTxHash = claim.claimInitTxHash;
                            lock.claimInitTxTimestamp = claim.claimInitTxTimestamp;
                            localStorage.setItem(`bh_lock_${lock.lock.transactionHash}`, JSON.stringify(lock));
                        }
                    });
                    claimConfirmENQArr.forEach(function(claim, claimIndex, claimArray){
                        if (lock.hasOwnProperty('validatorRes') && lock.validatorRes?.ticket_hash !== undefined &&
                            claim.hasOwnProperty('validatorRes') && claim.validatorRes?.ticket_hash !== undefined &&
                            lock.validatorRes.ticket_hash === claim.validatorRes.ticket_hash) {
                            lock.claimConfirmTxHash = claim.claimConfirmTxHash;
                            lock.claimConfirmTxTimestamp = claim.claimConfirmTxTimestamp;
                            localStorage.setItem(`bh_lock_${lock.lock.transactionHash}`, JSON.stringify(lock));
                        }
                    });
                });
                userHistory = lockArr;
            } else {
                console.log('Empty locks list')
            }


        }

        return userHistory;
    }
}

export default BridgeHistoryProcessor;