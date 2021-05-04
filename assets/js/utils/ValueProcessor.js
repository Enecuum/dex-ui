class ValueProcessor {
	constructor() {
		this.maxBigInt = BigInt(Math.pow(2,64))-BigInt(1);
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
        let rawFractionalPart = parts_array[1] === '' || parts_array[1] === undefined ? '0' : parts_array[1];//before trim by decimals
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

    // ============================= temporary math =============================
    // TODO - resolve custom BigInt math cases 
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
    bigIntMathOperation (operation, op0, op1) {
        let decimals = (op0.decimals > op1.decimals) ? op0.decimals : op1.decimals;
        let numOp0 = BigInt(op0.value);
        let numOp1 = BigInt(op1.value);
        let value = this.mathOperation(operation, numOp0, numOp1);
        return {
            value: value,
            decimals : decimals
        };
    }
    mathOperation (operation, op0, op1) {
        if (operation == this.operations.ADD)
            return op0 + op1;
        else if (operation == this.operations.SUB)
            return op0 - op1;
        else if (operation == this.operations.MUL)
            return op0 * op1;
        else if (operation == this.operations.DIV) {
            if (op1 == 0)
                return 0;
            return op0 / op1;
        }
    } 
    // ============================= temporary math =============================
}

export default ValueProcessor;