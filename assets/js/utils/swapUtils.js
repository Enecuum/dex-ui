import ValueProcessor from './ValueProcessor'
import _ from 'lodash'
import React from 'react'
import testFormulas from './testFormulas'

const vp = new ValueProcessor();

/* =================================== micro-utils =================================== */

function pairExists (pair) {
    return !(pair.lt === undefined || pair.pool_fee === undefined);
}

function removeEndZeros (value, strLength) {
    if (value === undefined)
        return "0"
    value = String(value)
    if (strLength === undefined) {
        let parts = String(value).split(/[\.]/)
        strLength = (parts.length === 2) ? parts[0].length + 11 : parts[0]
    }
    if ((/\.[0-9]*0+$/).test(value) && value !== '0') {
        value = value.replace(/0*$/, '');
        if (value[value.length-1] === '.')
            value = value.slice(0, value.length-1);
    }
    if (value.length > strLength)
        value = value.substring(0, strLength)
    if (value === "")
        value = "0"
    return value;
}

/* =============================== BigInt calculations =============================== */

function countPortion (fullAmount, percent) {
    let hundred = vp.valueToBigInt(100, fullAmount.decimals);
    let percentObj = vp.valueToBigInt(percent, fullAmount.decimals);
    return vp.mul(fullAmount, vp.div(percentObj, hundred));
}

function countPercentsByPortion (fullAmount, portion) {
    let hundred = {value : 100, decimals : 0};
    let res = vp.mul(vp.div(portion, fullAmount), hundred);
    return vp.usCommasBigIntDecimals(res.value, res.decimals);
}

function countProviderFee (pool_fee, field0ValueObj) {
    let providerFee = vp.mul({value : pool_fee, decimals : 4}, field0ValueObj)
    return providerFee
}

/**
 * Get exchange rate of two tokens. Все value и volume передавать в "копейках".
 * @param {object} pair - pool structure {token_0 : {volume, hash} , token_1 : {volume, hash}, lt, pool_fee}
 * @param {boolean} firstPerSecond - flag for changing divisible with divisor
 * @param {object} modeStruct - field from swapCard redux store like (liquidity, exchange, removeLiquidity)
 * @returns {string} - us commas
 */
function countExchangeRate (route, firstPerSecond, tokens) {
    let len = route.length
    if (!len)
        return "---"

    let vol1 = route[1].volume1
    let vol2 = route[len - 1].volume2
    let token1 = getTokenObj(tokens, route[1].source)
    let token2 = getTokenObj(tokens, route[len - 1].vertex)

    let res 
    if (firstPerSecond) {
        res = vp.div({
            value : vol2,
            decimals : token2.decimals
        }, {
            value : vol1,
            decimals : token1.decimals
        })
    } else {
        res = vp.div({
            value : vol1,
            decimals : token1.decimals
        }, {
            value : vol2,
            decimals : token2.decimals
        })
    }
    try {
        return vp.usCommasBigIntDecimals(res.value, res.decimals);
    } catch (e) {
        return "---"
    }
}

/**
 * Get pool share in percents. Все value и volume передавать в "копейках".
 * @param {object} pair - pool structure {token_0 : {volume, hash} , token_1 : {volume, hash}, lt, pool_fee}
 * @param {object} values - {value0, value1}
 * @param {boolean} addition - if it's true, then sum up pool volume and user value
 * @param {object} balances - balance object from redux state
 * @returns {string} - percents
 */
function countPoolShare (pair, values, balances, addition, pooled) {
    if (!pairExists(pair))
        return '100';

    let value0, value1, volume0, volume1;

    try {
        if (values.value0.value === undefined || values.value1.value === undefined)
            return undefined;
        value0  = values.value0;
        value1  = values.value1;
        volume0 = BigInt(pair.token_0.volume);
        volume1 = BigInt(pair.token_1.volume);
    } catch (e) {
        return undefined;
    }

    let volumeObj0 = {
        value : volume0,
        decimals : getBalanceObj(balances, pair.token_0.hash).decimals
    };
    let volumeObj1 = {
        value : volume1,
        decimals : getBalanceObj(balances, pair.token_1.hash).decimals
    };
    if (addition) {
        volumeObj0 = vp.add(volumeObj0, value0);
        volumeObj1 = vp.add(volumeObj1, value1);
        value0 = vp.add(value0, pooled.t0)
        value1 = vp.add(value1, pooled.t1)
    }
    let inputVolume = vp.mul(value0, value1);
    let poolVolume = vp.mul(volumeObj0, volumeObj1);
    let res = vp.div(inputVolume, poolVolume);
    if (!Object.keys(res).length)
        return undefined;
    return vp.usCommasBigIntDecimals(res.value, res.decimals - 2, 10);
}

/* ================================= search functions ================================ */

function searchSwap (pairs, tokens, lpToken) {
    const emptyPair = {
        token_0 : {},
        token_1 : {}
    }
    if (pairs.length === 0 || !Array.isArray(pairs))
        return emptyPair

    let hashes = [tokens[0].hash, tokens[1].hash]
    let validPair = pairs.find(el => {
        if (hashes.indexOf(el.token_0.hash) !== -1 &&
            hashes.indexOf(el.token_1.hash) !== -1 &&
            el.token_0.hash !== el.token_1.hash) {
            if (lpToken)
                if (el.lt === lpToken)
                    return el
                else
                    return undefined
            else
                return el
        }
    })
    return (validPair) ? validPair : emptyPair
}

function searchByLt (pairs, lpToken) {
    const emptyPair = {
        token_0 : {},
        token_1 : {}
    }
    if (pairs.length === 0 || !Array.isArray(pairs))
        return emptyPair
    return pairs.find(el => el.lt === lpToken)
}

function getBalanceObj (balances, hash) {
    let balanceObj = balances.find(el => el.token === hash);
    if (balanceObj) {
        return _.cloneDeep(balanceObj);
    } else
        return {
            amount : (hash) ? 0 : '---',
            decimals : 0,
            minable : 0,
            reissuable : 0
        };
}

function getTokenObj (tokens, hash) {
    let tokenObj = tokens.find(el => el.hash === hash);
    if (tokenObj) {
        tokenObj = _.cloneDeep(tokenObj)
        if (tokenObj.decimals === undefined) {
            tokenObj.decimals = 0;
            tokenObj.total_supply = 0;
        }
        return tokenObj;
    } else
        return {
            hash : undefined,
            ticker : '---',
            caption : '',
            decimals : 0,
            total_supply : 0
        };
}

function packAddressString (addr) {
    if (addr)
        return `0x${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
    else
        return '---'
}

function tenPowerDecimals (decimals) {
    return BigInt('1' + '0'.repeat(decimals))
}

function realignValueByDecimals (first, second) {
    let f = {
        value : BigInt(first.value),
        decimals : first.decimals
    }
    let s = {
        value : BigInt(second.value),
        decimals : second.decimals
    }
    let diff = s.decimals - f.decimals
    if (diff > 0) {
        f.value *= tenPowerDecimals(diff)
    } else if (diff < 0) {
        diff *= -1
        s.value *= tenPowerDecimals(diff)
    }
    return {f : f.value, s : s.value}
}

function countUSDPrice (tokenVal, tokenInfo, justTokenPrice) {

    let getResultString = function (inUsd) {
        if (inUsd.value < 0n)
            inUsd.value = 0n
        inUsd = removeEndZeros(vp.usCommasBigIntDecimals(inUsd.value, inUsd.decimals))
        return inUsd === "undefined" ? undefined : inUsd
    }

    let usdPrice
    if (tokenInfo && tokenInfo.price_raw) {
        usdPrice = _.cloneDeep(tokenInfo.price_raw)
        usdPrice.value = tokenInfo.price_raw.dex_price
    } else {
        usdPrice = {
            value : 0,
            decimals : 0
        }
    }

    if (justTokenPrice)
        return getResultString(usdPrice)

    let tokenAmount
    if (tokenVal) {
        tokenAmount = _.cloneDeep(tokenVal)
        if (Number.isInteger(tokenAmount.amount))
            tokenAmount.value = tokenAmount.amount
    } else {
        tokenAmount = {
            value : 0,
            decimals : 0
        }
    }

    return getResultString(vp.mul(tokenAmount, usdPrice))
}

function poolShareWithStaked (tokens, balances, farms, activePair, mode) {
    let ltBalance = getBalanceObj(balances, activePair.lt);
    let ltObj = getTokenObj(tokens, activePair.lt);
    ltBalance.value = ltBalance.amount
    let farm
    if (farms) {
        farm = farms.find(farm => farm.stake_token_hash === activePair.lt && farm.stake)
        if (farm)
            ltBalance = vp.add(ltBalance, {value: farm.stake, decimals: 10})
    }

    let pooled = testFormulas.ltDestruction(tokens, activePair, {
        lt : {
            ...ltBalance,
            total_supply : {
                value : ltObj.total_supply,
                decimals : ltObj.decimals
            }
        }
    }, 'ltfield')

    return countPoolShare(activePair, {
        value0 : mode.field0.value,
        value1 : mode.field1.value
    }, balances, true, pooled)
}

function showUSDPrice (price, prefix="") {
    if (!price || price === "0")
        return <></>
    return prefix + price + "$"
}


export default {
    realignValueByDecimals,
    countPercentsByPortion,
    poolShareWithStaked,
    countExchangeRate,
    packAddressString,
    countProviderFee,
    countPoolShare,
    showUSDPrice,
    removeEndZeros,
    countPortion,
    countUSDPrice,
    getBalanceObj,
    getTokenObj,
    searchByLt,
    pairExists,
    searchSwap
};