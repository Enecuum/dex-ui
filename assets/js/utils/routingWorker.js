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
    else if ((data.mode === "buy"))
        route = testFormulas.sellRouteRev(
            data.token0.hash,
            data.token1.hash,
            data.amount,
            data.pairs,
            data.tokens,
            data.limit,
            data.slippage
        )
    else 
        return
    self.postMessage(route)
})
