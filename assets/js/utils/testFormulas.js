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

function bigIntSqrt(value) {
    if (value < 0n)
        return ""
    if (value < 2n)
        return value
    function newtonIteration(n, x0) {
        const x1 = ((n / x0) + x0) >> 1n
        if (x0 === x1 || x0 === (x1 - 1n)) {
            return x0
        }
        return newtonIteration(n, x1)
    }
    return newtonIteration(value, 1n)
}

function countLTValue (pair, uiPair, mode, tokens) {
    // create pool case
    if (!utils.pairExists(pair)) {
        let mul = uiPair.field0.value.value * uiPair.field1.value.value
        if (!mul)
            return {value: 0, decimals: 0}
        return {value: bigIntSqrt(mul), decimals: 10}
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

function sellRoute (token0, token1, amount, pairs) {
    let vertices = [{vertex: token0, processed: false, outcome: amount, source: null}]

    let current = vertices.find(x=> x.vertex.hash === token0.hash)

    while (current) {
        let edges = pairs.filter(edge => edge.token_0.hash === current.vertex.hash || edge.token_1.hash === current.vertex.hash)
        edges.forEach((edge) => {
            if (edge.token_1.hash === current.vertex.hash) {
                let tmp
                tmp = edge.token_0
                edge.token_0 = edge.token_1
                edge.token_1 = tmp
                tmp = edge.volume1
                edge.volume1 = edge.volume2
                edge.volume2 = tmp
            }
        })

        edges.forEach((edge) => {
            let adj = vertices.find((x) => x.vertex.hash === edge.token_1.hash)
            if (adj) {
                let outcome = getSwapPrice({
                    value : edge.token_0.volume,
                    decimals : 10
                }, {
                    value : edge.token_1.volume,
                    decimals : 10
                }, current.outcome, {
                    value : edge.pool_fee,
                    decimals : 2
                })
                if (outcome.value === undefined)
                    console.log(outcome.value)
                let tmp = swapUtils.realignValueByDecimals(outcome, adj.outcome)
                if (tmp.f > tmp.s){
                    adj.outcome = outcome
                    adj.source = edge.from
                }
            } else {
                let new_vertex = {
                    vertex: edge.token_1,
                    processed: false,
                    outcome: getSwapPrice({
                        value : edge.token_0.volume,
                        decimals : 10
                    }, {
                        value : edge.token_1.volume,
                        decimals : 10
                    }, current.outcome, {
                        value : edge.pool_fee,
                        decimals : 2
                    }),
                    source: edge.token_0
                }
                vertices.push(new_vertex)
            }
        })

        current.processed = true
        vertices.sort((a,b)=> {
            let tmp = swapUtils.realignValueByDecimals(a.outcome, b.outcome)
            if (tmp.f > tmp.s) {
                return -1
            }
            else {
                let tmp = swapUtils.realignValueByDecimals(a.outcome, b.outcome)
                if (tmp.f > tmp.s)
                    return 0
                else return 1
            }
        })

        current = vertices.find(x => x.processed === false)
    }

    let route = []
    current = vertices.find(x => x.vertex.hash === token1.hash)

    while (current){
        route.unshift(current)
        current = vertices.find(x => x.vertex.hash === current.source)
    }

    return route
}

export default {
    getAddLiquidityPrice,
    countPriceImpact,
    revGetSwapPrice,
    ltDestruction,
    countLTValue,
    getSwapPrice,
    sellRoute
}