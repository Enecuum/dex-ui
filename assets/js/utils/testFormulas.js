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

export default {
    getAddLiquidityPrice,
    countLiqudity,
    getSwapPrice
};