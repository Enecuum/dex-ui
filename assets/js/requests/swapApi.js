/** 
 *  @fileoverview Minimal amount of API methods.
 */

import config from '../../../config.json';
import trafficController from './trafficController';
import presets from '../../store/pageDataPresets';
class SwapApi {
    constructor () {
        this.url = presets.network.defaultNet.url;
        this.hostUrl = location.href.replace('/#', '/');
    };

    updUrl (url) {
        this.url = url;
        console.log('new network: ' + this.url);
    };

    getFullBalance(pubkey) {
        return trafficController.simpleRequest(`${this.url}api/${config.api_version}/balance_all?id=${pubkey}`,
            {
                method : 'GET'
            }
        );
    };
    getTokens () {
        return trafficController.simpleRequest(`${this.url}api/${config.api_version}/get_tickers_all`,
            {
                method : 'GET'
            }
        );
    };
    getPairs () {
        return trafficController.simpleRequest(`${this.url}api/${config.api_version}/get_dex_pools`,
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
    };

    // ----------------------------------------------------------- dev utils
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
    // ---------------------------------------------------------------------
};

const swapApi = new SwapApi();

// Temporary functional for tests
window.myCustomFunctionCreateToken = swapApi.createToken.bind(swapApi);
window.myCustomFunctionFaucet = swapApi.faucet.bind(swapApi);
// --------------------

export default swapApi;