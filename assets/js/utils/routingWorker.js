import testFormulas from "./testFormulas"

self.addEventListener("message", (msg) => {
    let data = msg.data, route
    if (msg.data.mode === "sell")
        route = testFormulas.sellRoute(data.token0.hash, data.token1.hash, data.amount, data.pairs, data.tokens, data.limit)
    else
        route = testFormulas.sellRouteRev(data.token0.hash, data.token1.hash, data.amount, data.pairs, data.tokens, data.limit)
    self.postMessage(route)
})