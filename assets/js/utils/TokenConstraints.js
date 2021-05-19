class TokenСonstraints {
    constructor (MAX_SUPPLY_LIMIT) {
        this.MAX_SUPPLY_LIMIT = MAX_SUPPLY_LIMIT;
        
        this.mining_period = {
            minValue : 1,
            maxValue : 36500
        };
        this.ticker = {
            maxLength: 6
        };
        this.name = {
            maxLength: 40
        };
        this.token_type_arr = [
            {title: 'NON_REISSUABLE', value: '0'},
            {title: 'REISSUABLE', value: '1'},
            {title: 'MINEABLE', value: '2'}
        ];
        this.max_supply = {
            minValue: 0,
            maxValue: this.MAX_SUPPLY_LIMIT
        };
        this.block_reward = {
            minValue: 0,
            maxValue: this.MAX_SUPPLY_LIMIT
        };
        this.min_stake = {
            minValue: 0,
            maxValue: this.MAX_SUPPLY_LIMIT
        };
        this.referrer_stake = {
            minValue: 0,
            maxValue: this.MAX_SUPPLY_LIMIT
        };
        this.ref_share = {
            minValue: 0,
            maxValue: 100,
            decimalPlaces: 2
        };
        this.decimals = {            
            minValue: 0,
            maxValue: 10
        };
        this.total_supply = {
            minValue: 0,
            maxValue: this.MAX_SUPPLY_LIMIT
        };
        this.fee_type_arr = [
            {title: 'TOKEN_FLAT_FEE', value: '0'},
            {title: 'TOKEN_PERCENT_FEE', value: '1'}
        ];
        this.fee_value_props_arr = [
            {
                minValue: 1,
                maxValue: this.MAX_SUPPLY_LIMIT,
                decimalPlaces: 10      
            },
            {
                minValue: 1,
                maxValue: 100,
                decimalPlaces: 2                
            }                
        ];
        this.min_fee_for_percent_fee_type = {
            minValue: 0,
            maxValue: this.MAX_SUPPLY_LIMIT
        }
    };
};

export default TokenСonstraints;