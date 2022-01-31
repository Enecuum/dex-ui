import testFormulas from "./testFormulas"

self.addEventListener("message", (msg) => {
    let data = msg.data
    let route = testFormulas.sellRoute(data.token0.hash, data.token1.hash, data.amount, data.pairs, data.tokens)
    self.postMessage(route)
})