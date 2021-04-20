/** 
 *  @fileoverview Minimal amount of API methods.
 */

import trafficController from './trafficController';

class SwapApi {
    constructor () {
        this.url = location.href.replace('/#', '/');
    };

    updUrl (url) {
        this.url = url;
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
    getltData (pubkey) {
        return trafficController.simpleRequest(`${this.url}lt_data?id=${pubkey}`,
            {
                method : 'GET'
            }
        );
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
    getLanguage (language) {
        return trafficController.simpleRequest(`${this.url}getLanguage/${language}`,
            {
                method : 'GET'
            }
        );
    };
    getEnqLib () {
        return trafficController.simpleRequest(`${this.url}enqlib`,
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