class IssueTokenValidationRules {
	constructor(translateFunction, premineOrEmission) {
        this.t = translateFunction;
        this.premineOrEmission = premineOrEmission;
    }
	getCommonValidationRules(tokenData, tokenDataConstraints) {
        let validationRules = {
            ticker: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.ticker},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: tokenData.ticker, maxLength: tokenDataConstraints.ticker.maxLength},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_STRING', params: {strLength: tokenDataConstraints.ticker.maxLength}}                                
                    },
                    {
                        method: 'testTheRegExp',
                        args: {str: tokenData.ticker, regExpObj: /[^A-Z]/},
                        desiredResult: false,
                        errMsg: 'INVALID_SYMBOLS'                                
                    }
                ]
            },    
            name: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.name},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr:tokenData.name, maxLength: tokenDataConstraints.name.maxLength},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_STRING', params: {strLength: tokenDataConstraints.name.maxLength}}                                
                    }
                ]
            },                     
            token_type: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.token_type},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'isInArray',
                        args: {data: tokenData.token_type, dataArray: tokenDataConstraints.token_type_arr.map(function(type){return type.value})},
                        desiredResult: true,
                        errMsg: 'TOKEN_WRONG_TYPE'                                
                    }
                ]
            },            
            max_supply: {
                requireToCheck: tokenData.token_type === '2' ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.max_supply},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },                    
                    {
                        method: 'execTheRegExp',
                        args: {str: tokenData.max_supply, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    },
                    {
                        requireToCheck: tokenData.decimals === 0 ? true : false,
                        method: 'testTheRegExp',
                        args: {str:  tokenData.max_supply, regExpObj: /[^0-9]/},
                        desiredResult: false,
                        errMsg: 'INTEGER_REQUIRED'                                
                    }
                ]
            },
            mining_period: {
                requireToCheck: tokenData.token_type === '2' ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.mining_period},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'testTheRegExp',
                        args: {str:  tokenData.mining_period, regExpObj: /[^0-9]/},
                        desiredResult: false,
                        errMsg: 'INTEGER_REQUIRED'                          
                    },
                    {
                        method: 'inIntervalBothClosed',
                        args: {value:  tokenData.mining_period, min: tokenDataConstraints.mining_period.minValue, max: tokenDataConstraints.mining_period.maxValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'NOT_IN_RANGE',
                                    params: {
                                        min: tokenDataConstraints.mining_period.minValue,
                                        max: tokenDataConstraints.mining_period.maxValue
                                    }
                                }
                    },
                ]
            },
            min_stake: {
                requireToCheck: tokenData.token_type === '2' ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.min_stake},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: tokenData.min_stake, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    },
                    {
                        requireToCheck: tokenData.decimals === 0 ? true : false,
                        method: 'testTheRegExp',
                        args: {str:  tokenData.min_stake, regExpObj: /[^0-9]/},
                        desiredResult: false,
                        errMsg: 'INTEGER_REQUIRED'                                
                    }
                ]
            },
            referrer_stake: {
                requireToCheck: tokenData.token_type === '2' ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.referrer_stake},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: tokenData.referrer_stake, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    },
                    {
                        requireToCheck: tokenData.decimals === 0 ? true : false,
                        method: 'testTheRegExp',
                        args: {str:  tokenData.referrer_stake, regExpObj: /[^0-9]/},
                        desiredResult: false,
                        errMsg: 'INTEGER_REQUIRED'                                
                    }
                ]
            },
            ref_share: {
                requireToCheck: tokenData.token_type === '2' ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.ref_share},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: tokenData.ref_share, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    }
                ]
            },                                     
            decimals: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.decimals},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'inIntervalBothClosed',
                        args: {value: tokenData.decimals, min: tokenDataConstraints.decimals.minValue, max: tokenDataConstraints.decimals.maxValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'NOT_IN_RANGE',
                                    params: {
                                        min: tokenDataConstraints.decimals.minValue,
                                        max: tokenDataConstraints.decimals.maxValue
                                    }
                                }
                    },
                    {
                        method: 'isInteger',
                        args: {value: Number.parseInt(tokenData.decimals)},
                        desiredResult: true,
                        errMsg: 'INTEGER_REQUIRED'
                    }
                ]
            },            
            total_supply: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.total_supply},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: tokenData.total_supply, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    },
                    {
                        requireToCheck: tokenData.decimals === 0 ? true : false,
                        method: 'testTheRegExp',
                        args: {str:  tokenData.total_supply, regExpObj: /[^0-9]/},
                        desiredResult: false,
                        errMsg: 'INTEGER_REQUIRED'                                
                    }
                ]
            },                     
            fee_type: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.fee_type},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'isInArray',
                        args: {data: tokenData.fee_type, dataArray: tokenDataConstraints.fee_type_arr.map(function(type){return type.value})},
                        desiredResult: true,
                        errMsg: 'FEE_WRONG_TYPE'                                
                    }
                ]
            },
            fee_value: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.fee_value},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: tokenData.fee_value, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    },
                    {
                        requireToCheck: tokenData.decimals === 0 && tokenData.fee_type === '0' ? true : false,
                        method: 'testTheRegExp',
                        args: {str:  tokenData.fee_value, regExpObj: /[^0-9]/},
                        desiredResult: false,
                        errMsg: 'INTEGER_REQUIRED'                                
                    }
                ]
            },
            min_fee_for_percent_fee_type: {
                requireToCheck: tokenData.fee_type === '1' ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: tokenData.min_fee_for_percent_fee_type},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: tokenData.min_fee_for_percent_fee_type, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    },
                    {
                        requireToCheck: tokenData.decimals === 0 ? true : false,
                        method: 'testTheRegExp',
                        args: {str:  tokenData.min_fee_for_percent_fee_type, regExpObj: /[^0-9]/},
                        desiredResult: false,
                        errMsg: 'INTEGER_REQUIRED'                                
                    }
                ]
            }                           
        };
        return validationRules;       
    }

	getSpecialValidationRules(etmState, tokenDataConstraints, maxBigInt) {
        let validationRules = {
            max_supply: {
                requireToCheck: etmState.tokenData.token_type === '2' ? true : false,
                checks: [                
                    {
                        requireToCheck: etmState.tokenData.decimals > 0 ? true : false,
                        method: 'strExeedMaxLength',
                        args: {dataStr: etmState.tokenBigIntData.max_supply.fractionalPart, maxLength: etmState.tokenData.decimals},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: etmState.tokenData.decimals}}                                
                    },
                    {
                        method: 'moreOrEqualThan',
                        args: {value: etmState.tokenBigIntData.max_supply.completeValue, max: BigInt(tokenDataConstraints.min_stake.minValue)},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        minValue: tokenDataConstraints.min_stake.minValue
                                    }
                                }
                    },                   
                    {
                        method: 'moreOrEqualThan',
                        args: {value: etmState.tokenBigIntData.max_supply.completeValue, max: etmState.tokenBigIntData.min_stake.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('etm.minStake')
                                    }
                                }
                    },                    
                    {
                        method: 'moreOrEqualThan',
                        args: {value: etmState.tokenBigIntData.max_supply.completeValue, max: etmState.tokenBigIntData.referrer_stake.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('etm.referrerStake')
                                    }
                                }
                    },                    
                    {
                        method: 'moreOrEqualThan',
                        args: {value: etmState.tokenBigIntData.max_supply.completeValue, max: etmState.tokenBigIntData.total_supply.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t(this.premineOrEmission)
                                    }
                                }
                    },
                    {
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.max_supply.completeValue, max: maxBigInt},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: tokenDataConstraints.max_supply.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ]
            },
            block_reward: {
                requireToCheck: etmState.tokenData.token_type === '2' ? true : false,
                checks: [
                    {
                        method: 'isSet',
                        args: {data: etmState.tokenData.block_reward},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'execTheRegExp',
                        args: {str: etmState.tokenData.block_reward, regExpObj: /^([0-9]*\.?([0-9]*)){1}$/},
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE'                                
                    },
                    {                        
                        requireToCheck: etmState.tokenData.decimals === 0 ? false : true,
                        method: 'strExeedMaxLength',
                        args: {dataStr: etmState.tokenBigIntData.block_reward.fractionalPart, maxLength: etmState.tokenData.decimals},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: etmState.tokenData.decimals}}                           
                    },
                    {
                        method: 'moreThan',
                        args: {value: etmState.tokenBigIntData.block_reward.completeValue, max: maxBigInt},
                        desiredResult: false,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: tokenDataConstraints.block_reward.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ]
            },
            min_stake: {
                requireToCheck: etmState.tokenData.token_type === '2' ? true : false,
                checks: [
                    {
                        requireToCheck: etmState.tokenData.decimals > 0 ? true : false,
                        method: 'strExeedMaxLength',
                        args: {dataStr: etmState.tokenBigIntData.min_stake.fractionalPart, maxLength: etmState.tokenData.decimals},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: etmState.tokenData.decimals}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: etmState.tokenBigIntData.min_stake.completeValue, max: BigInt(tokenDataConstraints.min_stake.minValue)},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        minValue: tokenDataConstraints.min_stake.minValue
                                    }
                                }
                    },
                    {
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.min_stake.completeValue, max: etmState.tokenBigIntData.referrer_stake.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('etm.referrerStake')
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.min_stake.completeValue, max: etmState.tokenBigIntData.total_supply.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t(this.premineOrEmission)
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.min_stake.completeValue, max: etmState.tokenBigIntData.max_supply.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('etm.maxSupply')
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.min_stake.completeValue, max: maxBigInt},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: etmState.tokenData.min_stake.maxValue,
                                        ticker: ''
                                    }
                                }
                    }
                ]
            },
            referrer_stake: {
                requireToCheck: etmState.tokenData.token_type === '2' ? true : false,
                checks: [
                    {
                        requireToCheck: etmState.tokenData.decimals > 0 ? true : false,
                        method: 'strExeedMaxLength',
                        args: {dataStr: etmState.tokenBigIntData.referrer_stake.fractionalPart, maxLength: etmState.tokenData.decimals},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: etmState.tokenData.decimals}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: etmState.tokenBigIntData.referrer_stake.completeValue, max: BigInt(tokenDataConstraints.min_stake.minValue)},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        minValue: etmState.tokenData.min_stake.minValue
                                    }
                                }
                    },                   
                    {
                        method: 'moreOrEqualThan',
                        args: {value: etmState.tokenBigIntData.referrer_stake.completeValue, max: etmState.tokenBigIntData.min_stake.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('etm.minStake')
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.referrer_stake.completeValue, max: etmState.tokenBigIntData.total_supply.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t(this.premineOrEmission)
                                    }
                                }
                    },                    
                    {
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.referrer_stake.completeValue, max: etmState.tokenBigIntData.max_supply.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('etm.maxSupply')
                                    }
                                }
                    },   
                    {
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.referrer_stake.completeValue, max: maxBigInt},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: tokenDataConstraints.referrer_stake.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ]
            },
            ref_share: {
                requireToCheck: etmState.tokenData.token_type === '2' ? true : false,
                checks: [
                    {
                        method: 'strExeedMaxLength',
                        args: {dataStr: etmState.tokenBigIntData.ref_share.fractionalPart, maxLength: tokenDataConstraints.ref_share.decimalPlaces},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: tokenDataConstraints.ref_share.decimalPlaces}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: etmState.tokenBigIntData.ref_share.completeValue, max: BigInt(tokenDataConstraints.ref_share.maxValue * (10 ** tokenDataConstraints.ref_share.decimalPlaces))},
                        desiredResult: false,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: tokenDataConstraints.ref_share.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ]
            },
            total_supply: {                
                checks: [                    
                    {
                        requireToCheck: etmState.tokenData.decimals > 0 ? true : false,
                        method: 'strExeedMaxLength',
                        args: {dataStr: etmState.tokenBigIntData.total_supply.fractionalPart, maxLength: etmState.tokenData.decimals},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: etmState.tokenData.decimals}}                                
                    },
                    {
                        requireToCheck: etmState.tokenData.token_type === '2' ? true : false,
                        method: 'moreOrEqualThan',
                        args: {value: etmState.tokenBigIntData.total_supply.completeValue, max: BigInt(tokenDataConstraints.min_stake.minValue)},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_THAN',
                                    params: {
                                        minValue: tokenDataConstraints.min_stake.minValue
                                    }
                                }
                    },                   
                    {
                        requireToCheck: etmState.tokenData.token_type === '2' ? true : false,
                        method: 'moreOrEqualThan',
                        args: {value: etmState.tokenBigIntData.total_supply.completeValue, max: etmState.tokenBigIntData.min_stake.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('etm.minStake')
                                    }
                                }
                    },                    
                    {
                        requireToCheck: etmState.tokenData.token_type === '2' ? true : false,
                        method: 'moreOrEqualThan',
                        args: {value: etmState.tokenBigIntData.total_supply.completeValue, max: etmState.tokenBigIntData.referrer_stake.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_GREATER_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('etm.referrerStake')
                                    }
                                }
                    },                    
                    {
                        requireToCheck: etmState.tokenData.token_type === '2' ? true : false,
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.total_supply.completeValue, max: etmState.tokenBigIntData.max_supply.completeValue},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'MUST_BE_LESS_OR_EQUAL_THAN_NAMED_VALUE',
                                    params: {
                                        name: this.t('etm.maxSupply')
                                    }
                                }
                    },
                    {
                        method: 'lessOrEqualThan',
                        args: {value: etmState.tokenBigIntData.total_supply.completeValue, max: maxBigInt},
                        desiredResult: true,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: tokenDataConstraints.total_supply.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ]
            },                     
            fee_value: {
                checks: [
                    {
                        requireToCheck: etmState.tokenData.decimals > 0 ? true : false,
                        method: 'strExeedMaxLength',
                        args: {dataStr: etmState.tokenBigIntData.fee_value.fractionalPart, maxLength: tokenDataConstraints.fee_value_props_arr[parseInt(etmState.tokenData.fee_type)].decimalPlaces},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: tokenDataConstraints.fee_value_props_arr[etmState.tokenData.fee_type].decimalPlaces}}
                    },
                    {
                        requireToCheck: etmState.tokenData.decimals === 0 && etmState.tokenData.fee_type === '1' ? true : false,
                        method: 'strExeedMaxLength',
                        args: {dataStr: etmState.tokenBigIntData.fee_value.fractionalPart, maxLength: tokenDataConstraints.fee_value_props_arr[parseInt(etmState.tokenData.fee_type)].decimalPlaces},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: tokenDataConstraints.fee_value_props_arr[etmState.tokenData.fee_type].decimalPlaces}}
                    },                    
                    {
                        method: 'moreThan',
                        args: {value: etmState.tokenBigIntData.fee_value.completeValue, max: etmState.tokenData.fee_type === '0' || etmState.tokenData.fee_type === '2'? maxBigInt : BigInt(tokenDataConstraints.fee_value_props_arr[etmState.tokenData.fee_type].maxValue * (10 ** tokenDataConstraints.fee_value_props_arr[1].decimalPlaces))},
                        desiredResult: false,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: tokenDataConstraints.fee_value_props_arr[etmState.tokenData.fee_type].maxValue,
                                        ticker: '' 
                                    }
                                }
                    }
                ]
            },
            min_fee_for_percent_fee_type: {
                requireToCheck: etmState.tokenData.fee_type === '1' ? true : false,
                checks: [
                    {
                        requireToCheck:etmState.tokenData.decimals > 0 ? true : false,
                        method: 'strExeedMaxLength',
                        args: {dataStr: etmState.tokenBigIntData.min_fee_for_percent_fee_type.fractionalPart, maxLength: etmState.tokenData.decimals},
                        desiredResult: false,
                        errMsg: {msg: 'TOO_LONG_FRACTIONAL_PART', params: {decimals: etmState.tokenData.decimals}}                                
                    },
                    {
                        method: 'moreThan',
                        args: {value: etmState.tokenBigIntData.min_fee_for_percent_fee_type.completeValue, max: maxBigInt},
                        desiredResult: false,
                        errMsg: {
                                    msg: 'EXEED_MAX_VALUE_IN_TOKENS',
                                    params: {
                                        maxValue: tokenDataConstraints.min_fee_for_percent_fee_type.maxValue,
                                        ticker: ''
                                    }
                                }
                    }                                
                ]
            }                           
        };
        return validationRules;   
    }
}

export default IssueTokenValidationRules;