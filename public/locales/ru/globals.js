let exchange = {
    "completePhrase" : "{{action}} {{value0}} {{ticker0}} на {{value1}} {{ticker1}}"
}

module.exports = {
    "info" : "Инфо",
    "submit" : "Отправить",
    "close" : "Закрыть",
    "transactionSubmitted" : "Транзакция подтверждена",
    "waitingForConfirmation" : "Ожидайте подтверждения",
    "transactionRejected" : "Транзакция отклонена",
    "tokenWallet" : "{{token}} кошелёк",
    "viewOnSite" :  "Смотреть на {{site}}",
    "pairPoolTokens" : "{{token0}}/{{token1}} Пул Токены",
    "receiveToken" : "{{token0}} Токены",
    "numberSign" : "#",
    "name" : "Наименование",
    "liquidity" : "Ликвидность",
    "volume" : "Объем",
    "fee" : "Комиссия",

    "noData" : "Нет данных",
    "noConnection" : "Отсутствует соединение.",
    "clickConnect" : "Пожалуйста, нажмите кнопку \"Подключение\" в навигационном меню",
    "tokens" : "Токены",
    "mainToken": "Основной токен",
    "stakeToken": "Stake токен",
    "farmStake": "Стейк фермы",
    "actionCost" : "Стоимость операции",
    "errorMsg" : {
        "REQUIRED": "Обязательное значение",
        "TOO_LONG_STRING": "Слишком длинная строка. Должно быть не более {{strLength}} символов",
        "INVALID_SYMBOLS": "Должны быть только латинские символы.",
        "NOT_IN_RANGE": "Неверное значение. Должно быть в пределе от {{min}} до {{max}}",
        "FEE_WRONG_TYPE": "Неверный тип комиссии",
        "INVALID_SYMBOLS_IN_DIGITAL_VALUE": "Недопустимые символы. Введненное значение не является целым или десятичным числом.",
        "INVALID_SYMBOLS_IN_NAMED_DIGITAL_VALUE": "Недопустимые символы. Введненное значение \"{{name}}\" не является целым или десятичным числом.",
        "TOO_LONG_FRACTIONAL_PART": "Число знаков в десятичной части не должно превышать {{decimals}}",
        "EXEED_MAX_VALUE_IN_TOKENS": "Не должно превышать {{maxValue}} {{ticker}}",
        "INTEGER_REQUIRED": "Значение должно быть целым числом",
        "MUST_BE_GREATER_THAN": "Значение должно быть больше {{minValue}}",
        "MUST_BE_LESS_THAN": "Значение должно быть меньше {{minValue}}",
        "MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE": "Значение должно быть больше или равно, чем {{name}}",
        "MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE": "Значение должно быть меньше или равно, чем {{name}}",
        "INSUFFICIENT_FUNDS_FOR_OPERATION": "Недостаточно средств для выполнения операции {{operationName}}.",
        "TOP_UP_BALANCE": "Пожалуйста, пополните баланс до {{value}} {{ticker}}.",
        "NAMED_VALUE_UNDEFINED" : "Не удалось определить \"{{name}}\"",
        "NAMED_VALUE_IS_INVALID" : "Неверное значение \"{{name}}\""
    },
    "confirm" : "Подтвердить",
    "status" : "Статус",
    "max" : "MAX",
    "balance" : "Баланс",
    "cancel" : "Отменить",
    "checkingMainTokenBalance" : "Проверка баланса нативного токена...",
    "txActionWords" : {
        "meanwhileSending" : {
            "pool_create" : "Создание",
            "pool_sell_exact" : "Обмен",
            "pool_buy_exact" : "Обмен",
            "pool_sell_exact_routed" : "Обмен",
            "pool_buy_exact_routed" : "Обмен",
            "pool_add_liquidity" : "Добавление",
            "pool_remove_liquidity" : "Удаление"
        },
        "history" : {
            "pool_create" : "Создание",
            "pool_sell_exact" : "Обмен",
            "pool_buy_exact" : "Обмен",
            "pool_sell_exact_routed" : "Обмен",
            "pool_buy_exact_routed" : "Обмен",
            "pool_add_liquidity" : "Добавление",
            "pool_remove_liquidity" : "Удаление",
            "farm_create" : "Создание",
            "farm_get_reward" : "Получение",
            "farm_increase_stake" : "Увеличение стейка",
            "farm_close_stake" : "Закрыть",
            "farm_decrease_stake" : "Уменьшение стейка",
            "dex_cmd_distribute" : "Добавление",
            "token_issue" : "Выпуск токена"
        }
    },
    "txActionPhrases" : {
        "pool_sell_exact_routed" : exchange,
        "pool_buy_exact_routed" : exchange,
        "pool_sell_exact" : exchange,
        "pool_buy_exact" : exchange,
        "pool_add_liquidity" : {
            "completePhrase" : "{{action}} ликвидности {{value0}} {{ticker0}} + {{value1}} {{ticker1}}"
        },
        "pool_create" : {
            "completePhrase" : "{{action}} пула {{value0}} {{ticker0}} и {{value1}} {{ticker1}}"
        },
        "pool_remove_liquidity" : {
            "completePhrase" : "{{action}} {{value2}} {{ticker2}}, извлечение {{value0}} {{ticker0}} и {{value1}} {{ticker1}}"
        },
        "farm_create" : {
            "completePhrase" : "{{action}} фермы {{ticker0}}-{{ticker1}}"
        },
        "farm_get_reward" : {
            "completePhrase" : "{{action}} награды {{value0}} {{ticker0}}"
        },
        "farm_increase_stake" : {
            "completePhrase" : "{{action}} {{value0}} {{ticker0}}"
        },
        "farm_close_stake" : {
            "completePhrase" : "{{action}} стейк {{ticker0}}-{{ticker1}}"
        },
        "farm_decrease_stake" : {
            "completePhrase" : "{{action}} {{value0}} {{ticker0}}"
        },
        "dex_cmd_distribute" : {
            "completePhrase" : "{{action}} {{value}} {{ticker}} на Space Station"
        },
        "token_issue" : {
            "completePhrase" : "{{action}} {{ticker}}"
        }
    },
    "blockWindow" : {
        "header" : "Ваше расширение заблокировано",
        "text" : "Пожалуйста, разблокируйте расширение"
    },
    "LPTokenOnCommanderBalance" : "LPToken on Commander balance",
    "mainTokenAmount" : "Баланс основного токена",
    "mainTokenDecimals" : "Decimals основного токена",
    "poolData" : "Данные пула",
    "errorBoundary" : {
        "header" : "Ой, что-то пошло не так!",
        "advice" : "Попробуйте перезагрузить страницу"
    },
    "add" : "Добавить",
    "remove" : "Удалить",
    "pooled" : "Добавлено в пул",
    "all" : "Все"
}