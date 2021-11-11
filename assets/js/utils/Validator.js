class Validator {
	constructor() {}

    checkValidDigitalValue (value) {
        return (value !== null && value !== undefined && !Number.isNaN(value)) ? true : false;
    }
    isSet (dataObj) {
        return ((typeof dataObj.data !== 'undefined') && dataObj.data !== null && dataObj.data !== '') ? true : false
    }
    strExeedMaxLength (dataObj) {
        if ((typeof dataObj.dataStr === 'string') && (typeof dataObj.maxLength === 'number') && (dataObj.maxLength ^ 0) === dataObj.maxLength) {
            return (dataObj.dataStr.length > dataObj.maxLength) ? true : false;
        } else
            return null;
    }
    isInArray (dataObj) {
        if ((typeof dataObj.data !== 'undefined') && dataObj.data !== null && Array.isArray(dataObj.dataArray)) {
            return (dataObj.dataArray.indexOf(dataObj.data) !== -1) ? true : false;               
        } else
            return null;
    }
    testTheRegExp (dataObj) {
        if ((typeof dataObj.str !== 'undefined') && dataObj.str !== null) {
            return dataObj.regExpObj.test(dataObj.str);               
        } else
            return null;
    }
    execTheRegExp (dataObj) {
        if ((typeof dataObj.str !== 'undefined') && dataObj.str !== null) {
            let resultArr = dataObj.regExpObj.exec(dataObj.str);
            return !(resultArr == null || resultArr[0] == "");               
        } else
            return null;
    }
    moreThan (dataObj) {
        if (((typeof dataObj.value !== 'undefined') && dataObj.value !== null) && ((typeof dataObj.max !== 'undefined') && dataObj.max !== null)) {
            return (dataObj.value > dataObj.max) ? true : false;               
        } else
            return null;
    }
    moreOrEqualThan (dataObj) {
        if (((typeof dataObj.value !== 'undefined') && dataObj.value !== null) && ((typeof dataObj.max !== 'undefined') && dataObj.max !== null)) {
            return (dataObj.value >= dataObj.max) ? true : false;               
        } else
            return null;
    }
    lessThan (dataObj) {
        if (((typeof dataObj.value !== 'undefined') && dataObj.value !== null) && ((typeof dataObj.max !== 'undefined') && dataObj.max !== null)) {
            return (dataObj.value < dataObj.max) ? true : false;               
        } else
            return null;
    }
    lessOrEqualThan (dataObj) {
        if (((typeof dataObj.value !== 'undefined') && dataObj.value !== null) && ((typeof dataObj.max !== 'undefined') && dataObj.max !== null)) {
            return (dataObj.value <= dataObj.max) ? true : false;               
        } else
            return null;
    }
    inIntervalBothClosed (dataObj) {
        if (((typeof dataObj.value !== 'undefined') && dataObj.value !== null) && ((typeof dataObj.min !== 'undefined') && dataObj.min !== null) && ((typeof dataObj.max !== 'undefined') && dataObj.max !== null)) {
            return (dataObj.value >= dataObj.min && dataObj.value <= dataObj.max) ? true : false;               
        } else
            return null;
    }
    matchToFixed (dataObj) {
        if (((typeof dataObj.value !== 'undefined') && dataObj.value !== null) && ((typeof dataObj.n !== 'undefined') && dataObj.n !== null)) {
           dataObj.n*=1;
           let decimalPart = dataObj.value.toString().replace(/,/g, '.').split('.')[1];
           return (decimalPart === undefined || decimalPart.length <= dataObj.n) ? true : false;
        } else
            return null;            
    }
    isInteger (dataObj) {
        if ((typeof dataObj.value !== 'undefined') && dataObj.value !== null) {
            Number.isInteger = Number.isInteger || function(value) {
              return typeof value === 'number' && 
                isFinite(value) && 
                Math.floor(value) === value;
            };
            return Number.isInteger(dataObj.value);
        }
    }
    batchValidate (validateObj, rulesObject) {
        let validationResult = {
            dataValid : true,
            propsArr : {}   
        };
        let propsErr = {};
        let that = this;
        for (let prop in rulesObject) {
            propsErr[prop] = 0;
            if (validateObj.hasOwnProperty(prop)) {
                rulesObject[prop].checks.forEach(function(check) {
                    let requireToCheck = rulesObject[prop].requireToCheck;
                    if (requireToCheck === true || requireToCheck === undefined) {                     
                        if (propsErr[prop] === 0 && (check.requireToCheck === true || check.requireToCheck === undefined)) {
                            let method = check.method,
                                argObj = check.args,
                                desiredResult = check.desiredResult,
                                errMsg = check.errMsg,
                                result = that[method](argObj)
                            if (desiredResult !== result) {
                                propsErr[prop]++;
                                validationResult.dataValid = false;
                                validationResult.propsArr[prop] = {
                                    valid  : false,
                                    msg        : errMsg.msg || errMsg,
                                    params     : errMsg.params
                                }

                            }
                        }
                    }
                });
            }
        }
        return validationResult;
    }
}

export default Validator;