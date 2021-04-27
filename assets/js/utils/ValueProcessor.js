class ValueProcessor {
	constructor() {
		this.maxBigInt = BigInt(Math.pow(2,64))-BigInt(1);
	}
    valueToBigInt (inputNumber, decimals=10) {
        let multiplier = 10 ** decimals;
        let str = String(inputNumber).replace(/,/g, '.');
        let parts_array = str.split('.');
        let integerPart = parts_array[0] === '' ? '0' : parts_array[0];
        let rawFractionalPart = parts_array[1] === '' || parts_array[1] === undefined ? '0' : parts_array[1];//before trim by decimals
        fractionalPart = rawFractionalPart.slice(0, decimals);
        let counter = decimals - rawFractionalPart.length;
        for (let i=0; i < counter; i++) {            
            fractionalPart += '0';
        }
        return {
            integerPart: integerPart,
            fractionalPart: fractionalPart,
            rawFractionalPart: rawFractionalPart,
            value: BigInt(integerPart) * BigInt(multiplier) + BigInt(fractionalPart)
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
}

export default ValueProcessor;