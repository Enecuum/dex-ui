/**
 *  @fileoverview Requets to Enecuum extention. Used through the web-enq library
 */

import presets from '../../store/pageDataPresets';

const requestType = {
    CREATE  : 'create_pool',
    SWAP    : 'swap',
    ADD     : 'add_liquidity',
    REMOVE  : 'remove_liquidity'
};

let extRequests = {
    /**
     * Get balance of the required token
     * @param {string} pubKey - users publick key (get it while connecting to the extention)
     * @param {string} hash - hash of the required token
     * @returns {Promise}
     */
    getBalance (pubKey, hash) {
        try {
            return Enecuum.balanceOf({
                to : pubKey,
                tokenHash : hash
            });
        } catch (err) {
            return new Promise((resolve, reject) => { reject(err) });
        }
    },

    /**
     * Create pool with two pairs that are chosen in ui-form
     * @param {string} pubkey - users publick key (get it while connecting to the extention)
     * @param {object} modeStruct - data structure from initialState.js, such as 'swapCard.liqudity', 'swapCard.exchange'
     * @returns {Promise}
     */
    createPool (pubkey, modeStruct) {
        return this.sendTx(pubkey, requestType.CREATE, {
            asset_1  : modeStruct.field0.token.hash,
            amount_1 : modeStruct.field0.value,
            asset_2  : modeStruct.field1.token.hash,
            amount_2 : modeStruct.field1.value
        });
    },

    /**
     * Exchange pair of tokens
     * @param {string} pubkey - users publick key (get it while connecting to the extention)
     * @param {object} exchangeMode - data structure from initialState.js
     * @returns {Promise}
     */
    swap (pubkey, exchangeMode) {
        return this.sendTx(pubkey, requestType.SWAP, {
            asset_in  : exchangeMode.field0.token.hash,
            amount_in : exchangeMode.field0.value,
            asset_out : exchangeMode.field1.token.hash
        });
    },

    /**
     * Exchange pair of tokens
     * @param {string} pubkey - users publick key (get it while connecting to the extention)
     * @param {object} liquidityMode - data structure from initialState.js
     * @returns {Promise}
     */
    addLiquidity (pubkey, liquidityMode) {
        return this.sendTx(pubkey, requestType.ADD, {
            asset_1  : liquidityMode.field0.token.hash,
            amount_1 : liquidityMode.field0.value,
            asset_2  : liquidityMode.field1.token.hash,
            amount_2 : liquidityMode.field1.value
        });
    },

    /**
     * Get coins at the cost of 'liquidity tokens'
     * @param {string} pubkey - users publick key (get it while connecting to the extention)
     * @param {object} liquidityMode - data structure from initialState.js
     * @returns {Promise}
     */
    removeLiquidity (pubkey, removeMode) {
        return this.sendTx(pubkey, requestType.REMOVE, {
            lt : removeMode.lt,
            amount : removeMode.amount
        });
    },

    sendTx (pubKey, reqType, params) {
        return Enecuum.sendTransaction({
            from : pubKey,
            to : presets.network.genesisPubKey,
            value : presets.network.nativeToken.fee,
            tokenHash : presets.network.nativeToken.hash,
            data : {
                type : reqType,
                parameters : params
            }
        });
    }
};

export default extRequests;