function countExchangeRate(pair, firstPerSecond, modeStruct) {
    if (pair === undefined) {
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

function searchSwap(pairs, tokens) {
    let hashes = [tokens[0].hash, tokens[1].hash];
    return pairs.find(el => {
        if (hashes.indexOf(el.token_0.hash) != -1 &&
            hashes.indexOf(el.token_1.hash) != -1 &&
            el.token_0.hash !== el.token_1.hash) {
            return el;
        }
    });
};

function countPoolShare(pair, inputVolume) {
    if (pair === undefined) {
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
    searchSwap,
    divide
};