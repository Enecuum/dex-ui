/** 
 *  @fileoverview Minimal amount of API methods.
 */

import trafficController from './trafficController';

class SwapApi {
    constructor () {
        this.url = location.href.replace('/#', '/');
        this.hostUrl = this.url;
    };

    updUrl (url) {
        this.url = url;
        console.log(this.url);
    };

    getFullBalance(pubkey) {
        return trafficController.simpleRequest(`${this.url}balance_all?id=${pubkey}`,
            {
                method : 'GET'
            }
        );
    };
    createToken (ticker, emission, pubkey) {
        return trafficController.simpleRequest(`${this.url}create_token`,
            {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body : JSON.stringify({
                    ticker   : ticker,
                    emission : emission,
                    pubkey   : pubkey
                })
            }
        );
    };
    faucet (pubkey, hash, amount) {
        return trafficController.simpleRequest(`${this.url}faucet`, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body : JSON.stringify({
                amount : amount,
                hash   : hash,
                id     : pubkey
            })
        });
    };
    getTokens () {
        return trafficController.simpleRequest(`${this.url}tokens`,
            {
                method : 'GET'
            }
        );
    };
    getPairs () {
        return trafficController.simpleRequest(`${this.url}pools`,
            {
                method : 'GET'
            }
        );
    };
    getLanguage (language) {    // to the host
        return trafficController.simpleRequest(`${this.hostUrl}getLanguage/${language}`,
            {
                method : 'GET'
            }
        );
    };
    getEnqLib () {              // to the host
        return trafficController.simpleRequest(`${this.hostUrl}enqlib`,
            {
                method : 'GET'
            }
        );
    }
};

const swapApi = new SwapApi();

// Temporary functional for tests
window.myCustomFunctionCreateToken = swapApi.createToken.bind(swapApi);
window.myCustomFunctionFaucet = swapApi.faucet.bind(swapApi);
// --------------------

export default swapApi;