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

    getContractPricelist (url = this.url) {        
        return trafficController.simpleRequest(`${url}api/${config.api_version}/contract_pricelist`,
            {
                method : 'GET'
            }
        );
    };

    getDexFarms (farmer_id = '', url = this.url) {        
        return trafficController.simpleRequest(`${url}api/${config.api_version}/get_dex_farms?farmer_id=${farmer_id}`,
            {
                method : 'GET'
            }
        );
    };    

    // ---------------------------------------------------------------------
};

const networkApi = new NetworkApi();

// --------------------

export default networkApi