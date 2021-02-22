class Presets {
    constructor () {
        this.active = {
            opacity : {
                simple : 1
            },
            visibility : 'hidden'
        };

        this.passive = {
            opacity : {
                simple : 0
            },
            visibility : 'visible'
        };
        
        this.exchange = {
            header : 'Exchange',
            addition : 'Trade tokens in an instant',
            plusVis : 'hidden',
            exchVis : 'visible',
            name0 : 'From',
            name1 : 'To',
            field0 : {
                value : '',
                token : startToken
            },
            field1 : {
                value : '',
                token : startToken
            }
        };

        this.liquidity = {
            header : 'Liquidity',
            addition : 'Add liquidity to receive LP tokens',
            plusVis : 'visible',
            exchVis : 'hidden',
            name0 : 'Input',
            name1 : 'Input',
            field0 : {
                value : '',
                token : startToken
            },
            field1 : {
                value : '',
                token : startToken
            }
        };
        this.network = {
            genesisPubKey : '029dd222eeddd5c3340e8d46ae0a22e2c8e301bfee4903bcf8c899766c8ceb3a7d',
            nativeToken : {
                hash : '0000000000000000000000000000000000000000000000000000000000000000',
                fee : 100000000
            }
        };
    };
};