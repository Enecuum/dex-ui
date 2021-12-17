class SlippageValidationRules {
    constructor (translationFunction) {
        this.t = translationFunction
    }

    getSlippageRules (percent) {
        return {
            slippageTolerance: {
                checks: [
                    {
                        method: 'isSet',
                        args: {data: percent},
                        desiredResult: true,
                        errMsg: 'REQUIRED'
                    },
                    {
                        method: 'checkValidDigitalValue',
                        args: Number(percent),
                        desiredResult: true,
                        errMsg: 'INVALID_SYMBOLS_IN_DIGITAL_VALUE',
                    },
                    {
                        method: 'lessThan',
                        args: {
                            value: percent,
                            max: 50
                        },
                        desiredResult: true,
                        errMsg: {msg: 'MUST_BE_LESS_THAN', params: {minValue: 50}}
                    },
                    {
                        method: 'moreOrEqualThan',
                        args: {
                            value: percent,
                            max: 0
                        },
                        desiredResult: true,
                        errMsg: {msg: 'MUST_BE_GREATER_THAN', params: {minValue: 0}}
                    }
                ]
            }
        }
    }
}

export default SlippageValidationRules