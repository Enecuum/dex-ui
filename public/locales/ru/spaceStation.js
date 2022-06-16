module.exports = {
    "aim" : "Space station aims to distribute 0.05% Enex swap fee to ENX stakers. Fees are accumulated in Enex treasury in the form of LP tokens. Any user may call \"Distribute\" event to trade these LPs for ENX in a corresponding pools. ENX will be added to Space Station  rewards proportionally to stakers shares.",
    "treasuryFund" : {
        "header" : "Enex treasury",
        "tooltip" : "LP токены, собранные в качестве комиссии от обменов и доступные для обмена на ENX в соответствующих пулах методом 'Distribute'"
    },
    "estimation" : {
        "header" : "Estimation",
        "tooltip" : "Предполагаемое количество ENX, которое будет распределено между Enex Station стейкерами методом 'Distribute'"
    },
    "enxPriceInPool" : {
        "header" : "Цена ENX в пуле",
        "tooltip" : "Приблизительная цена ENX в LP/ENX пуле которые находятся в Station"
    },
    "priceImpact" : {
        "header" : "Влияние на цену",
        "tooltip" : "Разница между ценами до и после выполнения распределения."
    }
}