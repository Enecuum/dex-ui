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
    CREATE             : presets.pending.allowedTxTypes.pool_create,
    SELL_EXACT         : presets.pending.allowedTxTypes.pool_sell_exact,
    BUY_EXACT          : presets.pending.allowedTxTypes.pool_buy_exact,
    SELL_EXACT_ROUTED  : presets.pending.allowedTxTypes.pool_sell_exact_routed,
    BUY_EXACT_ROUTED   : presets.pending.allowedTxTypes.pool_buy_exact_routed,
    ADD                : presets.pending.allowedTxTypes.pool_add_liquidity,
    REMOVE             : presets.pending.allowedTxTypes.pool_remove_liquidity,
    ISSUE_TOKEN        : 'create_token',
    DEX_CMD_DISTRIBUTE : presets.pending.allowedTxTypes.dex_cmd_distribute
};

class ExtRequests { 
    constructor (nth, fee) {
        if (!nth)
            nth = presets.network.nativeToken.hash
        if (!fee)
            fee = presets.network.nativeToken.fee
        this.updNativeTokenData(nth, fee)
    }

    updNativeTokenData (nth, fee) {
        this.nativeTokenHash = nth
        this.nativeTokenFee  = fee
    }

    tenPowerDecimals (decimals) {
        return BigInt('1' + '0'.repeat(decimals))
    }

    getBigIntAmount (field) { // utility
        let diff = field.balance.decimals - field.value.decimals;
        if (diff > 0)
            return BigInt(field.value.value) * this.tenPowerDecimals(Math.abs(diff))
        else if (diff < 0)
            return BigInt(field.value.value) / this.tenPowerDecimals(Math.abs(diff))
        else 
            return field.value.value
    }

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


    sellExact (pubkey, exchangeMode, slippageVar) {
        let params = {
            asset_in: exchangeMode.field0.token.hash,
            asset_out: exchangeMode.field1.token.hash,
            amount_in : this.getBigIntAmount(exchangeMode.field0),
            amount_out_min : this.getBigIntAmount({
                value : slippageVar,
                balance : exchangeMode.field1.balance
            })
        }
        return this.sendTx(pubkey, requestType.SELL_EXACT, params)
    }

    buyExact (pubkey, exchangeMode, slippageVar) {
        let params = {
            asset_in: exchangeMode.field0.token.hash,
            asset_out: exchangeMode.field1.token.hash,
        }
        params.amount_out = this.getBigIntAmount(exchangeMode.field1)
        params.amount_in_max = this.getBigIntAmount({
            value : slippageVar,
            balance : exchangeMode.field0.balance
        })
        return this.sendTx(pubkey, requestType.BUY_EXACT, params)
    }

    sellExactRouted (pubkey, exchangeMode, route) {
        let params = {
            amount_in : this.getBigIntAmount(exchangeMode.field0),
            amount_out_min : this.getBigIntAmount({
                value : route[route.length-1].amountOutMin,
                balance : exchangeMode.field1.balance
            }),
            plength : BigInt(route.length)
        }

        let assets = route.reduce((prev, cur, i) => {
            prev[`asset${i}`] = cur.vertex
            return prev
        }, {})
        params = Object.assign(params, assets)

        return this.sendTx(pubkey, requestType.SELL_EXACT_ROUTED, params)
    }

    buyExactRouted (pubkey, exchangeMode, route) {
        let params = {
            amount_out : this.getBigIntAmount(exchangeMode.field1),
            amount_in_max : this.getBigIntAmount({
                value : route[route.length-1].amountInMax,
                balance : exchangeMode.field0.balance
            }),
            plength : BigInt(route.length)
        }

        let assets = route.reduce((prev, cur, i) => {
            prev[`asset${i}`] = cur.vertex
            return prev
        }, {})
        params = Object.assign(params, assets)

        return this.sendTx(pubkey, requestType.BUY_EXACT_ROUTED, params)
    }

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
            value : params.plength ? (Number(params.plength)-1) * this.nativeTokenFee : this.nativeTokenFee,
            // value : this.nativeTokenFee,
            tokenHash : this.nativeTokenHash,
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

    farmAction (pubKey, reqType, farmActionCost, params) {
        let data = {
            from : pubKey,
            to : presets.network.genesisPubKey,
            value : farmActionCost.toString(),
            tokenHash : this.nativeTokenHash,
            nonce : Math.floor(Math.random() * 1e15),
            data : ENQweb3lib.serialize({
                type : reqType,
                parameters : params
            })
        };
        // console.log(data);      
        // console.log(params);
        return trafficController.sendTransaction(data);
    };

    issueToken (pubKey, issueTokenCost, params) {
        let data = {
            from : pubKey,
            to : presets.network.genesisPubKey,
            value : issueTokenCost.toString(),
            tokenHash : this.nativeTokenHash,
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

    dexCmdDistribute (pubKey, dexCmdDistributeCost, params) {
        let data = {
            from : pubKey,
            to : presets.network.genesisPubKey,
            value : dexCmdDistributeCost.toString(),
            tokenHash : this.nativeTokenHash,
            nonce : Math.floor(Math.random() * 1e15),
            data : ENQweb3lib.serialize({
                type : requestType.DEX_CMD_DISTRIBUTE,
                parameters : params
            })
        };
        console.log(data);
        console.log(params);
        return trafficController.sendTransaction(data);
    };    
}

const extRequests = new ExtRequests();

export default extRequests;