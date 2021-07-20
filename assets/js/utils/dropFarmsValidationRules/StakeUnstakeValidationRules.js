class StakeUnstakeValidationRules {
	constructor(translateFunction) {
        this.t = translateFunction;
    }

    getCommonValidationRules(action, data) {
        let validationRules = {
            mainTokenBalance: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: data.mainTokenAmount},
                        desiredResult: true,
                        errMsg: 'REQUIRED'////Сообщение, что не определен главный токен
                    } 
                ]
            },
            stakeTokenBalance: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: data.stakeTokenAmount},
                        desiredResult: true,
                        errMsg: 'REQUIRED_STAKE'////Сообщение, что должен быть определен баланс стейк токена
                    }
                ]
            },
            actionCost : {
                checks : [
                    {
                        method: 'isSet',
                        args: {data: data.actionCost},
                        desiredResult: true,
                        errMsg: 'REQUIRED_PRICE'////Сообщение, что нет информации о стоимости контракта
                    },
                ]
            },                           
            stakeValue : {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: data.stakeValue.numberValue},
                        desiredResult: true,
                        errMsg: 'REQUIRED_STAKE'////Сообщение, что должен быть определен стейк
                    },                    
                    {
                        method: 'execTheRegExp',
                        args: {str: data.stakeValue.numberValue, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    }
                ]
            }
        }
        return validationRules;
    }
/////////////////////////
    getSpecialValidationRules(action, data) {
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
                        requireToCheck: data.mainToken !== data.stake_token_hash ? true : false,
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
                        requireToCheck: data.mainToken === data.stake_token_hash ? true : false,
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