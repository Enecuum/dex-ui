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
let swApi = new SwapApi();
window.myCustomFunctionCreateToken = swApi.createToken.bind(swApi);

export default SwapApi;