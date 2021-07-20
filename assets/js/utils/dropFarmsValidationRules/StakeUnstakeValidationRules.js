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
                    },
                    {
                        method: 'moreOrEqualThan',
                        args: {value: data.mainTokenAmount, max: data.actionCost},
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
            stakeValue : {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: data.stakeValue},
                        desiredResult: true,
                        errMsg: 'REQUIRED_STAKE'////Сообщение, что должен быть определен стейк
                    },                    
                    {
                        method: 'execTheRegExp',
                        args: {str: data.stakeValue, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
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
            stakeValue : {
                checks: [
                    {
                        requireToCheck: data.stakeValue,
                        method: 'strExeedMaxLength',
                        args: {dataStr: data.stakeValue.fractionalPart, maxLength: data.stake_token_decimals},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: etmState.tokenData.decimals}}                                
                    },                
                    {
                        requireToCheck: data.mainToken !== data.stake_token_hash ? true : false,
                        method: 'lessOrEqualThan',
                        args: {value: data.stakeValue.completeValue, max: data.stakeTokenBalance},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: data.stakeTokenBalance,////   BIGINT!!!! сообщение, что стейк превышает баланс стейк токена
                                        ticker: ''
                                    }
                                }
                    },                  
                    {
                        requireToCheck: data.mainToken === data.stake_token_hash ? true : false,
                        method: 'lessOrEqualThan',
                        args: {value: data.stakeValue.completeValue, max: data.actionCost + data.mainTokenAmount},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: data.mainTokenAmount - data.actionCost,////   BIGINT!!!! сообщение, что сумма превышает баланс главного токена (стейк плюс стоимость операции больше баланса главнго токена)
                                        ticker: ''
                                    }
                                }
                    },                     
                ]
            }
        }
        return validationRules;
    }
}

export default StakeUnstakeValidationRules;