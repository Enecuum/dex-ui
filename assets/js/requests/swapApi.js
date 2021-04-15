/** 
 *  @fileoverview Minimal amount of API methods.
 */

class SwapApi {
    constructor () {
        this.url = location.href.replace('/#', '/');
    }

    createToken (ticker, emission, pubkey) {
        return fetch(`${this.url}create_token`,
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
        return fetch(`${this.url}faucet`, {
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
        return fetch(`${this.url}tokens`,
            {
                method : 'GET'
            }
        );
    };
    getPairs () {
        return fetch(`${this.url}pools`,
            {
                method : 'GET'
            }
        );
    };
    getLanguage (language) {
        return fetch(`${this.url}getLanguage/${language}`,
            {
                method : 'GET'
            }
        );
    };
    getEnqLib () {
        return fetch(`${this.url}enqlib`,
            {
                method : 'GET'
            }
        );
    };
};

// Temporary functional for tests
let swApi = new SwapApi();
window.myCustomFunctionCreateToken = swApi.createToken.bind(swApi);
window.myCustomFunctionFaucet = swApi.faucet.bind(swApi);
// --------------------

export default SwapApi;