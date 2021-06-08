import ValueProcessor from './ValueProcessor';

const vp = new ValueProcessor();

/* =================================== micro-utils =================================== */

function pairExists (pair) {
    if (pair.lt === undefined || pair.pool_fee === undefined) 
        return false;
    return true;
};

function removeEndZeros (value) {
    if (value == 0)
        return '0';
    if ((/\.[0-9]*0+$/).test(value)) {
        value = value.replace(/0*$/, '');
        if (value[value.length-1] == '.')
            value = value.slice(0, value.length-1);
    }
    return value;
};

function divide(input_0, input_1) { // TODO - remove after checking
    try {
        return Number(input_0) / Number(input_1);
    } catch (e) {
        return 0;
    }
};

function countPortion (fullAmount, percent) {
    return Number(fullAmount) * (Number(percent) / 100);
};

function countPercentsByPortion (fullAmount, portion) {
    return (Number(portion) / Number(fullAmount)) * 100;
};

/* =============================== BigInt calculations =============================== */

/**
 * Get exchange rate of two tokens. Все value и volume передавать в "копейках".
 * @param {object} pair - pool structure {token_0 : {volume, hash} , token_1 : {volume, hash}, lt, pool_fee}
 * @param {boolean} firstPerSecond - flag for changing divisible with divisor
 * @param {object} modeStruct - field from swapCard redux store like (liquidity, exchange, removeLiquidity)
 * @returns {string} - us commas
 */
function countExchangeRate(pair, firstPerSecond, modeStruct) {
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
        pair.token_1.volume   !== undefined &&  
        pair.token_1.decimals !== undefined &&  
        pair.token_0.decimals !== undefined) {
        let res = vp.div({
            value : pair.token_0.volume,
            decimals : pair.token_0.decimals
        }, {
            value : pair.token_1.volume,
            decimals : pair.token_1.decimals
        });
        return vp.usCommasBigIntDecimals(res.value, res.decimals, 10);
    } else {
        return '-';
    }
};

/**
 * Get pool share in percents. Все value и volume передавать в "копейках".
 * @param {object} pair - pool structure {token_0 : {volume, hash} , token_1 : {volume, hash}, lt, pool_fee}
 * @param {object} values - {value0, value1}
 * @param {boolean} addition - if it's true, then sum up pool volume and user value 
 * @returns {string} - percents
 */
function countPoolShare(pair, values, addition) {
    if (!pairExists(pair))
        return '100';

    let value0, value1, volume0, volume1;

    try {
        value0  = BigInt(values.value0);
        value1  = BigInt(values.value1);
        volume0 = BigInt(pair.token_0.volume);
        volume1 = BigInt(pair.token_1.volume);
    } catch (e) {
        return;
    }

    if (addition) {
        volume0 += value0;
        volume1 += value1;
    }
    let inputVolume = vp.mul({
        value : value0,
        decimals : 0
    }, {
        value : value1,
        decimals : 0
    });
    let poolVolume  = vp.mul({
        value : volume0,
        decimals : 0
    }, {
        value : volume1,
        decimals : 0
    });
    let res = vp.div(inputVolume, poolVolume);
    if (!Object.keys(res).length)
        return '';
    return vp.usCommasBigIntDecimals(res.value * 100n, 24, 10);
};

/* ================================= search functions ================================ */

function searchSwap(pairs, tokens) {
    const emptyPair = {
        token_0 : {},
        token_1 : {}
    };
    if (pairs.length == 0 || !Array.isArray(pairs))
        return emptyPair;
    let hashes = [tokens[0].hash, tokens[1].hash];
    let validPair = pairs.find(el => {
        if (hashes.indexOf(el.token_0.hash) != -1 &&
            hashes.indexOf(el.token_1.hash) != -1 &&
            el.token_0.hash !== el.token_1.hash) {
            return el;
        }
    });
    return (validPair) ? validPair : emptyPair;
};

function getBalanceObj(balances, hash) {
    let balanceObj = balances.find(el => el.token == hash);
    if (balanceObj) {
        return balanceObj;
    } else
        return {
            amount : (hash) ? 0 : '---',
            decimals : 0,
            minable : 0, 
            reissuable : 0
        };
};

function getTokenObj(tokens, hash) {
    let tokenObj = tokens.find(el => el.hash == hash);
    if (tokenObj) {
        if (tokenObj.decimals == undefined) {
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
};

/* =================================================================================== */

export default {
    countPercentsByPortion,
    countExchangeRate,
    countPoolShare,
    removeEndZeros,
    countPortion,
    getBalanceObj,
    getTokenObj,
    pairExists,
    searchSwap,
    divide
};