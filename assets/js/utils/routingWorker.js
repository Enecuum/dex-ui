import testFormulas from "./testFormulas"

self.addEventListener("message", (msg) => {
    let data = msg.data, route
    if (data.mode === "sell")
        route = testFormulas.sellRoute(
            data.token0.hash,
            data.token1.hash,
            data.amount,
            data.pairs,
            data.tokens,
            data.limit,
            data.slippage
        )
    else
        route = testFormulas.sellRouteRev(
            data.token0.hash,
            data.token1.hash,
            data.amount,
            data.pairs,
            data.tokens,
            data.limit,
            data.slippage
        )
    self.postMessage(route)
})
