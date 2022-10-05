module.exports = {
    "swapAddon" : {
        "priceImpact" : {
            "header" : "Price impact",
            "tooltip" : "Difference between the price before and after the swap you make."
        },
        "providerFee" : {
            "header" : "Liquidity provider fee",
            "tooltip" : "For each trade a 0.35% fee is paid"
        },
        "minimumReceived" : {
            "header" : "Minimum received",
            "tooltip" : "Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
        },
        "maximumSent" : {
            "header" : "Maximum sent",
            "tooltip" : "Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
        }
    },
    "lpTokensWalletInfo" : {
        "header" : "LP tokens in your wallet"
    },
    "switch" : {
        "mode0" : "Swap",
        "mode1" : "Pool"
    },
    "swapCard" : {
        "inputField" : {
            "balance" : "Balance",
            "selectToken" : "Select a token",
            "notEnoughLiquidity" : "not enough liquidity in the pool"
        },
        "exchange" : {
            "header" : "Swap",
            "description" : "Trade tokens with flat tx fees",
            "input0" : "From",
            "input1" : "To"
        },
        "liquidity" : {
            "header" : "Pool",
            "secondHeader" : "Add Liquidity",
            "description" : "Add liquidity to receive LP tokens",
            "addButton" : "Add liquidity",
            "yourLiquidity" : "Your liquidity",
            "yourLiquidityTooltip" : "Remove liquidity to receive tokens back",
            "additionInfo" : "If you staked your ENX tokens in a farm, unstake them to see them here.",
            "priceAndPoolShare" : "Price and pool share",
            "per" : "per",
            "shareOfPool" : "Share of pool",
            "Price" : "Price and pool share",
            "input0" : "Input",
            "input1" : "Input",
            "tooltipText" : "When you add liquidity, you are given pool tokens that represent your share.",
            "liquidityTokensZone" : {
                "yourPoolTokens" : "Available LP tokens",
                "stakedLPTokens" : "Staked LP tokens",
                "totalLPTokens" : "Total LP tokens",
                "poolShare" : "Pool share"
            }
        },
        "submitButton" : {
            "beforeConnection" : "Connect a wallet",
            "afterConnection" : "Submit",
            "addLiquidity" : "Add liquidity",
            "removeLiquidity" : "Remove liquidity",
            "fillAllFields" : "Fill all fields",
            "lackOfSecondVolume" : "Insufficient funds in the pool",
            "swap" : "Swap",
            "createPair" : "Create pair",

            "insufficientFunds" : "Insufficient funds",
            "invalidPool" : "Invalid pool"
        },
        "errorDescription" : {
            "field0" : "Check value of the first asset",
            "field1" : "Check value of the second asset",
            "ltfield" : "Check value of the third asset",
            "fullField0Value" : "The amount of the first asset must be less than the user's balance, taking into account native token commission (for native token)",
            "nativeToken" : "Not enough native coin to pay the fee",
            "route" : "Too much liquidity for pool"
        },
        "aboutButtonInfo" : {
            "withoutPair" : "There is no such pair",
            "lackOfLiquidity" : "Insufficient liquidity for this trade"
        },
        "removeLiquidity" : {
            "receive" : "Receive",
            "simple" : "Simple",
            "detailed" : "Detailed",
            "header" : "Remove Liquidity",
            "tooltipText" : "Remove liquidity tokens to get pool tokens",
            "input" : "Input"
        },
        "history" : {
            "header" : "History",
            "filters" : {
                "time" : {
                    "title" : "Time",
                    "oneHour" : "1h ago",
                    "twelveHours" : "12h ago",
                    "oneDay" : "1d ago"
                },
                "type" : {
                    "title" : "Type",
                    "allTypes" : "all types",
                    "pool" : "pool",
                    "swap" : "swap",
                    "farms" : "farms",
                    "drops" : "drops"
                }
            }
        },
        "settings" : {
            "header" : "Transaction settings",
            "slippageHeader" : "Slippage tolerance",
            "autoButton" : "Auto",
            "slippageTooltip" : "Your transaction will revert if the price changes unfavorably by more than this percentage"
        }
    },
    "tokenCard" : {
        "header" : "Choose a token",
        "search" : "Search by name",
        "tooltipText" : "When you add liquidity, you are given pool tokens that represent your share.",
        "tokenName" : "Token name",
        "raiseUpTrustedTokens" : "raise up trusted tokens",
        "raiseUpBalances" : "raise up tokens with non zero balances",
        "raiseUpLpTokens" : "raise up lp tokens"
    },
    "confirmCard" : {
        "header" : "You will receive",
        "poolTokens" : "Pool Tokens",
        "description" : "Output is estimated. If the price changes by more than 1% your transaction will revert.",
        "deposited" : "Deposited",
        "swapped" : "Swapped",
        "toBeReceived" : "To be received",
        "rates" : "Rates",
        "shareOfPool" : "Share of pool",
        "feeData" : "Fee of transaction",
        "confirm" : "Confirm Swap",
        "waitingForConfirmation" : "Waiting for confirmation",
        "confirmInWallet" : "Confirm this transaction in your wallet",
        "waitingForConfirmationInternals" : {
            "swap" : {
                "completePhrase" : "Swapping {{value0}} {{ticker0}} to {{value1}} {{ticker1}}"
            },
            "addLiquidity" : {
                "completePhrase" : "Adding liquidity {{value0}} {{ticker0}} + {{value1}} {{ticker1}}"
            },
            "createPool" : {
                "completePhrase" : "Creating pool {{value0}} {{ticker0}} and {{value1}} {{ticker1}}"
            },
            "removeLiquidity" : {
                "completePhrase" : "Removing liquidity"
            }
        }
    }
}