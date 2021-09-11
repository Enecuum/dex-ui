const presets =  {
    pending : {
        allowedTxTypes : {
            pool_create : 'pool_create',
            pool_swap : 'pool_swap',
            pool_add_liquidity : 'pool_add_liquidity',
            pool_remove_liquidity : 'pool_remove_liquidity',
            farm_create : 'farm_create',
            farm_get_reward : 'farm_get_reward',
            farm_increase_stake : 'farm_increase_stake',
            farm_close_stake : 'farm_close_stake',
            farm_decrease_stake : 'farm_decrease_stake'
        }
    },

    network : {
        genesisPubKey : '029dd222eeddd5c3340e8d46ae0a22e2c8e301bfee4903bcf8c899766c8ceb3a7d',
        nativeToken   : {
            ticker : 'BIT',
            hash   : '0000000000000000000000000000000000000000000000000000000000000001',
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
    paths : {
        exchange  : 'swap',
        liquidity : 'pool',
        topPairs  : 'top-pairs',
        etm       : 'etm',
        farms     : 'space-harvest-farms',
        drops     : 'space-drops'
    },
    etm : {
        totalSupplyDefault : '',
        feeValueDefault : '',
        tickerDefault : '',
        nameDefault : '',
        blockRewardDefault : '---'
    },
    dropFarms : {
        spaceHarvestFarms : {
            whiteList : []
        },
        spaceDrops : {
            whiteList : [
                'e395bcf6b3011b1624c22b19ae6d1246d93ba140602d0bc266384be44434df01',
                '802f22e165d0c2bbddaa90d38f3aa6523881800fd9f72b904c3866c7ba4653c2',
                'dd48d8cce2d03e35c4f6fa07b6ef784edcb675c9fcd5986a0d208f524374a0de'
            ]
        },        
    }
};

export default presets;