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
                color1 : 'white',
                color2 : '#eeeaf4',
                color3 : 'rgb(96, 107, 251)',
                background : '#f9fafb',
                textColor : 'black',
                exitColor : 'grey',
                boxShadow : 'rgba(5, 6, 13, 0.445) 7px 7px 15px 0px'
            },
            dark : {
                color1 : 'rgb(33, 38, 62)',
                color2 : '#40458a',
                color3 : 'rgb(96, 107, 251)',
                background : 'rgb(21, 26, 47)',
                textColor : 'white',
                exitColor : 'white',
                boxShadow : 'rgba(5, 6, 13, 0.445) 7px 7px 15px 0px'
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
            siteLocales : ['rus', 'eng'],
            preferredLocale : ['eng'],
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