const presets =  {

    pending : {
        allowedTxTypes : {
            pool_create : 'pool_create',
            pool_add_liquidity : 'pool_add_liquidity',
            pool_remove_liquidity : 'pool_remove_liquidity',
            pool_sell_exact : 'pool_sell_exact',
            pool_sell_exact_routed : 'pool_sell_exact_routed',
            pool_buy_exact : 'pool_buy_exact',
            pool_buy_exact_routed : 'pool_buy_exact_routed',
            farm_create : 'farm_create',
            farm_get_reward : 'farm_get_reward',
            farm_increase_stake : 'farm_increase_stake',
            farm_close_stake : 'farm_close_stake',
            farm_decrease_stake : 'farm_decrease_stake',
            dex_cmd_distribute : 'dex_cmd_distribute',
            token_issue : 'token_issue'
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

    logoUrl : 'https://pulse.enecuum.com/info/token/logo/',

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
            ticker      : undefined, // undefined - flag for using i18 default meaning
            decimals    : 0,
            minable     : 0,
            reissuable  : 0
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
        preferredLocale: ['en']
    },

    paths : {
        exchange     : 'swap',
        liquidity    : 'pool',
        topPairs     : 'top-pairs',
        etm          : 'etm',
        farms        : 'space-harvest-farms',
        drops        : 'space-drops',
        spaceStation : 'space-station',
        spaceBridge  : 'space-bridge'
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
            whiteList : [
                '3b2a32d865a26b3a6d69fd30d7999de07ec4378724bd69d0b705e78b86b4bac0',//Pulse|cripto_banya
                '97a60bead0f67d90fc523b285d3fe9738612cbe617a7c4be02b82036375012f2'//Pulse|alexcripto_SMT
            ]
        },
        spaceDrops : {
            whiteList : [
                'e395bcf6b3011b1624c22b19ae6d1246d93ba140602d0bc266384be44434df01',
                '802f22e165d0c2bbddaa90d38f3aa6523881800fd9f72b904c3866c7ba4653c2',
                '7dcc38f4bd86493f93804b5d1000dbc383851f1a766444c2dfc49d8cac0966b7',//Pulse|cripto_banya
                '717369faf4cee266dad3d85a833ba11b3a0ca6685b992cbff7c85b5a118bdcfb',//Pulse|alexcripto_SMT
                'd235fa223260b2de8867ccaba5601fa4d384d1ce814236cd5afad71faa2928e9',//Pulse|sos-ig
                'dd48d8cce2d03e35c4f6fa07b6ef784edcb675c9fcd5986a0d208f524374a0de'
            ]
        }
    }

}

export default presets
