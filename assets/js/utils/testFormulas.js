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

function countEnxAmount (pair, amount_2) {
    try {
        let required_1 = pair.token_0.volume * amount_2 / pair.token_1.volume;
        return Math.sqrt(required_1 * amount_2);
    } catch (err) {}
};

export default {
    getAddLiquidityPrice,
    countEnxAmount,
    countLiqudity,
    getSwapPrice
};