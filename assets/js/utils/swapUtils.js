import ValueProcessor from './ValueProcessor';

const vp = new ValueProcessor();

/* =================================== micro-utils =================================== */

function pairExists (pair) {
    return !(pair.lt === undefined || pair.pool_fee === undefined);
}

function removeEndZeros (value, strLength) {
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
    let providerFee = vp.mul({value : pool_fee, decimals : 2}, field0ValueObj)
    try {
        providerFee = vp.usCommasBigIntDecimals(providerFee.value, providerFee.decimals)
    } catch (e) {
        providerFee = undefined
    }
    return providerFee
}

/**
 * Get exchange rate of two tokens. Все value и volume передавать в "копейках".
 * @param {object} pair - pool structure {token_0 : {volume, hash} , token_1 : {volume, hash}, lt, pool_fee}
 * @param {boolean} firstPerSecond - flag for changing divisible with divisor
 * @param {object} modeStruct - field from swapCard redux store like (liquidity, exchange, removeLiquidity)
 * @returns {string} - us commas
 */
function countExchangeRate (pair, firstPerSecond, modeStruct) {
    pair = { ...pair };
    if (!pairExists(pair)) {
        pair = {
            token_0 : {
                hash : modeStruct.field0.token.hash,
                volume : modeStruct.field0.value.value,
                decimals : modeStruct.field0.token.decimals
            },
            token_1 : {
                hash : modeStruct.field1.token.hash,
                volume : modeStruct.field1.value.value,
                decimals : modeStruct.field1.token.decimals
            },
            pool_fee : 0,
            lt : undefined
        };
    } else {
        pair.token_0.decimals = modeStruct.field0.token.decimals;
        pair.token_1.decimals = modeStruct.field1.token.decimals;
    }
    if (pair.token_0.hash !== modeStruct.field0.token.hash) {
        if (!firstPerSecond)
            pair.token_0 = [pair.token_1, pair.token_1 = pair.token_0][0];
    } else {
        if (firstPerSecond)
            pair.token_0 = [pair.token_1, pair.token_1 = pair.token_0][0];
    }
    if (pair.token_0.volume   !== undefined && 
        pair.token_1.volume &&
        pair.token_1.decimals !== undefined &&  
        pair.token_0.decimals !== undefined) {
        let res = vp.div({
            value : pair.token_0.volume,
            decimals : pair.token_0.decimals
        }, {
            value : pair.token_1.volume,
            decimals : pair.token_1.decimals
        });
        return vp.usCommasBigIntDecimals(res.value, res.decimals);
    } else {
        return '-';
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
function countPoolShare (pair, values, balances, addition) {
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
    };
    if (pairs.length === 0 || !Array.isArray(pairs))
        return emptyPair;
    let hashes = [tokens[0].hash, tokens[1].hash];
    let validPair = pairs.find(el => {
        if (hashes.indexOf(el.token_0.hash) !== -1 &&
            hashes.indexOf(el.token_1.hash) !== -1 &&
            el.token_0.hash !== el.token_1.hash) {
            if (lpToken)
                if (el.lt === lpToken)
                    return el;
                else
                    return undefined;
            else
                return el;
        }
    });
    return (validPair) ? validPair : emptyPair;
}

function getBalanceObj (balances, hash) {
    let balanceObj = balances.find(el => el.token === hash);
    if (balanceObj) {
        return balanceObj;
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

/* =================================================================================== */

export default {
    countPercentsByPortion,
    countExchangeRate,
    packAddressString,
    countProviderFee,
    countPoolShare,
    removeEndZeros,
    countPortion,
    getBalanceObj,
    getTokenObj,
    pairExists,
    searchSwap
};