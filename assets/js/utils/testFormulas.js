import utils from './swapUtils';
import ValueProcessor from './ValueProcessor';

const vp = new ValueProcessor();

function getAddLiquidityPrice (input_0, input_1, coinValue) {
    let mul = vp.mul(input_0, coinValue);
    let res = vp.div(mul    , input_1);
    return res;
};

function getSwapPrice (volume0, volume1, amountIn) { // handle only custom BigInt
    if (amountIn == 0) // use 'if' instead of try/catch in order to check empty string
        return 0;
    let mul = vp.mul(volume0, volume1);
    let add = vp.add(volume0, amountIn);
    let div = vp.div(mul    , add);
    let res = vp.sub(volume1, div);
    return res;
};

/**
 * 
 * @param {object} pair - pool structure {token_0 : {volume, hash} , token_1 : {volume, hash}, lt, pool_fee}
 * @param {object} tokenTrio - tree objects {t0, t1, lt} with internal structure like {value, decimals} 
 * @param {string} chField - name of changed field
 * @returns {object} - tokenTrio
 */
function ltDestruction (tokens, pair, tokenTrio, chField) {
    if (tokenTrio.lt.total_supply === 0) {
        return {
            lt : {value : 0n, decimals : 0, addition : 0},
            t0 : {value : 0n, decimals : 0, addition : 0},
            t1 : {value : 0n, decimals : 0, addition : 0}
        };
    }    
    let token0 = { value : pair.token_0.volume, decimals : utils.getTokenObj(tokens, pair.token_0.hash).decimals };
    let token1 = { value : pair.token_1.volume, decimals : utils.getTokenObj(tokens, pair.token_1.hash).decimals };
    // -------
    let total = { value : tokenTrio.lt.total_supply, decimals : tokenTrio.lt.decimals };
    if (chField == 'ltfield') {
        let div = vp.div(tokenTrio.lt, total);
        return {
            lt : tokenTrio.lt,
            t0 : vp.mul(token0, div),
            t1 : vp.mul(token1, div)
        };
    } else if (chField == 'field0') {
        let lt = vp.mul(vp.div(tokenTrio.t0, token0), total);
        return {
            t0 : tokenTrio.t0,
            t1 : vp.div(vp.mul(token1, lt), total),
            lt : lt
        };
    } else if (chField == 'field1') {
        let lt = vp.mul(vp.div(tokenTrio.t1, token1), total);
        return {
            t1 : tokenTrio.t1,
            t0 : vp.div(vp.mul(token0, lt), total),
            lt : lt
        };
    }
};

function countLTAmount (pair, uiPair, mode) {
    // create pool case
    if (!utils.pairExists(pair)) {
        return Math.sqrt(uiPair.field0.value * uiPair.field1.value);
    }
    // exchange mode has no lt-calculations
    // https://github.com/Enecuum/docs/issues/6
    if (mode == 'exchange') {
        return 0;
    } else if (mode == 'liquidity') {
        let required_1 = pair.token_0.volume * uiPair.field1.value / pair.token_1.volume;
        return Math.sqrt(required_1 * uiPair.field1.value);
    }
    // dev warning
    return 'wrong mode';
};

export default {
    getAddLiquidityPrice,
    ltDestruction,
    countLTAmount,
    getSwapPrice
};