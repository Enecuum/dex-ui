import utils from './swapUtils';
import ValueProcessor from './ValueProcessor';
import swapUtils from "./swapUtils";

const vp = new ValueProcessor();

function getAddLiquidityPrice (input_0, input_1, coinValue) {
    let mul = vp.mul(input_0, coinValue);
    return vp.div(mul, input_1);
}

/**
 *
 * @param {object} pair - pool structure {token_0 : {volume, hash} , token_1 : {volume, hash}, lt, pool_fee}
 * @param {object} amountIn - amount structure {value, decimals, (token)} where token is the extra option for cases when first token of the pool does not match the amountIn token
 * @param {string} amountOut - amount structure {value, decimals, (token)} where token is the extra option for cases when second token of the pool does not match the amountOut token
 * @param {object} tokens - list of tokens from redux state
 * @returns {object} - priceImpact as {value, decimals}
 */
function countPriceImpact (pair, amountIn, amountOut, tokens) {
    // ------------------------------- prepare volume and amount -------------------------------------------
    if (!amountIn.token && !amountOut.token) {
        amountIn.token = pair.token_0
        amountOut.token = pair.token_1
    }
    let token0Decimals = swapUtils.getTokenObj(tokens, pair.token_0.hash).decimals
    let token1Decimals = swapUtils.getTokenObj(tokens, pair.token_1.hash).decimals
    let vol0 = {
        value : pair.token_0.volume,
        decimals : (pair.token_0.hash === amountIn.token.hash) ? token0Decimals : token1Decimals
    }, vol1 = {
        value : pair.token_1.volume,
        decimals : (pair.token_1.hash === amountIn.token.hash) ? token1Decimals : token0Decimals
    }
    // -----------------------------------------------------------------------------------------------------
    let midPrice = (pair.token_0.hash !== amountIn.token.hash) ? vp.div(vol0, vol1) : vp.div(vol1, vol0)

    let mul = vp.mul(midPrice, amountIn)
    let priceImpact = vp.div(vp.sub(mul, amountOut), mul)
    return vp.mul(priceImpact, {value : 100, decimals: 0})
}

function getSwapPrice (volume0, volume1, amountIn, pool_fee) {
    if (amountIn == 0)
        return 0

    let one = vp.valueToBigInt(1, pool_fee.decimals)
    let mul = vp.mul(volume0, volume1)
    let add = vp.add(volume0, vp.mul(amountIn, vp.sub(one, pool_fee)))
    let div = vp.div(mul, add)

    return vp.sub(volume1, div)
}

function revGetSwapPrice (volume0, volume1, amountOut, pool_fee) {
    let nominator = vp.sub(vp.div(vp.mul(volume0, volume1), vp.sub(volume1, amountOut)), volume0)
    let denominator = vp.sub(vp.valueToBigInt(1, pool_fee.decimals), pool_fee)

    return vp.div(nominator, denominator)
}

/**
 * 
 * @param {object} pair - pool structure {token_0 : {volume, hash} , token_1 : {volume, hash}, lt, pool_fee}
 * @param {object} tokenTrio - three objects {t0, t1, lt} with internal structure like {value, decimals}
 * @param {string} chField - name of changed field
 * @param {object} tokens - list of tokens from redux state
 * @returns {object} - tokenTrio
 */
function ltDestruction (tokens, pair, tokenTrio, chField) {
    if (tokenTrio.lt.total_supply.value === 0) {
        return {
            lt : {value : 0n, decimals : 0, addition : 0},
            t0 : {value : 0n, decimals : 0, addition : 0},
            t1 : {value : 0n, decimals : 0, addition : 0}
        };
    }    
    let token0 = { value : pair.token_0.volume, decimals : utils.getTokenObj(tokens, pair.token_0.hash).decimals };
    let token1 = { value : pair.token_1.volume, decimals : utils.getTokenObj(tokens, pair.token_1.hash).decimals };
    // -------
    let total = tokenTrio.lt.total_supply;
    if (chField === 'ltfield') {
        let div = vp.div(tokenTrio.lt, total);
        return {
            lt : tokenTrio.lt,
            t0 : vp.mul(token0, div),
            t1 : vp.mul(token1, div)
        };
    } else if (chField === 'field0') {
        let lt = vp.mul(vp.div(tokenTrio.t0, token0), total);
        return {
            t0 : tokenTrio.t0,
            t1 : vp.div(vp.mul(token1, lt), total),
            lt : lt
        };
    } else if (chField === 'field1') {
        let lt = vp.mul(vp.div(tokenTrio.t1, token1), total);
        return {
            t1 : tokenTrio.t1,
            t0 : vp.div(vp.mul(token0, lt), total),
            lt : lt
        };
    }
}

function countLTValue (pair, uiPair, mode, tokens) {
    // create pool case
    if (!utils.pairExists(pair)) {
        let res = vp.mul(uiPair.field0.value, uiPair.field1.value)
        if (res.value === undefined)
            return {};
        return vp.valueToBigInt(Math.sqrt(Number(res.value / BigInt(Math.pow(10, res.decimals)))), res.decimals)
    }
    // exchange mode has no lt-calculations
    // https://github.com/Enecuum/docs/issues/6
    if (mode === 'exchange') {
        return 0;
    } else if (mode === 'liquidity') {
        let tObj0 = {value : pair.token_0.volume, decimals : utils.getTokenObj(tokens, pair.token_0.hash).decimals}
        let tObj1 = {value : pair.token_1.volume, decimals : utils.getTokenObj(tokens, pair.token_1.hash).decimals}
        let required_1 = vp.div(vp.mul(tObj0, uiPair.field1.value), tObj1)
        let res = vp.mul(required_1, uiPair.field1.value)
        if (res.value === undefined)
            return {};
        return vp.valueToBigInt(Math.sqrt(Number(res.value / BigInt(Math.pow(10, res.decimals)))), res.decimals)
    }
    // dev warning
    return 'wrong mode'
}

global.getAddLiquidityPrice = getAddLiquidityPrice

export default {
    countPriceImpact,
    getAddLiquidityPrice,
    ltDestruction,
    countLTValue,
    getSwapPrice,
    revGetSwapPrice
}