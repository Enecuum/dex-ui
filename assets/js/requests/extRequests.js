/**
 *  @fileoverview Requets to Enecuum extention. Used through the web-enq library
 */

import presets from '../../store/pageDataPresets';
import trafficController from './trafficController';
import networkApi from './networkApi';
import ValueProcessor from '../utils/ValueProcessor';

const valueProcessor = new ValueProcessor();

BigInt.prototype.toJSON = function () {
    return this.toString();
};

const requestType = {
    CREATE       : 'create_pool',
    SWAP         : 'swap',
    ADD          : 'add_liquidity',
    REMOVE       : 'remove_liquidity',
    ISSUE_TOKEN :  'create_token'
};

class ExtRequests { 

    getBigIntAmount (field) { // utility
        let diff = field.balance.decimals - field.value.decimals;
        if (diff > 0)
            return BigInt(field.value.value) * BigInt(Math.pow(10, Math.abs(diff)));
        else if (diff < 0)
            return BigInt(field.value.value) / BigInt(Math.pow(10, Math.abs(diff)));
        else 
            return field.value.value;
    };

    /**
     * Get network url or name
     * @param {bool} full - flag for getting url (deprecated)
     * @returns {string}
     */
    getProvider (full) {
        return trafficController.getProvider(full);
    };

    /**
     * Get balance of the required token
     * @param {string} pubKey - users public key (get it while connecting to the extension)
     * @param {string} hash - hash of the required token
     * @returns {Promise}
     */
    getBalance (pubKey, hash) {
        return trafficController.getBalance({
            to : pubKey,
            tokenHash : hash
        });
    };

    /**
     * Create pool with two pairs that are chosen in ui-form
     * @param {string} pubkey - users public key (get it while connecting to the extension)
     * @param {object} modeStruct - data structure from initialState.js, such as 'swapCard.liquidity', 'swapCard.exchange'
     * @returns {Promise}
     */
    createPool (pubkey, modeStruct) {
        return this.sendTx(pubkey, requestType.CREATE, {
            asset_1  : modeStruct.field0.token.hash,
            amount_1 : this.getBigIntAmount(modeStruct.field0),
            asset_2  : modeStruct.field1.token.hash,
            amount_2 : this.getBigIntAmount(modeStruct.field1)
        });
    };

    /**
     * Exchange pair of tokens
     * @param {string} pubkey - users public key (get it while connecting to the extension)
     * @param {object} exchangeMode - data structure from initialState.js
     * @returns {Promise}
     */
    swap (pubkey, exchangeMode) {
        return this.sendTx(pubkey, requestType.SWAP, {
            asset_in  : exchangeMode.field0.token.hash,
            amount_in : this.getBigIntAmount(exchangeMode.field0),
            asset_out : exchangeMode.field1.token.hash
        });
    };

    /**
     * Exchange pair of tokens
     * @param {string} pubkey - users public key (get it while connecting to the extension)
     * @param {object} liquidityMode - data structure from initialState.js
     * @returns {Promise}
     */
    addLiquidity (pubkey, liquidityMode) {
        return this.sendTx(pubkey, requestType.ADD, {
            asset_1  : liquidityMode.field0.token.hash,
            amount_1 : this.getBigIntAmount(liquidityMode.field0),
            asset_2  : liquidityMode.field1.token.hash,
            amount_2 : this.getBigIntAmount(liquidityMode.field1)
        });
    };

    /**
     * Get coins at the cost of 'liquidity tokens'
     * @param {string} pubkey - users public key (get it while connecting to the extension)
     * @param {string} lt - lp token hash
     * @param {BigInt} ltfield - field from remove liquidity redux state with lt amount
     * @returns {Promise}
     */
    removeLiquidity (pubkey, lt, ltfield) {
        return this.sendTx(pubkey, requestType.REMOVE, {
            lt : lt,
            amount : this.getBigIntAmount(ltfield)
        });
    };

    sendTx (pubKey, reqType, params) {
        let data = {
            from : pubKey,
            to : presets.network.genesisPubKey,
            value : presets.network.nativeToken.fee,
            tokenHash : presets.network.nativeToken.hash,
            nonce : Math.floor(Math.random() * 1e10),
            data : ENQweb3lib.serialize({
                type : reqType,
                parameters : params
            })
        };
        console.log(data);
        console.log(params);
        return trafficController.sendTransaction(data);
    };

    issueToken (pubKey, issueTokenCost, params) {
        console.log(pubKey, issueTokenCost, params)
        let data = {
            from : pubKey,
            to : presets.network.genesisPubKey,
            value : issueTokenCost.toString(),
            tokenHash : presets.network.nativeToken.hash,
            nonce : Math.floor(Math.random() * 1e15),
            data : ENQweb3lib.serialize({
                type : requestType.ISSUE_TOKEN,
                parameters : params
            })
        };
        // console.log(data);      
        // console.log(params);
        return trafficController.sendTransaction(data);
    };
}

const extRequests = new ExtRequests();

export default extRequests;