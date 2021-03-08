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
            plusVis : 'hidden',
            exchVis : 'visible',
            field0 : {
                value : '',
                token : {
                    name : startToken,
                    hash : undefined
                }
            },
            field1 : {
                value : '',
                token : {
                    name : startToken,
                    hash : undefined
                }
            }
        };

        this.liquidity = {
            plusVis : 'visible',
            exchVis : 'hidden',
            field0 : {
                value : '',
                token : {
                    name : startToken,
                    hash : undefined
                }
            },
            field1 : {
                value : '',
                token : {
                    name : startToken,
                    hash : undefined
                }
            }
        };

        this.colorThemes = {
            light : {
                color1 : '#ecf4fc',
                color2 : '#e4ecfc',
                color3 : '#747cf4',
                background : 'white',
                textColor : 'black',
                exitColor : 'grey'
            },
            dark : {
                color1 : 'rgb(39, 38, 61)',
                color2 : 'lightgrey',
                color3 : 'black',
                background : '#131329',
                textColor : '#2EC2A7',
                exitColor : 'white'
            }
        };

        this.network = {
            genesisPubKey : '029dd222eeddd5c3340e8d46ae0a22e2c8e301bfee4903bcf8c899766c8ceb3a7d',
            nativeToken : {
                hash : '0000000000000000000000000000000000000000000000000000000000000000',
                fee : 100000000
            }
        };

        this.langData = {
            navbars : {
                left : [],
                top : {
                    connectionCard : {}
                }
            },
            trade : {
                switch : {},
                swapCard : {
                    exchange : {},
                    liquidity : {},
                    submitButton : {}
                },
                tokenCard : {}
            }
        };
    };
};