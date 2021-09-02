class SwapCardValidationRules {
    constructor (translationFunction) {
        this.t = translationFunction
    }

    getSwapFieldValidationRules (fieldData) {
        return {
            balance: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: fieldData.balance.amount},
                        desiredResults: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'checkValidDigitalValue',
                        args: fieldData.balance.amount,
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE',
                    },
                    {
                        method: 'isSet',
                        args: {data: fieldData.balance.decimals},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    }
                ]
            },
            value: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: fieldData.value.text},
                        desiredResults: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'matchToFixed',
                        args: {value: fieldData.value.text, n: fieldData.balance.decimals},
                        desiredResult: true,
                        errMsg: 'TOO_LONG_FRACTIONAL_PART',
                    }
                ]
            }
        }
    }

    getSwapCardValidationRules (swapCardData, mode) {
        return {
            field0: {
                ...this._getSwapCardBalanceRules({
                    required: (mode === 'exchange' || mode === 'liquidity'),
                    balance: swapCardData.field0.balance,
                    value: swapCardData.field0.value
                })
            },
            field1: {
                ...this._getSwapCardBalanceRules({
                    required: (mode === 'liquidity'),
                    balance: swapCardData.field1.balance,
                    value: swapCardData.field1.value
                })
            },
            ltfield: {
                ...this._getSwapCardBalanceRules({
                    required: (mode === 'removeLiquidity'),
                    balance: swapCardData.ltfield.balance,
                    value: swapCardData.ltfield.value
                })
            },
            // TODO: check native token balance (should be more or equal than fee)
            // nativeToken: {
            //     ...this._getSwapCardBalanceRules({
            //         required: true,
            //         balance: swapCardData.nativeToken.balance,   // user balance
            //         value: swapCardData.nativeToken.value        // network fee
            //     })
            // }
        }
    }

    _getSwapCardBalanceRules (fieldData) {
        return {
            checks: [
                {
                    method: 'isSet',
                    args: {data: fieldData},
                    desiredResults: true,
                    errMsg: 'REQUIRED'
                },
                {
                    requireToCheck: fieldData.required,
                    method: 'lessThan',
                    args: {
                        value: BigInt(fieldData.value.amount) * BigInt(Math.pow(10, fieldData.value.decimals)),
                        max: BigInt(fieldData.balance.amount) * BigInt(Math.pow(10, fieldData.balance.decimals))
                    },
                    desiredResult: true,
                    errMsg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE'
                }
            ]
        }
    }

}

export default SwapCardValidationRules