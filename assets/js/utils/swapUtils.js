function countExchangeRate(pair, firstPerSecond, modeStruct) {
    if (!pairExists(pair)) {
        console.log(pair);
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

function countPoolShare(pair, inputVolume) {
    if (!pairExists(pair)) {
        return '-';
    }
    let poolVolume = pair.token_0.volume + pair.token_1.volume;
    return divide(inputVolume, poolVolume);
};

function divide(input_0, input_1) {
    try {
        return input_1 / input_0;
    } catch (e) {
        return 0;
    }
};

export default {
    countExchangeRate,
    countPoolShare,
    pairExists,
    searchSwap,
    divide
};