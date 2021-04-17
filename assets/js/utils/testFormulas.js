import utils from './swapUtils';

function getAddLiquidityPrice (input_0, input_1, coinValue) {
    return utils.divide(input_0, input_1) * coinValue;
};

function countLiqudity (pair) {
    return pair.token_0.volume * pair.token_1.volume;
};

function getSwapPrice (volume0, volume1, amountIn) {
    if (amountIn == 0) // use 'if' instead of try/catch in order to check empty string
        return 0;
    return volume1 - (volume0 * volume1) / (volume0 + amountIn);
};

function countEnxAmount (pair, uiPair, mode) {
    // create pool case
    if (!utils.pairExists(pair)) {
        return Math.sqrt(uiPair.field0.value * uiPair.field1.value);
    }
    // exchange mode has no lt-calculations
    // https://github.com/Enecuum/docs/issues/6
    if (mode == 'exchange') {
        return 0;
    } else if (mode == 'liquidity') {
        let required_1 = pair.token_0.volume * uiPair.field1.value / pair.token_1.volume;
        return Math.sqrt(required_1 * uiPair.field1.value);
    }
    // dev warning
    return 'wrong mode';
};

export default {
    getAddLiquidityPrice,
    countEnxAmount,
    countLiqudity,
    getSwapPrice
};