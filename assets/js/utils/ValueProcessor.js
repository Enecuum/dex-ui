class ValueProcessor {
	constructor() {
		this.maxBigInt = BigInt(Math.pow(2,64))-BigInt(1);
        this.nativeDecimals = 10;
        this.operations = {
            ADD : 0x0,
            SUB : 0x1,
            MUL : 0x2,
            DIV : 0x3
        };
	}
    valueToBigInt (inputNumber, decimals=10) {
        let multiplier = 10 ** decimals;
        let str = String(inputNumber).replace(/,/g, '.');
        let parts_array = str.split('.');
        let integerPart = parts_array[0] === '' ? '0' : parts_array[0];
        let rawFractionalPart = parts_array[1] === '' || parts_array[1] === undefined ? '0' : parts_array[1]; //before trim by decimals
        let fractionalPart = rawFractionalPart.slice(0, decimals);
        let counter = decimals - rawFractionalPart.length;
        for (let i=0; i < counter; i++) {
            fractionalPart += '0';
        }
        return {
            integerPart: integerPart,
            fractionalPart: fractionalPart,
            rawFractionalPart: rawFractionalPart,
            value: BigInt(integerPart) * BigInt(multiplier) + BigInt(fractionalPart),
            decimals : decimals
        };
    }
    usCommasBigIntDecimals (input, decimals=10, fixed=10) {
        if(typeof input === 'bigint' || !isNaN(input)) {
            if (decimals === undefined || decimals === null || isNaN(decimals) || input === null)
                return '---';
            let str = BigInt(input).toString();
            let integerPart = '0';
            let fractionalPart = '0';
            let delimiter = decimals !== 0 ? (fixed !== 0 ? '.' : '') : '';
            if (str.length > decimals) {
                integerPart = BigInt(str.substring(0, str.length - decimals)).toLocaleString('en-us');
                fractionalPart = str.substring(str.length - decimals);
            } else {
                fractionalPart = str.substring(str.length - decimals);
                for (let i=0; i < (decimals - str.length); i++) {
                    fractionalPart = '0' + fractionalPart;
                }                  
            }
            return integerPart + delimiter + fractionalPart.substring(0, fixed);
        } else
            return input;
    }
    getMaxValue (decimals) {
        return this.maxBigInt/BigInt(10 ** decimals)
    }

    // ============================= math ============================= 
    add (op0, op1) {
        return this.bigIntMathOperation(this.operations.ADD, op0, op1);
    }
    sub (op0, op1) {
        return this.bigIntMathOperation(this.operations.SUB, op0, op1);
    }
    mul (op0, op1) {
        return this.bigIntMathOperation(this.operations.MUL, op0, op1);
    }
    div (op0, op1) {
        return this.bigIntMathOperation(this.operations.DIV, op0, op1);
    }
    assignValidValue (valueObj) {
        if (valueObj.value == undefined || valueObj.decimals == undefined)
            return undefined;
        valueObj.value = BigInt(valueObj.value)
        return valueObj;
    }
    bigIntMathOperation (operation, op0, op1) {
        op0 = this.assignValidValue({...op0});
        op1 = this.assignValidValue({...op1});
 
        if (op0 == undefined || op1 == undefined)
            return {};

        let decimalsAddition = Math.abs(op1.decimals - op0.decimals);
        if (op0.decimals > op1.decimals) {
            op1.decimals += decimalsAddition
            op1.value *= BigInt('1'+ '0'.repeat(decimalsAddition))
        } else {
            op0.decimals += decimalsAddition
            op0.value *= BigInt('1'+ '0'.repeat(decimalsAddition))
        }

        let res = this.mathOperation(operation, op0, op1)

        let diff = res.decimals - this.nativeDecimals - 1
        if (diff > 0) {
            res.value /= BigInt('1'+ '0'.repeat(diff))
            res.decimals -= diff
        }

        return res
    }
    mathOperation (operation, op0, op1) {
        if (operation === this.operations.ADD) {
            return {
                value    : op0.value + op1.value,
                decimals : op0.decimals,
            };
        } else if (operation === this.operations.SUB) {
            return {
                value    : op0.value - op1.value,
                decimals : op0.decimals,
            };
        } else if (operation === this.operations.MUL) {
            return {
                value    : op0.value * op1.value,
                decimals : op0.decimals + op1.decimals,
            };
        } else if (operation === this.operations.DIV) {
            if (op1.value == 0n) {
                // console.log('zero division!')
                return {}
            }

            const defDecimals = 15
            // step 1 - control length of number
            let op0l = String(op0.value).length, op1l = String(op1.value).length
            if (op0l < op1l) {
                let diff = op1l - op0l
                op0.decimals += diff
                op0.value *= BigInt('1'+ '0'.repeat(diff))
            }
            // step 2 - control decimals
            let maxDecimals = defDecimals
            if (op0.decimals != 0 || op1.decimals != 0) {
                maxDecimals = Math.max(op0.decimals, op1.decimals)
                let diff = maxDecimals - (op0.decimals - op1.decimals)
                op0.value *=BigInt('1'+ '0'.repeat(diff))
            } else {
                op0.value *= BigInt('1'+ '0'.repeat(maxDecimals))
            }
            // step 3 - count
            return {
                value    : op0.value / op1.value,
                decimals : maxDecimals,
            }
        }
    }
}

export default ValueProcessor;