module.exports = {
    "swapAddon" : {
        "priceImpact" : {
            "header" : "Влияние на цену",
            "tooltip" : "Разница между рыночной и расчётной ценой согласно размеру сделки."
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
            "selectToken" : "Выберите токен"
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
            "tooltipText" : "Когда вы добавляете ликвидность, вам выдаются токены пула, которые представляют вашу долю."
        },
        "submitButton" : {
            "beforeConnection" : "Подключите кошелёк",
            "afterConnection" : "Отправить",
            "addLiquidity" : "Добавить ликвидность",
            "removeLiquidity" : "Удалить ликвидность",
            "fillAllFields" : "Заполните все поля",
            "swap" : "Обменять",
            "createPair" : "Создать пару",
            "insufficientFunds" : "Недостаточно средств",
            "invalidPool" : "Такой пул не существует"
        },
        "errorDescription" : {
            "field0" : "Проверьте размер первого актива",
            "field1" : "Проверьте размер второго актива",
            "ltfield" : "Проверьте размер третьего актива",
            "fullField0Value" : "Сумма первого актива и комиссии провайдера должна быть меньше баланса пользователя",
            "nativeToken" : "Недостаточно нативных монет для оплаты комиссии за транзакцию"
        },
        "aboutButtonInfo" : {
            "withoutPair" : "Такой пары не существует",
            "lackOfLiquidity" : "Недостаточная ликвидность для обмена"
        },
        "removeLiquidity" : {
            "amount" : "Количество",
            "price" : "Цена",
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
                    "oneHour" : "1ч назад",
                    "twelveHours" : "12ч назад",
                    "oneDay" : "1д назад"
                },
                "type" : {
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
            "autoButton" : "Авто",
            "slippageTooltip" : "Ваша транзакция откатится, если цена изменится не в вашу пользу более, чем на этот процент."
        }
    },
    "tokenCard" : {
        "header" : "Выберите токен",
        "search" : "Поиск по имени",
        "tooltipText" : "Когда вы добавляете ликвидность, вам выдаются токены пула, которые представляют вашу долю.",
        "tokenName" : "Токены"
    },
    "confirmCard" : {
        "header" : "Вы получите",
        "poolTokens" : "Токенов ликвидности",
        "description" : "Приблизительный результат. Если цена изменится более чем на 1%, ваша транзакция будет отменена.",
        "deposited" : "Внесено",
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