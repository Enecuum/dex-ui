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

    _tenPowerDecimals (decimals) {
        return BigInt('1' + '0'.repeat(decimals))
    }

    getPoolVolumesValidationRules (activePair, modeStruct, mode, pairExists) {
        let t0Value = 0, t0Max = 0, t1Value = 0, t1Max = 0, required = (mode === 'exchange' && pairExists)
        try {
            let fields = (modeStruct.field0.token.hash === activePair.token_0.hash) ? [0, 1] : [1, 0]
            let tmp0 = this._realignValueByDecimals(modeStruct.field0.value, {
                value : activePair[`token_${fields[0]}`].volume,
                decimals : modeStruct.field0.token.decimals
            })
            t0Value = tmp0.value
            t0Max = tmp0.max
            let tmp1 = this._realignValueByDecimals(modeStruct.field1.value, {
                value : activePair[`token_${fields[1]}`].volume,
                decimals : modeStruct.field1.token.decimals
            })
            t1Value = tmp1.value
            t1Max = tmp1.max
        } catch (e) {}
        return {
            token_0: {
                checks: [
                    {
                        method: 'isSet',
                        requireToCheck: required,
                        args: {data: t0Max},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'lessThan',
                        args: {
                            value: t0Value,
                            max: t0Max
                        },
                        requireToCheck: required,
                        desiredResult: true,
                        errMsg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE'
                    }
                ]
            },
            token_1: {
                checks: [
                    {
                        method: 'isSet',
                        requireToCheck: required,
                        args: {data: t1Max},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'lessThan',
                        args: {
                            value: t1Value,
                            max: t1Max
                        },
                        requireToCheck: required,
                        desiredResult: true,
                        errMsg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE'
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
            nativeToken: {
                ...this._getSwapCardBalanceRules({
                    required: true,
                    balance: swapCardData.nativeToken.balance,   // user balance
                    value: swapCardData.nativeToken.value        // network fee
                })
            }
        }
    }

    _getSwapCardBalanceRules (fieldData) {
        let value = 0, max = 0
        try {
            let {tV, Tm} = this._realignValueByDecimals(fieldData.value, {value : fieldData.balance.amount, decimals : fieldData.balance.decimals})
            value = tV
            max = Tm
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

    _realignValueByDecimals (value, max) {
        value.value = BigInt(value.value)
        max.value = BigInt(max.value)
        let diff = max.decimals - value.decimals
        if (diff > 0) {
            value.value *= this._tenPowerDecimals(diff)
        } else if (diff < 0) {
            diff *= -1
            max.value *= this._tenPowerDecimals(diff)
        }
        return {value : value.value, max : max.value}
    }
}

export default SwapCardValidationRules