import testFormulas from "./testFormulas"

self.addEventListener("message", (msg) => {
    let data = msg.data
    let route = testFormulas.sellRoute(data.token0, data.token1, data.amount, data.pairs)
    self.postMessage(route)
})