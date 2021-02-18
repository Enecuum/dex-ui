class Presets {
    constructor () {
        this.active = {
            opacity : {
                hover : 1,
                simple : 1
            },
            visibility : 'hidden'
        };

        this.passive = {
            opacity : {
                hover : 0.2,
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
    };
};