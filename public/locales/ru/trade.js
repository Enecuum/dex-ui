module.exports = {
    "swapAddon" : {
        "priceImpact" : {
            "header" : "Влияние на цену",
            "tooltip" : "Разница между ценами до и после выполнения свопа."
        },
        "providerFee" : {
            "header" : "Комиссия поставщика ликвидности",
            "tooltip" : "За каждую сделку выплачивается комиссия в размере 0,35%"
        },
        "minimumReceived" : {
            "header" : "Минимум к получению",
            "tooltip" : "Ваша транзакция будет возвращена, если произойдет значительное неблагоприятное изменение цены до того, как транзакция подтвердится."
        },
        "maximumSent" : {
            "header" : "Максимум к продаже",
            "tooltip" : "Ваша транзакция будет возвращена, если произойдет значительное неблагоприятное изменение цены до того, как транзакция подтвердится."
        }
    },
    "lpTokensWalletInfo" : {
        "header" : "Ваши токены ликвидности"
    },
    "switch" : {
        "mode0" : "Обмен",
        "mode1" : "Пулы"
    },
    "swapCard" : {
        "inputField" : {
            "balance" : "Баланс",
            "selectToken" : "Выберите токен",
            "notEnoughLiquidity" : "недостаточно ликвидности в пуле"
        },
        "exchange" : {
            "header" : "Обмен",
            "description" : "Торговля токенами в одно мгновение",
            "input0" : "Из",
            "input1" : "В"
        },
        "liquidity" : {
            "header" : "Пулы",
            "secondHeader" : "Добавить Ликвидность",
            "description" : "Добавить ликвидность для получения LP токенов",
            "addButton" : "Добавить",
            "yourLiquidity" : "Ваша ликвидность",
            "yourLiquidityTooltip" : "Чтобы вернуть токены, удалите ликвидность",
            "additionInfo" : "Если вы вложили токены ENX в ферму, верните их, и они появятся тут.",
            "priceAndPoolShare" : "Цена и доля в пуле",
            "per" : "на",
            "shareOfPool" : "Доля в пуле",
            "input0" : "Ввод",
            "input1" : "Ввод",
            "tooltipText" : "Когда вы добавляете ликвидность, вам выдаются токены пула, которые представляют вашу долю.",
            "liquidityTokensZone" : {
                "yourPoolTokens" : "Доступные LP токены",
                "stakedLPTokens" : "Вложенные LP токены",
                "totalLPTokens" : "Общее количество LP токенов",
                "poolShare" : "Доля в пуле"
            }
        },
        "submitButton" : {
            "beforeConnection" : "Подключите кошелёк",
            "afterConnection" : "Отправить",
            "addLiquidity" : "Добавить ликвидность",
            "removeLiquidity" : "Удалить ликвидность",
            "fillAllFields" : "Заполните все поля",
            "lackOfSecondVolume" : "Недостаточное количество средств в пуле",
            "swap" : "Обменять",
            "createPair" : "Создать пару",
            "noLiquidityForSwap" : "Нулевая ликвидность",
            "insufficientFunds" : "Недостаточно средств",
            "invalidPool" : "Такой пул не существует"
        },
        "errorDescription" : {
            "field0" : "Проверьте размер первого актива",
            "field1" : "Проверьте размер второго актива",
            "ltfield" : "Проверьте размер третьего актива",
            "fullField0Value" : "Сумма первого актива должна быть меньше баланса пользователя с учетом комиссии (для нативного токена)",
            "nativeToken" : "Недостаточно нативных монет для оплаты комиссии за транзакцию",
            "route" : "Too much liquidity for pool"
        },
        "aboutButtonInfo" : {
            "withoutPair" : "Такой пары не существует",
            "lackOfLiquidity" : "Недостаточная ликвидность для обмена"
        },
        "removeLiquidity" : {
            "receive" : "К получению",
            "simple" : "Упрощённый вид",
            "detailed" : "Детальный вид",
            "header" : "Удалить Ликвидность",
            "tooltipText" : "Удалите токены ликвидности для получения токенов пула",
            "input" : "Ввод"
        },
        "history" : {
            "header" : "История",
            "filters" : {
                "time" : {
                    "title" : "Время",
                    "oneHour" : "1ч назад",
                    "twelveHours" : "12ч назад",
                    "oneDay" : "1д назад"
                },
                "type" : {
                    "title" : "Тип",
                    "allTypes" : "все типы",
                    "pool" : "пулы",
                    "swap" : "свопы",
                    "farms" : "фермы",
                    "drops" : "дропы"
                }
            }
        },
        "settings" : {
            "header" : "Настройки транзакций",
            "slippageHeader" : "Допустимое проскальзывание",
            "autoButton" : "По умолчанию",
            "slippageTooltip" : "Ваша транзакция откатится, если цена изменится не в вашу пользу более, чем на этот процент."
        }
    },
    "tokenCard" : {
        "header" : "Выберите токен",
        "search" : "Поиск по имени",
        "tooltipText" : "Когда вы добавляете ликвидность, вам выдаются токены пула, которые представляют вашу долю.",
        "tokenName" : "Токены",
        "raiseUpTrustedTokens" : "поднять в списке доверенные токены",
        "raiseUpBalances" : "поднять в списке токены с ненулевыми балансами",
        "raiseUpLpTokens" : "поднять в списке токены ликвидности"
    },
    "confirmCard" : {
        "header" : "Вы получите",
        "poolTokens" : "Токенов ликвидности",
        "description" : "Приблизительный результат. Если цена изменится более чем на 1%, ваша транзакция будет отменена.",
        "deposited" : "Внесено",
        "swapped" : "Обменивается",
        "toBeReceived" : "Будет получено",
        "rates" : "Курс",
        "shareOfPool" : "Доля в пуле",
        "feeData" : "Комиссия транзакции",
        "confirm" : "Подтверждение",
        "waitingForConfirmation" : "Ожидание подтверждения",
        "confirmInWallet" : "Подтвердите вашу транзакцию в кошельке",
        "waitingForConfirmationInternals" : {
            "swap" : {
                "completePhrase" : "Обмен {{value0}}{{ticker0}} на {{value1}}{{ticker1}}",
                "header" : "Обмен",
                "to" : "на"
            },
            "addLiquidity" : {
                "completePhrase" : "Добавление ликвидности {{value0}}{{ticker0}} + {{value1}}{{ticker1}}",
                "header" : "Добавление ликвидности",
                "plus" : "+"
            },
            "createPool" : {
                "completePhrase" : "Создание пула {{value0}}{{ticker0}} и {{value1}}{{ticker1}}",
                "header" : "Создание пула",
                "and" : "и"
            }
        }
    }
}
