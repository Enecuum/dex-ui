module.exports = {
    "info" : "Info",
    "submit" : "Submit",
    "close" : "Close",
    "transactionSubmitted" : "Transaction was submitted",
    "waitingForConfirmation" : "Waiting for confirmation",
    "transactionRejected" : "Transaction was rejected",
    "tokenWallet" : "{{token}} wallet",
    "viewOnSite" :  "View on {{site}}",
    "pairPoolTokens" : "{{token0}}/{{token1}} Pool Tokens",
    "receiveToken" : "{{token0}} Tokens",
    "numberSign" : "#",
    "name" : "Name",
    "liquidity" : "Liquidity",
    "volume" : "Volume",
    "fee" : "Fee",
    "noData" : "No data",
    "noConnection" : "No connection.",
    "clickConnect" : "Please click the \"Connect\" button in the navigation menu",
    "tokens" : "Tokens",
    "mainToken": "Main token",
    "stakeToken": "Stake token",
    "farmStake" : "Stake on farm",
    "actionCost" : "Action's cost",
    "errorMsg" : {
        "REQUIRED":"Required",
        "TOO_LONG_STRING":"Sting too long. Must be {{strLength}} characters or less",
        "INVALID_SYMBOLS":"Invalid symbols. Must be only latin letters.",
        "NOT_IN_RANGE":"Incorrect value. Must be in the range of {{min}} to {{max}}",
        "FEE_WRONG_TYPE":"Wrong type of fee",
        "INVALID_SYMBOLS_IN_DIGITAL_VALUE":"Invalid symbols. Value must be integer or decimal value.",
        "INVALID_SYMBOLS_IN_NAMED_DIGITAL_VALUE": "Invalid symbols in \"{{name}}\".  Value must be integer or decimal value.",
        "TOO_LONG_FRACTIONAL_PART":"Fractional part too long. Must be {{decimals}} digits or less.",
        "EXEED_MAX_VALUE_IN_TOKENS":"Value must not exceed {{maxValue}} {{ticker}}",
        "INTEGER_REQUIRED":"Integer required",
        "MUST_BE_GREATER_THAN":"The value must be greater than {{minValue}}",
        "MUST_BE_LESS_THAN":"The value must be less than {{minValue}}",
        "MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE":"The value must be greater or equal than {{name}}",
        "MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE":"The value must be less or equal than {{name}}",
        "INSUFFICIENT_FUNDS_FOR_OPERATION": "Insufficient funds for the {{operationName}} operation.",
        "TOP_UP_BALANCE": "Please top up your balance to at least {{value}} {{ticker}}.",
        "NAMED_VALUE_UNDEFINED" : "{{name}} is undefined",
        "NAMED_VALUE_IS_INVALID" : "{{name}} is invalid"
    },
    "confirm" : "Confirm",
    "status" : "Status",
    "max" : "MAX",
    "balance" : "Balance",
    "cancel" : "Cancel",
    "checkingMainTokenBalance" : "Checking the balance of the native token...",
    "txActionWords" : {
        "meanwhileSending" : {
            "pool_create" : "Creating",
            "pool_sell_exact" : "Swapping",
            "pool_buy_exact" : "Swapping",
            "pool_add_liquidity" : "Adding",
            "pool_remove_liquidity" : "Removing"
        },
        "history" : {
            "pool_create" : "Create",
            "pool_sell_exact" : "Swap",
            "pool_buy_exact" : "Swap",
            "pool_add_liquidity" : "Add",
            "pool_remove_liquidity" : "Remove",
            "farm_create" : "Create",
            "farm_get_reward" : "Get",
            "farm_increase_stake" : "Stake",
            "farm_close_stake" : "Close",
            "farm_decrease_stake" : "Unstake",
            "dex_cmd_distribute" : "Add"
        }
    },
    "txActionPhrases" : {
        "pool_sell_exact" : {
            "completePhrase" : "{{action}} {{value0}} {{ticker0}} to {{value1}} {{ticker1}}"
        },
        "pool_buy_exact" : {
            "completePhrase" : "{{action}} {{value0}} {{ticker0}} to {{value1}} {{ticker1}}"
        },
        "pool_add_liquidity" : {
            "completePhrase" : "{{action}} liquidity {{value0}} {{ticker0}} + {{value1}} {{ticker1}}"
        },
        "pool_create" : {
            "completePhrase" : "{{action}} pool {{value0}} {{ticker0}} and {{value1}} {{ticker1}}"
        },
        "pool_remove_liquidity" : {
            "completePhrase" : "{{action}} {{value2}} {{ticker2}}, get {{value0}} {{ticker0}} and {{value1}} {{ticker1}}"
        },
        "farm_create" : {
            "completePhrase" : "{{action}} farm {{ticker0}}-{{ticker1}}"
        },
        "farm_get_reward" : {
            "completePhrase" : "{{action}} reward {{value0}} {{ticker0}}"
        },
        "farm_increase_stake" : {
            "completePhrase" : "{{action}} {{value0}} {{ticker0}}"
        },
        "farm_close_stake" : {
            "completePhrase" : "{{action}} stake {{ticker0}}-{{ticker1}}"
        },
        "farm_decrease_stake" : {
            "completePhrase" : "{{action}} {{value0}} {{ticker0}}"
        },
        "dex_cmd_distribute" : {
            "completePhrase" : "{{action}} {{value}} {{ticker}} to Space Station"
        }
    },
    "blockWindow" : {
        "header" : "Your extension was blocked",
        "text" : "Please, unlock the extension"
    },
    "LPTokenOnCommanderBalance" : "LPToken on Commander balance",
    "mainTokenAmount" : "Main token amount",
    "mainTokenDecimals" : "Main token decimals",
    "poolData" : "Pool data",
    "errorBoundary" : {
        "header" : "Oops, something went wrong!",
        "advice" : "Try to reload the page"
    },
    "add" : "Add",
    "remove" : "Remove",
    "pooled" : "Pooled",
    "all" : "All"
}