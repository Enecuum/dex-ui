module.exports = {
    "aim" : "Space station aims to distribute 0.05% Enex swap fee to ENX stakers. Fees are accumulated in Enex treasury in the form of LP tokens. Any user may call \"Distribute\" event to trade these LPs for ENX in a corresponding pools. ENX will be added to Space Station  rewards proportionally to stakers shares.",
    "treasuryFund" : {
        "header" : "Enex treasury",
        "tooltip" : "LP tokens are burned by Commander ENEX daily based, which guarantees availability of liquidity in this trading pair in equivalent of burned"
    },
    "estimation" : {
        "header" : "Estimation",
        "tooltip" : "LP tokens proposed to be converted to ENX and rewarded to ENX stakers daily based"
    },
    "enxPriceInPool" : {
        "header" : "ENX price in pool",
        "tooltip" : "ENX price according to the exchange rate in the pool"
    },
    // priceImpact from trade.swapAddon.priceImpact
    "poolShare" : {
        "header" : "Pool share",
        "tooltip" : "The ratio of the volume of your tokens to the total volume of the pool"
    }
}