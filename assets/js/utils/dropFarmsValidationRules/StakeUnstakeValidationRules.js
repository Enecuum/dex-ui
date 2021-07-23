class StakeUnstakeValidationRules {
	constructor(translateFunction) {
        this.t = translateFunction;
    }

    getCommonValidationRules(data) {
        let validationRules = {
            mainTokenBalance: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: data.mainTokenAmount},
                        desiredResult: true,
                        errMsg: {
                            msg: 'NAMED_VALUE_UNDEFINED',
                            params: {
                                name: this.t('mainToken')
                            }
                        }
                    } 
                ]
            },
            stakeTokenBalance: {
                checks: [
                    {
                        requireToCheck: data.currentAction === 'farm_increase_stake' ? true : false,
                        method: 'isSet',
                        args: {data: data.stakeTokenAmount},
                        desiredResult: true,
                       errMsg: {
                            msg: 'NAMED_VALUE_UNDEFINED',
                            params: {
                                name: this.t('stakeToken')
                            }
                        }
                    }
                ]
            },
            initialStake: {
                checks: [
                    {
                        requireToCheck: data.currentAction === 'farm_decrease_stake' ? true : false,
                        method: 'isSet',
                        args: {data: data.initialStake},
                        desiredResult: true,
                        errMsg: {
                            msg: 'NAMED_VALUE_UNDEFINED',
                            params: {
                                name: this.t('farmStake')
                            }
                        }
                    }
                ]
            },
            actionCost : {
                checks : [
                    {
                        method: 'isSet',
                        args: {data: data.actionCost},
                        desiredResult: true,
                        errMsg: {
                            msg: 'NAMED_VALUE_UNDEFINED',
                            params: {
                                name: this.t('actionCost')
                            }
                        }
                    },
                ]
            },                           
            stakeValue : {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: data.stakeValue.numberValue},
                        desiredResult: true,
                        errMsg: {
                            msg: 'NAMED_VALUE_UNDEFINED',
                            params: {
                                name: this.t('dropFarms.stake')
                            }
                        }
                    },                    
                    {
                        method: 'execTheRegExp',
                        args: {str: data.stakeValue.numberValue, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: {
                            msg: 'INVALID_SYMBOLS_IN_NAMED_DIGITAL_VALUE',
                            params: {
                                name: this.t('dropFarms.stake')
                            }
                        }                               
                    }
                ]
            }
        }
        return validationRules;
    }
/////////////////////////
    getSpecialValidationRules(data) {
        let validationRules = {
            mainTokenBalance : {
                checks : [
                    {
                        method: 'moreOrEqualThan',
                        args: {value: BigInt(data.mainTokenAmount), max: BigInt(data.actionCost)},
                        desiredResult: true,
                        errMsg: {
                            msg: 'MUST_BE_GREATER_THAN',/////Текст сообщения, что мейнтокена не хватает для оплаты операции
                            params: {
                                minValue: data.actionCost
                            }
                        }
                    }
                ]
            },
            stakeValue : {
                checks: [                
                    {
                        requireToCheck: data.currentAction === 'farm_increase_stake' && data.mainToken !== data.stake_token_hash ? true : false,
                        method: 'lessOrEqualThan',
                        args: {value: data.stakeValue.bigIntValue, max: data.stakeTokenAmount},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS1',
                                    params: {
                                        maxValue: data.stakeTokenAmount,////   BIGINT!!!! сообщение, что стейк превышает баланс стейк токена
                                        ticker: ''
                                    }
                                }
                    },                  
                    {
                        requireToCheck: data.currentAction === 'farm_increase_stake' && data.mainToken === data.stake_token_hash ? true : false,
                        method: 'lessOrEqualThan',
                        args: {value: data.stakeValue.bigIntValue, max: data.mainTokenAmount - data.actionCost},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS2',
                                    params: {
                                        maxValue: data.mainTokenAmount - data.actionCost,////   BIGINT!!!! сообщение, что сумма превышает баланс главного токена (стейк плюс стоимость операции больше баланса главнго токена)
                                        ticker: ''
                                    }
                                }
                    },                  
                    {
                        requireToCheck: data.currentAction === 'farm_decrease_stake'? true : false,
                        method: 'lessOrEqualThan',
                        args: {value: data.stakeValue.bigIntValue, max: data.initialStake},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('dropFarms.stake')
                                    }
                                }
                    },
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: data.stakeValue.rawFractionalPart, maxLength: data.stake_token_decimals},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: data.stake_token_decimals}}                                
                    }

                ]
            }
        }
        return validationRules;
    }
}

export default StakeUnstakeValidationRules;