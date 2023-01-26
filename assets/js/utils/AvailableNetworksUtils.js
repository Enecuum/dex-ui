import {availableNetworks} from'./../config';

class AvailableNetworksUtils {
	constructor() {

    }

    getChainById(id) {
        let res = undefined;
        let chain = availableNetworks.find(elem => elem.id === id);
        if (chain !== undefined)
            res = chain;
        return res;     
    }
}

export default AvailableNetworksUtils;