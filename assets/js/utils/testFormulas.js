import utils from './swapUtils';

function getAddLiquidityPrice (input_0, input_1, coinValue) {
    return utils.divide(input_0, input_1) * coinValue;
};

function countLiqudity (pair) {
    return pair.token_0.volume * pair.token_1.volume;
};

function getSwapPrice (pair, amountIn) {
    if (amountIn == 0) // use 'if' instead of try/catch in order to check empty string
        return 0;
    return (1 - pair.pool_fee) * countLiqudity(pair) / amountIn;
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
        return Math.sqrt(required_1 * amount_2);
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