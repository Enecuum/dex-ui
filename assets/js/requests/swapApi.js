 /**
 *  @fileoverview Minimal amount of API methods.
 */

import config from '../../../config.json';
import trafficController from './trafficController';
import presets from '../../store/pageDataPresets';

class SwapApi {
    constructor () {
        this.url = presets.network.defaultNet.url;
        this.hostUrl = location.href.replace(/#.*/, '');
    };

    updUrl (url) {
        this.url = url;
    };

    tx (hash) {
        return trafficController.simpleRequest(`${this.url}api/${config.api_version}/tx?hash=${hash}`,
            {
                method : 'GET'
            }
        );
    };
    pendingTxAccount (pubkey) {
        return trafficController.simpleRequest(`${this.url}api/${config.api_version}/pending_tx_account?id=${pubkey}`,
            {
                method : 'GET'
            }
        );
    };
    getNativeTokenData () {
        return trafficController.simpleRequest(`${this.url}api/${config.api_version}/network_info`,
            {
                method : 'GET'
            }
        );
    }
    getTokenInfo (hash) {
        return trafficController.simpleRequest(`${this.url}api/${config.api_version}/token_info?hash=${hash}`,
            {
                method : 'GET'
            }
        );
    };
    getFullBalance (pubkey) {
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
    getEnqLib () {              // to the host
        return trafficController.simpleRequest(`${this.hostUrl}enqlib`,
            {
                method : 'GET'
            }
        );
    };

    // ----------------------------------------------------------- dev utils
    // createToken (ticker, emission, pubkey) {
    //     return trafficController.simpleRequest(`${this.url}create_token`,
    //         {
    //             method : 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json; charset=utf-8'
    //             },
    //             body : JSON.stringify({
    //                 ticker   : ticker,
    //                 emission : emission,
    //                 pubkey   : pubkey
    //             })
    //         }
    //     );
    // };
    // faucet (pubkey, hash, amount) {
    //     return trafficController.simpleRequest(`${this.url}faucet`, {
    //         method : 'POST',
    //         headers: {
    //             'Content-Type': 'application/json; charset=utf-8'
    //         },
    //         body : JSON.stringify({
    //             amount : amount,
    //             hash   : hash,
    //             id     : pubkey
    //         })
    //     });
    // };
    // ---------------------------------------------------------------------
}

const swapApi = new SwapApi();

// Temporary functional for tests
// window.myCustomFunctionCreateToken = swapApi.createToken.bind(swapApi);
// window.myCustomFunctionFaucet = swapApi.faucet.bind(swapApi);
// --------------------

export default swapApi;