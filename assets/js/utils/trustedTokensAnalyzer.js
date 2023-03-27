import utils from './swapUtils'

self.addEventListener("message", (msg) => {
    let data = msg.data
    if (data.mode !== "trusted_tokens_analyzer")
        return

    let prevTrusted = []
    let pairs = data.pairs
    let curTrusted = data.trustedTokens, pairToSearch = pairs

    while (curTrusted.length !== prevTrusted.length) {
        let {newTrusted, pairsRemainder} = count_new_trusted_tokens(pairToSearch, curTrusted)
        pairToSearch = pairsRemainder
        prevTrusted = curTrusted
        curTrusted = curTrusted.concat(newTrusted)
    }

    self.postMessage(curTrusted)
})

let isLp = function (pairs, hash) {
    let res = utils.searchByLt(pairs, hash)
    if (res === undefined)
        return false
    return res
}

let isTrusted = function (trustedTokens, hash) {
    return trustedTokens.find(token => token === hash)
}

let count_new_trusted_tokens = function (pairs, trustedTokens) {
    let newTrusted = [], pairsRemainder = []
    pairs.forEach(pair => {
        let token0 = pair.token_0.hash
        let token1 = pair.token_1.hash
        
        if (isTrusted(trustedTokens, token0) && isTrusted(trustedTokens, token1)) {
            newTrusted.push(pair.lt)
            return
        }
        let lp0 = isLp(pairs, token0)
        let lp1 = isLp(pairs, token1)
        if (lp0 && lp1) {
            pairsRemainder.push(pair)
        } else if (!lp0 && isTrusted(trustedTokens, token0)) {
            if (lp1)
                pairsRemainder.push(pair)
        } else if (!lp1 && isTrusted(trustedTokens, token1)) {
            if (lp0)
                pairsRemainder.push(pair)
        }
    })

    return {newTrusted, pairsRemainder}
}
