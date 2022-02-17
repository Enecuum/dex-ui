module.exports = {
    "aim" : "Space station aims to distribute 0.05% Enex swap fee to ENX stakers. Fees are accumulated in Enex treasury in the form of LP tokens. Any user may call \"Distribute\" event to trade these LPs for ENX in a corresponding pools. ENX will be added to Space Station  rewards proportionally to stakers shares.",
    "treasuryFund" : {
        "header" : "Enex treasury",
        "tooltip" : "Токены LP сжигаются Commander ENEX ежедневно, что гарантирует наличие ликвидности в торговой паре в эквиваленте сожженных"
    },
    "estimation" : {
        "header" : "Estimation",
        "tooltip" : "Токены LP предлагается конвертировать в ENX и вознаграждать ENX-стейкеров ежедневно"
    },
    "enxPriceInPool" : {
        "header" : "Цена ENX в пуле",
        "tooltip" : "Цена ENX в соответствии с обменным курсом в пуле"
    },
    // priceImpact from trade.swapAddon.priceImpact
    "poolShare" : {
        "header" : "Доля в пуле",
        "tooltip" : "Отношение объема ваших токенов к общему объему пула"
    }
}