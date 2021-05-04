import ValueProcessor from './ValueProcessor';

const vp = new ValueProcessor();

function countExchangeRate(pair, firstPerSecond, modeStruct) {
    pair = { ...pair };
    if (!pairExists(pair)) {
        pair = {
            token_0 : {
                hash : modeStruct.field0.token.hash,
                volume : modeStruct.field0.value
            },
            token_1 : {
                hash : modeStruct.field1.token.hash,
                volume : modeStruct.field1.value
            },
            pool_fee : 0,
            lt : undefined
        };
    }
    if (pair.token_0.hash !== modeStruct.field0.token.hash) {
        if (!firstPerSecond)
            pair.token_0 = [pair.token_1, pair.token_1 = pair.token_0][0];
    } else {
        if (firstPerSecond)
            pair.token_0 = [pair.token_1, pair.token_1 = pair.token_0][0];
    }
    return divide(pair.token_0.volume, pair.token_1.volume);
};

function pairExists (pair) {
    if (pair.pool_fee === undefined) 
        return false;
    return true;
};

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

function countPoolShare(pair, modeStruct, addition) {
    if (!pairExists(pair)) {
        return '100';
    }
    if (modeStruct.field0 == undefined) {
        modeStruct = {
            field0 : {
                value : modeStruct.value0
            },
            field0 : {
                value : modeStruct.value1
            },
        }
    }
    let value1  = Number((typeof(modeStruct.field0.value) === 'string') ? modeStruct.field0.value.replace(',', '') : modeStruct.field0.value);
    let value2  = Number((typeof(modeStruct.field1.value) === 'string') ? modeStruct.field1.value.replace(',', '') : modeStruct.field1.value);
    let volume1 = Number(pair.token_0.volume) / 10**10;
    let volume2 = Number(pair.token_1.volume) / 10**10;
    if (addition) {
        volume1 += value1;
        volume2 += value2;
    }
    let inputVolume = value1 * value2;
    let poolVolume = volume1 * volume2;
    let res = inputVolume * 100 / poolVolume;
    return (res > 100) ? 100 : res;
};

function divide(input_0, input_1) {
    try {
        return Number(input_0) / Number(input_1);
    } catch (e) {
        return 0;
    }
};

function getBalanceObj(balances, hash) {
    let balanceObj = balances.find(el => el.token == hash);
    if (balanceObj) {
        return balanceObj;
    } else
        return {
            amount : (hash) ? 0 : '-',
            decimals : 0,
            minable : 0, 
            reissuable : 0
        };
};

function getTokenObj(tokens, hash) {
    let tokenObj = tokens.find(el => el.hash == hash);
    if (tokenObj) {
        return tokenObj;
    } else
        return {
            hash : undefined,
            ticker : '-',
            caption : ''
        };
};

function countPortion (fullAmount, percent) {
    return Number(fullAmount) * (Number(percent) / 100);
};

function countPercentsByPortion (fullAmount, portion) {
    return (Number(portion) / Number(fullAmount)) * 100;
};

export default {
    countPercentsByPortion,
    countExchangeRate,
    countPoolShare,
    countPortion,
    getBalanceObj,
    getTokenObj,
    pairExists,
    searchSwap,
    divide
};