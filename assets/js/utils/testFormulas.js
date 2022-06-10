import utils from './swapUtils';
import ValueProcessor from './ValueProcessor';
import swapUtils from "./swapUtils";
import _ from "lodash"
import lsdp from './localStorageDataProcessor'

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

function sellExact (volume0, volume1, amountIn, pool_fee) {
    if (amountIn == 0)
        return 0

    let percent = vp.valueToBigInt(100, pool_fee.decimals)
    let nominator = vp.mul(volume0, volume1)
    let denominator = vp.add(volume0, vp.div(vp.mul(amountIn, vp.sub(percent, pool_fee)), percent))

    return vp.sub(volume1, vp.div(nominator, denominator))
}

function buyExact (volume0, volume1, amountOut, pool_fee) {
    let percent = vp.valueToBigInt(100, pool_fee.decimals)
    let nominator = vp.mul(percent, vp.mul(volume0, amountOut))
    let denominator = vp.sub(vp.mul(volume1, vp.sub(percent, pool_fee)), amountOut)

    // let nominator = vp.sub(vp.div(vp.mul(volume0, volume1), vp.sub(volume1, amountOut)), volume0)
    // let denominator = vp.sub(vp.valueToBigInt(100, pool_fee.decimals), pool_fee)

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

function getDecimals (tokens, token) {
    return swapUtils.getTokenObj(tokens, token).decimals
}

function getPairs (pools) {
    return pools.map(pool => {
        return {
            from : pool.token_0.hash,
            to : pool.token_1.hash,
            volume1 : pool.token_0.volume,
            volume2 : pool.token_1.volume,
            pool_fee : pool.pool_fee
        }
    })
}

function sellRoute (from, to, amount, pools, tokens, limit, slippage) {
    let pairs = getPairs(pools)

    let vertices = [{vertex: from, processed: false, outcome: amount, source: null}];

    let current = vertices.find(x=> x.vertex === from);

    while (current) {
        // console.log(`===================\nprocesing vertex ${JSON.stringify(current)}`)
        let edges = pairs.filter(edge => edge.from === current.vertex || edge.to === current.vertex);
        edges.forEach((edge) => {
            if (edge.to === current.vertex) {
                let tmp;
                tmp = edge.from;
                edge.from = edge.to;
                edge.to = tmp;
                tmp = edge.volume1;
                edge.volume1 = edge.volume2;
                edge.volume2 = tmp;
            }
        });

        // console.log('edges:', edges);

        edges.forEach((edge) => {
            let adj = vertices.find((x) => x.vertex === edge.to);
            if (adj) {

            } else {
                let v1 = {
                    value : edge.volume1,
                    decimals : getDecimals(tokens, edge.from)
                }, v2 = {
                    value : edge.volume2,
                    decimals : getDecimals(tokens, edge.to)
                }, amountIn = {
                    value : current.outcome.value,
                    decimals : current.outcome.decimals
                }

                let new_vertex = {
                    vertex: edge.to,
                    volume1 : _.cloneDeep(edge.volume1),
                    volume2 : _.cloneDeep(edge.volume2),
                    pool_fee : _.cloneDeep(edge.pool_fee),
                    processed: false,
                    outcome: sellExact({
                        value : edge.volume1,
                        decimals : getDecimals(tokens, edge.from)
                    }, {
                        value : edge.volume2,
                        decimals : getDecimals(tokens, edge.to)
                    }, amountIn, {
                        value : edge.pool_fee,
                        decimals : 2
                    }),
                    source: edge.from
                }

                vertices.push(new_vertex);
                // console.log(`new vertex ${JSON.stringify(new_vertex)}`);
            }
        });

        current.processed = true;
        vertices.sort((a,b)=> {
            let tmp = swapUtils.realignValueByDecimals(_.cloneDeep(a.outcome), _.cloneDeep(b.outcome))
            if (tmp.f > tmp.s) {
                return -1;
            }
            else {
                if (tmp.f === tmp.s)
                    return 0;
                else return 1;
            }
        });
        // console.log('vertices:', vertices);

        current = vertices.find(x => x.processed === false);
    }

    // Backtrace
    let route = []
    let _limit = limit
    current = vertices.find(x => x.vertex === to)
    if (!current)
        return route

    while (true) {
        // check boundary
        if (!_limit) {
            // rollback
            current.lock = ++_limit
            route.splice(0,1)
            current = route[0]
            continue
        }
        current.leftBehind = true
        route.unshift(current)

        // (source === undefined) means that we've found the root
        if (current.source === null)
            break
        current = findNodeNearby(vertices, current, _limit)
        if (!current) {
            // if length > 1 then just roll back and set the lock filter
            if (route.length !== 1) {
                route[0].lock = ++_limit
                route[0].leftBehind = false
                current = route.splice(0, 2)[1]
                continue // avoid reducing of the _limit
            } else { // if length === 1 then just find new entry point and set the lock filter
                route[0].lock = ++_limit
                route[0].leftBehind = false
                route = []
                current = findNodeNearby(vertices, {source : to}, _limit) // where current.vertex === to
                // absence of current == absence of routes
                if (!current)
                    break
                continue // avoid reducing of the _limit
            }
        }
        _limit--
    }

    // Count slippage tolerance
    route = route.map((el, i) => {
        let percent = vp.valueToBigInt(slippage, 8)
        percent.decimals += 2
        percent = vp.sub(vp.valueToBigInt(1), percent)
        if (i) {
            let amountOut
            if (i === 1)
                amountOut = el.outcome
            else {
                amountOut = sellExact({
                    value : el.volume1,
                    decimals : getDecimals(tokens, el.source)
                }, {
                    value : el.volume2,
                    decimals : getDecimals(tokens, el.vertex)
                }, route[i - 1].amountOutMin, {
                    value : el.pool_fee,
                    decimals : 2
                })
            }
            el.amountOutMin = vp.mul(amountOut, percent)
        }
        return el
    })

    return route
}

function sellRouteRev (from, to, amount, pools, tokens, limit, slippage) {
    let pairs = getPairs(pools)

    let vertices = [{vertex: from, processed: false, outcome: amount, source: null}];

    let current = vertices.find(x=> x.vertex === from);

    while (current) {
        // console.log(`===================\nprocesing vertex ${JSON.stringify(current)}`)
        let edges = pairs.filter(edge => edge.from === current.vertex || edge.to === current.vertex);
        edges.forEach((edge) => {
            if (edge.to === current.vertex) {
                let tmp;
                tmp = edge.from;
                edge.from = edge.to;
                edge.to = tmp;
                tmp = edge.volume1;
                edge.volume1 = edge.volume2;
                edge.volume2 = tmp;
            }
        });

        // console.log('edges:', edges);

        edges.forEach((edge) => {
            let adj = vertices.find((x) => x.vertex === edge.to);
            if (adj) {

            } else {
                let new_vertex = {
                    vertex: edge.to,
                    processed: false,
                    volume1 : _.cloneDeep(edge.volume1),
                    volume2 : _.cloneDeep(edge.volume2),
                    pool_fee : _.cloneDeep(edge.pool_fee),
                    outcome: buyExact({
                        value : edge.volume2,
                        decimals : getDecimals(tokens, edge.to)
                    }, {
                        value : edge.volume1,
                        decimals : getDecimals(tokens, edge.from)
                    }, {
                        value : current.outcome.value,
                        decimals : current.outcome.decimals
                    }, {
                        value : edge.pool_fee,
                        decimals : 2
                    }),
                    source: edge.from
                }

                vertices.push(new_vertex);
                // console.log(`new vertex ${JSON.stringify(new_vertex)}`);
            }
        });

        current.processed = true;
        vertices.sort((a,b)=> {
            let tmp = swapUtils.realignValueByDecimals(_.cloneDeep(a.outcome), _.cloneDeep(b.outcome))
            if (tmp.f > tmp.s) {
                return -1;
            }
            else {
                if (tmp.f === tmp.s)
                    return 0;
                else return 1;
            }
        });
        // console.log('vertices:', vertices);

        current = vertices.find(x => x.processed === false);
    }

    // Backtrace
    let route = []
    let _limit = limit
    current = vertices.find(x => x.vertex === to)
    if (!current)
        return route

    while (true) {
        // check boundary
        if (!_limit) {
            // rollback
            current.lock = ++_limit
            route.splice(0,1)
            current = route[0]
            continue
        }
        current.leftBehind = true
        route.unshift(current)

        // (source === undefined) means that we've found the root
        if (current.source === null)
            break
        current = findNodeNearby(vertices, current, _limit)
        if (!current) {
            // if length > 1 then just roll back and set the lock filter
            if (route.length !== 1) {
                route[0].lock = ++_limit
                route[0].leftBehind = false
                current = route.splice(0, 2)[1]
                continue // avoid reducing of the _limit
            } else { // if length === 1 then just find new entry point and set the lock filter
                route[0].lock = ++_limit
                route[0].leftBehind = false
                route = []
                current = findNodeNearby(vertices, {source : to}, _limit) // where current.vertex === to
                // absence of current == absence of routes
                if (!current)
                    break
                continue // avoid reducing of the _limit
            }
        }
        _limit--
    }

    // Count slippage tolerance
    route = route.map((el, i) => {
        let percent = vp.valueToBigInt(slippage, 8)
        percent.decimals += 2

        if (i) {
            let amountIn
            if (i === 1)
                amountIn = el.outcome
            else {
                amountIn = buyExact({
                    value : el.volume2,
                    decimals : getDecimals(tokens, el.vertex)
                }, {
                    value : el.volume1,
                    decimals : getDecimals(tokens, el.source)
                }, route[i - 1].amountInMax, {
                    value : el.pool_fee,
                    decimals : 2
                })
            }
            let addition = vp.mul(amountIn, percent)
            el.amountInMax = vp.add(amountIn, addition)
        }
        return el
    })

    // Reduce to the ordinary route
    route = route.map((el, i, arr) => {
        try {
            el.source = arr[i + 1].vertex
            el.amountInMax = arr[i + 1].amountInMax
        } catch (e) {
            el.source = null
            el.amountInMax = null
        }
        return el
    }).reverse()


    return route
}

function findNodeNearby (vertices, current, curLimit) {
    return vertices.find(x => {
        if (x.vertex !== current.source)
            return false
        if (x.leftBehind !== undefined && x.leftBehind === true)
            return false
        if (x.lock !== undefined && x.lock >= curLimit)
            return false
        return true
    })
}

export default {
    getAddLiquidityPrice,
    countPriceImpact,
    revGetSwapPrice: buyExact,
    ltDestruction,
    countLTValue,
    getSwapPrice: sellExact,
    sellRoute,
    sellRouteRev
}