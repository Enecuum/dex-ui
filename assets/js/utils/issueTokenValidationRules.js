class issueTokenValidationRules {
	constructor() {}

	getMiningPeriodValidationRules() {
        let validationRules = {
            value: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.miningPeriod.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'testTheRegExp',
                        args: {str: $scope.miningPeriod.value, regExpObj: /[^0-9]/},
                        desiredResult: false,
                        errMsg: 'INTEGER_REQUIRED'                                
                    },
                    {
                        method: 'inIntervalBothClosed',
                        args: {value: $scope.miningPeriod.value, min: $scope.miningPeriod.minValue, max: $scope.miningPeriod.maxValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'NOT_IN_RANGE',
                                    params: {
                                        min: $scope.miningPeriod.minValue,
                                        max: $scope.miningPeriod.maxValue
                                    }
                                }
                    },
                ],
                errMsgSelector: '#issueTokenForm #setMiningPeriodWrapper .errMsg'
            }
        }
        return validationRules;
    }	

	getCommonValidationRules() {
        let validationRules = {
            ticker: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.ticker.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.ticker.value, maxLength: $scope.newToken.ticker.maxLength},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_STRING', params: {strLength: $scope.newToken.ticker.maxLength}}                                
                    },
                    {
                        method: 'testTheRegExp',
                        args: {str: $scope.newToken.ticker.value, regExpObj: /[^A-Z]/},
                        desiredResult: false,
                        errMsg: 'INVALID_SYMBOLS'                                
                    },                            
                    {
                        method: 'isInArray',
                        args: {data: $scope.newToken.ticker.value, dataArray: $scope.onlyTickersArray},
                        desiredResult: false,
                        errMsg: 'TICKER_EXIST'                                
                    }

                ],
                errMsgSelector: '#issueTokenForm #setTokenTickerWrapper .errMsg'
            },    
            name: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.name.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.name.value, maxLength: $scope.newToken.name.maxLength},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_STRING', params: {strLength: $scope.newToken.name.maxLength}}                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenNameWrapper .errMsg'
            },                     
            token_type: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.token_type.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'isInArray',
                        args: {data: $scope.newToken.token_type.value, dataArray: $scope.newToken.token_type.typeArray.map(function(type){return type.value})},
                        desiredResult: true,
                        errMsg: 'TOKEN_WRONG_TYPE'                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenTypeWrapper .errMsg'
            },            
            max_supply: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.max_supply.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: $scope.newToken.max_supply.value, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenMaxSupplyWrapper .errMsg'        
            },
            block_reward: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.block_reward.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: $scope.newToken.block_reward.value, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenBlockRewardWrapper .errMsg'        
            },
            min_stake: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.min_stake.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: $scope.newToken.min_stake.value, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenMinStakeWrapper .errMsg'        
            },
            referrer_stake: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.referrer_stake.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: $scope.newToken.referrer_stake.value, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenReferrerStakeWrapper .errMsg'        
            },
            ref_share: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.ref_share.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: $scope.newToken.ref_share.value, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenRefShareWrapper .errMsg'
            },                                     
            decimals: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.decimals.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'inIntervalBothClosed',
                        args: {value: $scope.newToken.decimals.value, min: $scope.newToken.decimals.minValue, max: $scope.newToken.decimals.maxValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'NOT_IN_RANGE',
                                    params: {
                                        min: $scope.newToken.decimals.minValue,
                                        max: $scope.newToken.decimals.maxValue
                                    }
                                }
                    },
                    {
                        method: 'isInteger',
                        args: {value: $scope.newToken.decimals.value*1},
                        desiredResult: true,
                        errMsg: 'INTEGER_REQUIRED'
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenDecimalsWrapper .errMsg'
            },            
            total_supply: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.total_supply.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: $scope.newToken.total_supply.value, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    },
                ],
                errMsgSelector: '#issueTokenForm #setTokenTotalSupplyWrapper .errMsg'        
            },                     
            fee_type: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.fee_type.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'isInArray',
                        args: {data: $scope.newToken.fee_type.value, dataArray: $scope.newToken.fee_type.typeArray.map(function(type){return type.value})},
                        desiredResult: true,
                        errMsg: 'FEE_WRONG_TYPE'                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenFeeTypeWrapper .errMsg'
            },
            fee_value: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.fee_value.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: $scope.newToken.fee_value.value, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenFeeValueWrapper .errMsg'
            },
            min_fee_for_percent_fee_type: {
                requireToCheck: $scope.newToken.fee_type.value === 1 ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: $scope.newToken.min_fee_for_percent_fee_type.value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: $scope.newToken.min_fee_for_percent_fee_type.value, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenMinFeeWrapper .errMsg'
            }                           
        };
        return validationRules;       
    }

	getSpecialValidationRules() {
        let validationRules = {
            max_supply: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.max_supply.fractionalPart, maxLength: $scope.newToken.decimals.value},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: $scope.newToken.decimals.value}}                                
                    },
                    {
                        method: 'moreOrEqualThan',
                        args: {value: $scope.newToken.max_supply.tmpValue, max: BigInt($scope.newToken.min_stake.minValue)},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        minValue: $scope.newToken.min_stake.minValue
                                    }
                                }
                    },                   
                    {
                        method: 'moreOrEqualThan',
                        args: {value: $scope.newToken.max_supply.tmpValue, max: $scope.newToken.min_stake.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_MIN_STAKE')
                                    }
                                }
                    },                    
                    {
                        method: 'moreOrEqualThan',
                        args: {value: $scope.newToken.max_supply.tmpValue, max: $scope.newToken.referrer_stake.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_REFERRER_STAKE')
                                    }
                                }
                    },                    
                    {
                        method: 'moreOrEqualThan',
                        args: {value: $scope.newToken.max_supply.tmpValue, max: $scope.newToken.total_supply.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_EMISSION')
                                    }
                                }
                    },
                    {
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.max_supply.tmpValue, max: maxBigInt},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: $scope.newToken.max_supply.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ],
                errMsgSelector: '#issueTokenForm #setTokenMaxSupplyWrapper .errMsg'        
            },
            block_reward: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.block_reward.fractionalPart, maxLength: $scope.newToken.decimals.value},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: $scope.newToken.decimals.value}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: $scope.newToken.block_reward.tmpValue, max: maxBigInt},
                        desiredResult: false,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: $scope.newToken.block_reward.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ],
                errMsgSelector: '#issueTokenForm #setTokenBlockRewardWrapper .errMsg'        
            },
            min_stake: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.min_stake.fractionalPart, maxLength: $scope.newToken.decimals.value},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: $scope.newToken.decimals.value}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: $scope.newToken.min_stake.tmpValue, max: BigInt($scope.newToken.min_stake.minValue)},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        minValue: $scope.newToken.min_stake.minValue
                                    }
                                }
                    },
                    {
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.min_stake.tmpValue, max: $scope.newToken.referrer_stake.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_REFERRER_STAKE')
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.min_stake.tmpValue, max: $scope.newToken.total_supply.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_EMISSION')
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.min_stake.tmpValue, max: $scope.newToken.max_supply.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_MAX_SUPPLY')
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.min_stake.tmpValue, max: maxBigInt},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: $scope.newToken.min_stake.maxValue,
                                        ticker: ''
                                    }
                                }
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenMinStakeWrapper .errMsg'        
            },
            referrer_stake: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.referrer_stake.fractionalPart, maxLength: $scope.newToken.decimals.value},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: $scope.newToken.decimals.value}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: $scope.newToken.referrer_stake.tmpValue, max: BigInt($scope.newToken.min_stake.minValue)},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        minValue: $scope.newToken.min_stake.minValue
                                    }
                                }
                    },                   
                    {
                        method: 'moreOrEqualThan',
                        args: {value: $scope.newToken.referrer_stake.tmpValue, max: $scope.newToken.min_stake.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_MIN_STAKE')
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.referrer_stake.tmpValue, max: $scope.newToken.total_supply.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_EMISSION')
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.referrer_stake.tmpValue, max: $scope.newToken.max_supply.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_MAX_SUPPLY')
                                    }
                                }
                    },   
                    {
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.referrer_stake.tmpValue, max: maxBigInt},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: $scope.newToken.referrer_stake.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ],
                errMsgSelector: '#issueTokenForm #setTokenReferrerStakeWrapper .errMsg'        
            },
            ref_share: {
                requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                checks: [
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.ref_share.fractionalPart, maxLength: $scope.newToken.ref_share.decimalPlaces},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: $scope.newToken.ref_share.decimalPlaces}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: $scope.newToken.ref_share.tmpValue, max: BigInt($scope.newToken.ref_share.maxValue * (10 ** $scope.newToken.ref_share.decimalPlaces))},
                        desiredResult: false,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: $scope.newToken.ref_share.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ],
                errMsgSelector: '#issueTokenForm #setTokenRefShareWrapper .errMsg'                     
            },
            total_supply: {                
                checks: [                    
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.total_supply.fractionalPart, maxLength: $scope.newToken.decimals.value},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: $scope.newToken.decimals.value}}                                
                    },
                    {
                        requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                        method: 'moreOrEqualThan',
                        args: {value: $scope.newToken.total_supply.tmpValue, max: BigInt($scope.newToken.min_stake.minValue)},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        minValue: $scope.newToken.min_stake.minValue
                                    }
                                }
                    },                   
                    {
                        requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                        method: 'moreOrEqualThan',
                        args: {value: $scope.newToken.total_supply.tmpValue, max: $scope.newToken.min_stake.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_MIN_STAKE')
                                    }
                                }
                    },                    
                    {
                        requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                        method: 'moreOrEqualThan',
                        args: {value: $scope.newToken.total_supply.tmpValue, max: $scope.newToken.referrer_stake.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_REFERRER_STAKE')
                                    }
                                }
                    },                    
                    {
                        requireToCheck: $scope.newToken.token_type.value === 2 ? true : false,
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.total_supply.tmpValue, max: $scope.newToken.max_supply.tmpValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: $translate.instant('TOKEN_MAX_SUPPLY')
                                    }
                                }
                    },
                    {
                        method: 'lessOrEqualThan',
                        args: {value: $scope.newToken.total_supply.tmpValue, max: maxBigInt},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: $scope.newToken.total_supply.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ],
                errMsgSelector: '#issueTokenForm #setTokenTotalSupplyWrapper .errMsg'        
            },                     
            fee_value: {
                checks: [
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.fee_value.fractionalPart, maxLength: $scope.newToken.fee_value.typeProperties[$scope.newToken.fee_type.value].decimalPlaces},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: $scope.newToken.fee_value.typeProperties[$scope.newToken.fee_type.value].decimalPlaces}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: $scope.newToken.fee_value.tmpValue, max: $scope.newToken.fee_type.value === 0 ? maxBigInt : BigInt($scope.newToken.fee_value.typeProperties[$scope.newToken.fee_type.value].maxValue * (10 ** $scope.newToken.fee_value.typeProperties[1].decimalPlaces))},
                        desiredResult: false,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: $scope.newToken.fee_value.typeProperties[$scope.newToken.fee_type.value].maxValue,
                                        ticker: '' 
                                    }
                                }
                    }
                ],
                errMsgSelector: '#issueTokenForm #setTokenFeeValueWrapper .errMsg'
            },
            min_fee_for_percent_fee_type: {
                requireToCheck: $scope.newToken.fee_type.value === 1 ? true : false,
                checks: [
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: $scope.newToken.min_fee_for_percent_fee_type.fractionalPart, maxLength: $scope.newToken.decimals.value},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: $scope.newToken.decimals.value}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: $scope.newToken.min_fee_for_percent_fee_type.tmpValue, max: maxBigInt},
                        desiredResult: false,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: $scope.newToken.min_fee_for_percent_fee_type.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ],
                errMsgSelector: '#issueTokenForm #setTokenMinFeeWrapper .errMsg'
            }                           
        };
        return validationRules;   
    }

}