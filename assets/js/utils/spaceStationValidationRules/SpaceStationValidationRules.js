import ValueProcessor from '../ValueProcessor';

class SpaceStationValidationRules {
	constructor(translateFunction) {
        this.t = translateFunction;
        this.amountOfRules = 8;
        this.valueProcessor = new ValueProcessor;
    }

    getValidationRulesStep_0(poolData) {
        let validationRules = {
            LPTokenOnCommanderBalance: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: poolData.LPTokenOnCommanderBalance},
                        desiredResult: true,
                        errMsg: {
                            msg: 'NAMED_VALUE_UNDEFINED',
                            params: {
                                    params: {
                                        name: this.t('poolData')
                                    }
                            }
                        }
                    }
                ]
            }
        }
        return validationRules;
    }
    getValidationRulesStep_1(poolData) {
        let validationRules = {
            LPTokenOnCommanderBalance: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: poolData.LPTokenOnCommanderBalance.amount},
                        desiredResult: true,
                        errMsg: {
                            msg: 'NAMED_VALUE_UNDEFINED',
                            params: {
                                    params: {
                                        name: this.t('LPTokenOnCommanderBalance')
                                    }
                            }
                        }
                    }
                ]
            }
        }
        return validationRules;
    }
    getValidationRulesStep_2(poolData) {
        let validationRules = {
            LPTokenOnCommanderBalance: {
                checks: [                    
                    {
                        method: 'checkValidDigitalValue',
                        args: poolData.LPTokenOnCommanderBalance.amount,
                        desiredResult: true,
                        errMsg: {
                            msg: 'INVALID_SYMBOLS_IN_NAMED_DIGITAL_VALUE',
                            params: {
                                name: this.t('LPTokenOnCommanderBalance')
                            }
                        }                               
                    }
                ]
            }
        }
        return validationRules;
    }
    getValidationRulesStep_3(poolData) {
        let validationRules = {
            LPTokenOnCommanderBalance: {
                checks: [
                    {
                        method: 'moreThan',
                        args: {value: BigInt(poolData.LPTokenOnCommanderBalance.amount), max: 0n},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        maxValue: 0,
                                        ticker: poolData.ticker_LP
                                    }
                                }
                    }
                ]
            }
        }
        return validationRules;
    }

    getValidationRulesStep_4(mainTokenBalance) {
        let validationRules = {
            mainTokenAmount: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: mainTokenBalance.mainTokenAmount},
                        desiredResult: true,
                        errMsg: {
                            msg: 'NAMED_VALUE_UNDEFINED',
                            params: {
                                    params: {
                                        name: this.t('mainTokenAmount')
                                    }
                            }
                        }
                    }
                ]
            }
        }
        return validationRules;
    }
    getValidationRulesStep_5(mainTokenBalance) {
        let validationRules = {
            mainTokenDecimals: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: mainTokenBalance.mainTokenDecimals},
                        desiredResult: true,
                        errMsg: {
                            msg: 'NAMED_VALUE_UNDEFINED',
                            params: {
                                    params: {
                                        name: this.t('mainTokenDecimals')
                                    }
                            }
                        }
                    }
                ]
            }
        }
        return validationRules;
    }
    getValidationRulesStep_6(mainTokenBalance) {
        let validationRules = {
            mainTokenAmount: {
                checks: [                    
                    {
                        method: 'checkValidDigitalValue',
                        args: mainTokenBalance.mainTokenAmount,
                        desiredResult: true,
                        errMsg: {
                            msg: 'INVALID_SYMBOLS_IN_NAMED_DIGITAL_VALUE',
                            params: {
                                name: this.t('mainTokenAmount')
                            }
                        }                               
                    }
                ]
            }
        }
        return validationRules;
    }
    getValidationRulesStep_7(mainTokenBalance, distributeCost) {
        let validationRules = {
            mainTokenAmount: {
                checks: [
                    {
                        method: 'moreThan',
                        args: {value: BigInt(mainTokenBalance.mainTokenAmount), max: BigInt(distributeCost)},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        maxValue: this.valueProcessor.usCommasBigIntDecimals(mainTokenBalance.mainTokenAmount, mainTokenBalance.mainTokenDecimals, mainTokenBalance.mainTokenDecimals),
                                        ticker: mainTokenBalance.mainTokenAmount.mainTokenTicker
                                    }
                                }
                    }
                ]
            }
        }
        return validationRules;
    }
}

export default SpaceStationValidationRules;