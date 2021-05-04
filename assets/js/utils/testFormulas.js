import utils from './swapUtils';
import ValueProcessor from './ValueProcessor';

const vp = new ValueProcessor();

function getAddLiquidityPrice (input_0, input_1, coinValue) {
    console.log(input_0);
    console.log(input_1);
    console.log(coinValue);

    let mul = vp.mul(input_0, coinValue);
    let res = vp.div(mul ,    input_1);
    return vp.usCommasBigIntDecimals(res.value, res.decimals).replace(/\.0*$/,'.0');
};

function countLiqudity (pair) {
    return pair.token_0.volume * pair.token_1.volume;
};

function getSwapPrice (volume0, volume1, amountIn) { // handle only custom BigInt
    if (amountIn == 0) // use 'if' instead of try/catch in order to check empty string
        return 0;
    let mul = vp.mul(volume0, volume1);
    let add = vp.add(volume0, amountIn);
    let div = vp.div(mul,     add);
    let res = vp.sub(volume1, div);
    return vp.usCommasBigIntDecimals(res.value, res.decimals).replace(/\.0*$/,'.0');
};

function countLTAmount (pair, uiPair, mode) {
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

function ltDestruction (pair, total, trio, chField) { // trio = {amount_lt, amount_1, amount_2}
    if (total == 0)
        return {
            amount_lt : 0,
            amount_1  : 0,
            amount_2  : 0
        };
    if (chField == 'ltfield') {
        return {
            amount_lt : trio.amount_lt,
            amount_1  : Number(pair.token_0.volume) * utils.divide(trio.amount_lt, total),
            amount_2  : Number(pair.token_1.volume) * utils.divide(trio.amount_lt, total)
        };
    } else if (chField == 'field0') {
        let lt = Number(trio.amount_1) / Number(pair.token_0.volume) * Number(total);
        return {
            amount_1  : trio.amount_1,
            amount_2  : Number(pair.token_1.volume) * lt / Number(total),
            amount_lt : lt
        };
    } else if (chField == 'field1') {
        let lt = Number(trio.amount_2) / Number(pair.token_1.volume) * Number(total);
        return {
            amount_2  : trio.amount_2,
            amount_1  : Number(pair.token_0.volume) * lt / Number(total),
            amount_lt : lt
        };
    }
};

export default {
    getAddLiquidityPrice,
    ltDestruction,
    countLTAmount,
    countLiqudity,
    getSwapPrice
};