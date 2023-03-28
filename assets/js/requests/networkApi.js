/** 
 *  @fileoverview Minimal amount of network API methods.
 */

import config from '../../../config.json';
import trafficController from './trafficController';
import presets from '../../store/pageDataPresets';
class NetworkApi {
    constructor () {
        this.url = presets.network.defaultNet.url;
        this.hostUrl = location.href.replace('/#', '/');
    };

    updUrl (url) {
        this.url = url
    }

    getTrustedTokens () {
        return trafficController.simpleRequest(`https://app.enecuum.com/default_token_list.json`,
            {
                method : 'GET'
            }
        );
    };

    getStats (url = this.url) {
        return trafficController.simpleRequest(`${url}api/${config.api_version}/stats`,
            {
                method : 'GET'
            }
        );
    };

    getContractPricelist (url = this.url) {        
        return trafficController.simpleRequest(`${url}api/${config.api_version}/contract_pricelist`,
            {
                method : 'GET'
            }
        );
    };

    getDexFarms (farmer_id = '', whiteList, url = this.url) {
        let stringfyWhiteList = '';

        if (whiteList !== undefined && Array.isArray(whiteList) && whiteList.length > 0) {
            whiteList.forEach(element => {
                stringfyWhiteList += '&farms=' + element;
            });
        }
        
        return trafficController.simpleRequest(`${url}api/${config.api_version}/get_dex_farms?farmer_id=${farmer_id}${stringfyWhiteList}`,
            {
                method : 'GET'
            }
        );
    };          

    eIndexByHash (hash, url = this.url) {
        return trafficController.simpleRequest(`${url}api/${config.api_version}/eindex_by_hash?hash=${hash}`,
            {
                method : 'GET'
            }
        );
    };

    networkInfo (url = this.url) {
        return trafficController.simpleRequest(`${url}api/${config.api_version}/network_info`,
            {
                method : 'GET'
            }
        );        
    }

    getSpaceStationPools (url = this.url) {
        return trafficController.simpleRequest(`${url}api/${config.api_version}/get_sstation_pools`,
            {
                method : 'GET'
            }
        );        
    }

    getAccountBalancesAll (accountHash, url = this.url) {
        return trafficController.simpleRequest(`${url}api/${config.api_version}/balance_all?id=${accountHash}`,
            {
                method : 'GET'
            }
        );        
    }

    tokenInfoStorage (net, url = this.url) {
        let jsonFile = `token-info-storage-${net}.json`
        return trafficController.simpleRequest(`${url}/info/${jsonFile}`,
            {
                method : 'GET'
            }
        )
    }

    getTx (url = this.url, txHash) {        
        return trafficController.simpleRequest(`${url}api/${config.api_version}/tx?hash=${txHash}`,
            {
                method : 'GET'
            }
        );
    };

    // ---------------------------------------------------------------------
}

const networkApi = new NetworkApi();

// --------------------

export default networkApi
