/**
 *  @fileoverview Requets to Enecuum extention. Used through the web-enq library
 */

import presets from '../../store/pageDataPresets';
import trafficController from './trafficController';
import ValueProcessor from '../utils/ValueProcessor';

const valueProcessor = new ValueProcessor();

BigInt.prototype.toJSON = function () {
    return this.toString();
};

const requestType = {
    CREATE  : 'create_pool',
    SWAP    : 'swap',
    ADD     : 'add_liquidity',
    REMOVE  : 'remove_liquidity'
};

class ExtRequests { 

    getBigIntAmount (field) { // utility
        let value = field.value.replace(',', '');
        return valueProcessor.valueToBigInt(value, field.balance.decimals).value;
    };

    /**
     * Get network url or name
     * @param {boollean} full - flag for getting (true - full url) (false - name of network)
     * @returns {string}
     */
    getProvider (full) {
        return trafficController.getProvider(full);
    };

    /**
     * Get balance of the required token
     * @param {string} pubKey - users publick key (get it while connecting to the extention)
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
     * @param {string} pubkey - users publick key (get it while connecting to the extention)
     * @param {object} modeStruct - data structure from initialState.js, such as 'swapCard.liqudity', 'swapCard.exchange'
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
     * @param {string} pubkey - users publick key (get it while connecting to the extention)
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
     * @param {string} pubkey - users publick key (get it while connecting to the extention)
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
     * @param {string} pubkey - users publick key (get it while connecting to the extention)
     * @param {string} lt - lp token hash
     * @param {BigInt} amount - lt amount for removing 
     * @returns {Promise}
     */
    removeLiquidity (pubkey, lt, amount) {
        return this.sendTx(pubkey, requestType.REMOVE, {
            lt : lt,
            amount : amount
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
        // console.log(data);      // TODO - remove for production
        // console.log(params);    // TODO - remove for production
        return trafficController.sendTransaction(data);
    };
};

const extRequests = new ExtRequests();

export default extRequests;