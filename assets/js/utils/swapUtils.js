function countExchangeRate(pair, firstPerSecond, modeStruct) {
    if (!pairExists(pair)) {
        return '-';
    }
    pair = { ...pair };
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

function countPoolShare(pair, modeStruct) {
    if (!pairExists(pair)) {
        return '-';
    }
    let inputVolume = Number(modeStruct.field0.value) * Number(modeStruct.field1.value);
    let poolVolume = Number(pair.token_0.volume) * Number(pair.token_1.volume);
    let res = divide(inputVolume, poolVolume) * 100;
    return (res > 100) ? 100 : res;
};

function divide(input_0, input_1) {
    try {
        return input_0 / input_1;
    } catch (e) {
        return 0;
    }
};

function getBalance(balances, hash, clear) {
    let tokenObj = balances.find(el => el.token == hash);
    if (tokenObj) {
        if (clear)
            return tokenObj;
        tokenObj.amount *= Math.pow(10, -tokenObj.decimals);
        tokenObj.decimals = 0;
        return tokenObj;
    } else
        return {
            amount : 0,
            decimals : 0,
            minable : 0, 
            reissuable : 0
        };
};

function countUserLtByPercentage(userLt, percent) {
    return userLt * (percent / 100);
};

export default {
    countUserLtByPercentage,
    countExchangeRate,
    countPoolShare,
    getBalance,
    pairExists,
    searchSwap,
    divide
};