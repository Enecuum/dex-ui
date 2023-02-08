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
            token_issue : 'token_issue',
            claim_init : 'claim_init',
            claim_confirm : 'claim_confirm',
            enq_lock : 'enq_lock'
        }
    },

    network : {
        genesisPubKey : '02833f453fb8bf10cc5e8fd362d563851543559f3ea6e662ef114d8db8f72dda19',
        nativeToken   : {
            ticker : 'ENQ',
            hash   : '0000000000000000000000000000000000000000000000000000000000000000',//////////////// lastsymbol 1
            fee    : 1000000000
        },
        defaultNet : {
            name : 'PULSE',
            url  : 'https://pulse.enecuum.com/'
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
        voting       : 'space-voting',
        spaceStation : 'space-station',
        spaceBridge  : 'space-bridge',
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
        voting : {
            finalBlockNum : 5256585,
            situationReadme : "",
            voutingReadme : "",
            list : [
                {
                    farm_id: "1d2296bdc6b018f8da636c7d0843b5a2c9acc7bdf44a60d4d3ffc20e928db9c2",
                    issue : "Extend max supply to the amount of uncontrolled emission",
                    proposal : ""
                },
                {
                    farm_id: "5d4fc5565069b852658de1071811dffa116accf828c474b1806004b06dbe2e19",
                    issue : "Extend Max Supply to 700,000,000 ENQ and create a DAO to manage extra funds",
                    proposal : ""
                },
                {
                    farm_id: "5f63c2df455400a7788e255d4b2bbf1d094d081d4c644a0c07279eecebc5f700",
                    issue : "Burn team’s ENQ + reduce mining emission period",
                    proposal : ""
                },
                {
                    farm_id: "c8452c255d3d51955aa438d42a0470bb29cfae320549825ebe0fc9c1cffc6425",
                    issue : "Increase transfer fee to 0.3ENQ and burn 0.2ENQ from it",
                    proposal : ""
                },
                {
                    farm_id: "cd53ca30759a8121e499d650482c916c066e1e9fd3c8ebc3cfedb657438fb3ff",
                    issue : "Burn teams ENQ and extend max supply to the amount of uncontrolled emission",
                    proposal : ""
                },
                {
                    farm_id: "ecb398af2c94c3a175d8881f854a3e5a627d218d6cfd4f125b37a136e1def1a1",
                    issue : "Decrease mining rewards",
                    proposal : ""
                }
            ]
        }
    },
    

}

export default presets
