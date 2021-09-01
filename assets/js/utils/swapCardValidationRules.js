class SwapCardValidationRules {
    constructor (translationFunction) {
        this.t = translationFunction
    }

    getSwapFieldValidationRules (fieldData) {
        let validationRules = {
            balanceAmount : {
                checks : [
                    {
                        method: 'isSet',
                        args: {data : fieldData.balanceAmount},
                        desiredResults: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'checkValidDigitalValue',
                        args: fieldData.balanceAmount,
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE',
                    }
                ]
            },
            balanceDecimals : {
                checks : [
                    {
                        method: 'isSet',
                        args: {data : fieldData.balanceDecimals},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    }
                ]
            },
            valueText : {
                checks : [
                    {
                        method: 'isSet',
                        args: {data : fieldData.valueText},
                        desiredResults: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'matchToFixed',
                        args: {value : valueText, n : balanceDecimals},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE',
                    }
                ]
            }
        }
        return validationRules
    }

    getSwapCardValidationRules (swapCardData) {
        let validationRules = {
            firstValue : {
                ...this._getSwapCardBalanceRule({
                    required : (swapCardData.mode === 'exchange' || swapCardData.mode === 'liquidity') ? true : false,
                    balanceAmount : swapCardData.firstValueBalanceAmount,
                    balanceDecimals : swapCardData.firstValueBalanceDecimals,
                    valueAmount : swapCardData.firstValueValueAmount,
                    valueDecimals : swapCardData.firstValueValueDecimals
                })
            },
            secondValue : {
                ...this._getSwapCardBalanceRule({
                    required : (swapCardData.mode === 'liquidity') ? true : false,
                    balanceAmount : swapCardData.secondValueBalanceAmount,
                    balanceDecimals : swapCardData.secondValueBalanceDecimals,
                    valueAmount : swapCardData.secondValueValueAmount,
                    valueDecimals : swapCardData.secondValueValueDecimals
                })
            },
            ltValue : {
                ...this._getSwapCardBalanceRule({
                    required : (swapCardData.mode === 'removeLiquidity') ? true : false,
                    balanceAmount : swapCardData.ltValueBalanceAmount,
                    balanceDecimals : swapCardData.ltValueBalanceDecimals,
                    valueAmount : swapCardData.ltValueValueAmount,
                    valueDecimals : swapCardData.ltValueValueDecimals
                })
            }
            // TODO: check native token balance (should be more or equal than fee)
        }
        return validationRules
    }

    _getSwapCardBalanceRules (filedData) {
        let balanceRules = {
            checks : [
                {
                    method : 'isSet',
                    args: {data : fieldData},
                    desiredResults: true,
                    errMsg: 'REQUIRED'
                },
                {
                    requireToCheck: filedData.required,
                    method: 'lessThan',
                    args: {
                        value : BigInt(filedData.valueAmount) * BigInt(Math.pow(10, filedData.valueDecimals)), 
                        max : BigInt(filedData.balanceAmount) * BigInt(Math.pow(10, filedData.balanceDecimals))
                    },
                    desiredResult: true,
                    errMsg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE'
                }
            ]
        }
        return balanceRules
    }

}

export default SwapCardValidationRules