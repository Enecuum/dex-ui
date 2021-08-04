const presets =  {
    network : {
        genesisPubKey : '029dd222eeddd5c3340e8d46ae0a22e2c8e301bfee4903bcf8c899766c8ceb3a7d',
        nativeToken   : {
            ticker : 'BIT',
            hash   : '0000000000000000000000000000000000000000000000000000000000000001',
            //hash : '1111111111111111111111111111111111111111111111111111111111111111',
            fee    : 1000000000
        },
        defaultNet : {
            name : 'BIT',
            //url  : 'http://bit-dev.enecuum.com/',
            url  : 'https://bit.enecuum.com/'
        }
    },

    swapTokens : {
        emptyToken: {
            ticker      : undefined, // undefined - flag for using i18 default meaning
            hash        : undefined,
            caption     : '',
            decimals    : undefined,
            total_supply: undefined
        },
        emptyBalance: {
            amount      : '-',
            token       : undefined,
            ticker      : undefined,// undefined - flag for using i18 default meaning
            decimals    : 0,
            minable     : 0,
            reissuables : 0
        }
    },

    langData : {
        siteLocales: ['ru', 'en'],
        langTitles: {
            en: {
                full    : 'English',
                short   : 'En'
            },
            ru: {
                full    : 'Русский',
                short   : 'Ru'
            }
        },
        preferredLocale: ['en'],
        navbars: {
            left: [],
            top: {
                connectionCard: {}
            }
        },
        trade: {
            switch: {},
            swapCard: {
                exchange    : {},
                liquidity   : {},
                submitButton: {}
            },
            tokenCard: {},
            confirmCard : {
                waitingForConfirmationInternals : {
                    swap : {
                    },
                    addLiquidity : {
                    },
                    createPool : { 
                    }
                }
            },
        }
    },
    etm : {
        totalSupplyDefault : '',
        feeValueDefault : '',
        tickerDefault : '',
        nameDefault : '',
        blockRewardDefault : '---'
    }
};

export default presets;