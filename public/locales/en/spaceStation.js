module.exports = {
    "aim" : "Space station aims to distribute 0.05% Enex swap fee to ENX stakers. Fees are accumulated in Enex treasury in the form of LP tokens. Any user may call \"Distribute\" event to trade these LPs for ENX in a corresponding pools. ENX will be added to Space Station  rewards proportionally to stakers shares.",
    "treasuryFund" : {
        "header" : "Enex treasury",
        "tooltip" : "Amount of LP tokens gathered as fees from swaps and available for swap into ENX in corresponding pools by calling 'Distribute' method"
    },
    "estimation" : {
        "header" : "Estimation",
        "tooltip" : "Estimated amount of ENX to be shared between Enex Station stackers by calling \"Distribute\" method"
    },
    "enxPriceInPool" : {
        "header" : "ENX price in pool",
        "tooltip" : "Approximate ENX price in LP/ENX pools that take part in Station"
    },
    "priceImpact" : {
        "header" : "Price impact",
        "tooltip" : "Difference between the price before and after the distribution you make"
    }
}