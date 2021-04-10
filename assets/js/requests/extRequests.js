class ExtRequests {    
    getBalance (pubKey, hash) {
        try {
            return Enecuum.balanceOf({
                to : pubKey,
                tokenHash : hash
            });
        } catch (err) {
            return new Promise((resolve, reject) => { reject(err) });
        }
    };
};

export default ExtRequests;