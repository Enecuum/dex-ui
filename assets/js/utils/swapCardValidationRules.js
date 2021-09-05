class SwapCardValidationRules {
    constructor (translationFunction) {
        this.t = translationFunction
    }

    getActivePairValidationRules (activePair) {
        return {
            token_0: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: activePair.token_0.hash},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    }
                ]
            },
            token_1: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: activePair.token_1.hash},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    }
                ]
            }
        }
    }

    getSwapFieldValidationRules (fieldData) {
        return {
            balance: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: fieldData.balance.amount},
                        desiredResult: true,
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
                        method: 'testTheRegExp',
                        args: {str: fieldData.value.text, regExpObj: /^([0-9]+(\.|,))?[0-9]*$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: fieldData.value.text, regExpObj: /^0(0)+/},
                        desiredResult: false,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'
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
        let ltData = {balance : 0, value : 0}
        if (swapCardData.ltfield)
            ltData = swapCardData.ltfield

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
                    balance: ltData.balance,
                    value: ltData.value
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
        let value = 0, max = 0
        try {
            value = BigInt(fieldData.value.value) * BigInt(Math.pow(10, fieldData.value.decimals))
            max = BigInt(fieldData.balance.amount) * BigInt(Math.pow(10, fieldData.balance.decimals))
        } catch (e) {}
        return {
            checks: [
                {
                    method: 'isSet',
                    args: {data: fieldData},
                    desiredResult: true,
                    errMsg: 'REQUIRED'
                },
                {
                    requireToCheck: fieldData.required,
                    method: 'lessThan',
                    args: {
                        value: value,
                        max: max
                    },
                    desiredResult: true,
                    errMsg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE'
                }
            ]
        }
    }

}

export default SwapCardValidationRules