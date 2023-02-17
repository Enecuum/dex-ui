const proposals = {
    p1 : {
        issue : "Extend max supply to the amount of uncontrolled emission",
        proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#8ba2"
    },
    p2 : {
        issue : "Extend Max Supply and create a DAO to manage extra funds",
        proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#3a8d"
    },
    p3 : {
        issue : "Burn team's ENQ + reduce mining emission period",
        proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#a820"
    },
    p4 : {
        issue : "Increase transfer fee and burn a part from it",
        proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#d4fd"
    },
    p5 : {
        issue : "Burn team's ENQ and extend max supply",
        proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#f152"
    },
    p6 : {
        issue : "Decrease mining rewards",
        proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#22aa"
    },
}


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
        governance   : 'governance',
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
            finalBlockNum : 5111040,
            situationReadme : "https://blog.enecuum.com/urgent-security-report-211cd6118933",
            voutingReadme : "https://trinitylab.gitbook.io/enex.space/how-to-use/governance",
            list : [
                // bit
                {
                    farm_id: "1d2296bdc6b018f8da636c7d0843b5a2c9acc7bdf44a60d4d3ffc20e928db9c2",
                    ...proposals.p1
                },
                {
                    farm_id: "5d4fc5565069b852658de1071811dffa116accf828c474b1806004b06dbe2e19",
                    ...proposals.p2
                },
                {
                    farm_id: "5f63c2df455400a7788e255d4b2bbf1d094d081d4c644a0c07279eecebc5f700",
                    ...proposals.p3
                },
                {
                    farm_id: "c8452c255d3d51955aa438d42a0470bb29cfae320549825ebe0fc9c1cffc6425",
                    ...proposals.p4
                },
                {
                    farm_id: "cd53ca30759a8121e499d650482c916c066e1e9fd3c8ebc3cfedb657438fb3ff",
                    ...proposals.p5
                },
                {
                    farm_id: "ecb398af2c94c3a175d8881f854a3e5a627d218d6cfd4f125b37a136e1def1a1",
                    ...proposals.p6
                },

                // pulse
                {
                    farm_id: "578b407bd9e8c316a5b3f298246df1800f4088c64050931b2c8363b2adfc11aa",
                    ...proposals.p1
                },
                {
                    farm_id: "5e85a3cc8495348ebe53efa537f6cea90f5f968650ad3d311184079b8468cb56",
                    ...proposals.p2
                },
                {
                    farm_id: "677d61e17e1b682b6d79366152829bb0f6ac476f711688a226935d0ce0608695",
                    ...proposals.p3
                },
                {
                    farm_id: "6f00bd2cbc51e71f0afb2ff63c566229380d2f132c5dfcecdad9975d8400b651",
                    ...proposals.p4
                },
                {
                    farm_id: "9af399fa788bead59a8983d78abb633d3a6cdf30c2d7fd1b6d44bfb2d276787f",
                    ...proposals.p5
                },
                {
                    farm_id: "be7367e3454844a7dc467a3ef5a12cec45108cec88d4f1782d068535135aab48",
                    ...proposals.p6
                }
            ]
        }
    },
    

}

export default presets
