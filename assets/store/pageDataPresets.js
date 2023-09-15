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
            whiteList : [
                'b0b493d3a05804327ad90ccb580a95cb7219c5ca34c509e7c8212953cf6d7333',
                '784dac48920ae1a4ad7a22b45cc28df7109ed2316dc6f9ca0bfb8e0fead9ef6b',
                'e8e8b2bc7427e261000df8b5cc4c857affd86e5e5c1992af79b14912cc38cfce',
                '347f72d0934d10b4c670acc3593a199922d129403da736bc89ffe88174c88bc7',
                '3b2a32d865a26b3a6d69fd30d7999de07ec4378724bd69d0b705e78b86b4bac0',
                '97a60bead0f67d90fc523b285d3fe9738612cbe617a7c4be02b82036375012f2',
                'a92c87cbdcf03ce1e962ced279e28905c7b618564ea6ed34ed01bdf79f7a029f'
            ]
        },
        spaceDrops : {
            whiteList : [
                '94a044b138fe0a8984bb6faf831ed6dffd9fd9f8cd1e59b879382b85513c44bf',
                '66a8a2bbc33c76fc024c5e823d766117e1824fb036ae9443076063d8fb81886d',
                'e6dec9127fb04674d782ffc4036d3e9cfec6f599336af6d116864b7ffbce9934',
                '5864b58c49c5832af6fd88afdf5bac5205a881032f55e882aed414aefbcd1f1a',
                'e395bcf6b3011b1624c22b19ae6d1246d93ba140602d0bc266384be44434df01',
                '802f22e165d0c2bbddaa90d38f3aa6523881800fd9f72b904c3866c7ba4653c2',
                'dd48d8cce2d03e35c4f6fa07b6ef784edcb675c9fcd5986a0d208f524374a0de',
                "572e9c1846a13e8135d984b231529e337301cd01b3f6209a773df822841f2aef",
                '7dcc38f4bd86493f93804b5d1000dbc383851f1a766444c2dfc49d8cac0966b7',
                '717369faf4cee266dad3d85a833ba11b3a0ca6685b992cbff7c85b5a118bdcfb',
                'd235fa223260b2de8867ccaba5601fa4d384d1ce814236cd5afad71faa2928e9',
                'c4754091a753e4765cb8924bae0fce40d2b7eea792a8a4250530d6f7e19ccfb8',
                'adc28f9a66919db490be29be9d25ec6c98eadd9db4a8e29c58641dab4a64d6a4'
            ]
        },
        voting : {
            voteToken : "75798e583350dd0d77e4466e52af16e086adc25895f84c3372bbd2d4ec958248",
            votes : {
                miningSlots : {
                    finalBlockNum : 5514240,
                    forceDeactivation : true,
                    situationReadme : "https://blog.enecuum.com/poa-mining-slots-announcement-46c038302373",
                    voutingReadme : "https://guides.enecuum.com/enq/token-issue.html#mining-slots",
                    // resultsReadme : "", 
                    list : [
                        {
                            issue : "Set minimal stake to: 500,000 ENQ",
                            proposal : "https://blog.enecuum.com/mining-slots-voting-803c9b412c4c",
                            farm_ids : [
                                "28be327a0512fa0326bd385d85cfd64722d010f103d0aabe0beb8d788e233bdb"
                            ]
                        },
                        {
                            issue : "Set minimal stake to: 250,000 ENQ",
                            proposal : "https://blog.enecuum.com/mining-slots-voting-803c9b412c4c",
                            farm_ids : [
                                "64f01b9d92675153803e99a3cab4687f909f4a415aa69db38826bc7a03c334d8"
                            ]
                        },
                        {
                            issue : "Set minimal stake to: 125,000 ENQ",
                            proposal : "https://blog.enecuum.com/mining-slots-voting-803c9b412c4c",
                            farm_ids : [
                                "9db59aab986f596efe352397e6507de6bf482a0f13098c3a64c7a8be275cc7a2"
                            ]
                        },
                        {
                            issue : "Set minimal stake to: 75,000 ENQ",
                            proposal : "https://blog.enecuum.com/mining-slots-voting-803c9b412c4c",
                            farm_ids : [
                                "eb461ae87b7cd3c6b19b905008e93bc758379a7569abeafbc5db4f3ff86ff0a0"
                            ]
                        }
                    ]
                },
                nextSteps : {
                    finalBlockNum : 5111040,
                    forceDeactivation : true,
                    situationReadme : "https://blog.enecuum.com/urgent-security-report-211cd6118933",
                    voutingReadme : "https://trinitylab.gitbook.io/enex.space/how-to-use/governance",
                    resultsReadme : "https://blog.enecuum.com/voting-results-and-next-steps-an-overview-cd12b7f49f15", 
                    list : [
                        {
                            issue : "Extend max supply to the amount of uncontrolled emission",
                            proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#8ba2",
                            farm_ids : [
                                "1d2296bdc6b018f8da636c7d0843b5a2c9acc7bdf44a60d4d3ffc20e928db9c2",
                                "578b407bd9e8c316a5b3f298246df1800f4088c64050931b2c8363b2adfc11aa"
                            ]
                        },
                        {
                            issue : "Extend Max Supply and create a DAO to manage extra funds",
                            proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#3a8d",
                            farm_ids : [
                                "5d4fc5565069b852658de1071811dffa116accf828c474b1806004b06dbe2e19",
                                "5e85a3cc8495348ebe53efa537f6cea90f5f968650ad3d311184079b8468cb56"
                            ]
                        },
                        {
                            issue : "Burn team's ENQ + reduce mining emission period",
                            proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#a820",
                            farm_ids : [
                                "5f63c2df455400a7788e255d4b2bbf1d094d081d4c644a0c07279eecebc5f700",
                                "677d61e17e1b682b6d79366152829bb0f6ac476f711688a226935d0ce0608695"
                            ]
                        },
                        {
                            issue : "Increase transfer fee and burn a part from it",
                            proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#d4fd",
                            farm_ids : [
                                "c8452c255d3d51955aa438d42a0470bb29cfae320549825ebe0fc9c1cffc6425",
                                "6f00bd2cbc51e71f0afb2ff63c566229380d2f132c5dfcecdad9975d8400b651"
                            ]
                        },
                        {
                            issue : "Burn team's ENQ and extend max supply",
                            proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#f152",
                            farm_ids : [
                                "cd53ca30759a8121e499d650482c916c066e1e9fd3c8ebc3cfedb657438fb3ff",
                                "9af399fa788bead59a8983d78abb633d3a6cdf30c2d7fd1b6d44bfb2d276787f"
                            ]
                        },
                        {
                            issue : "Decrease mining rewards",
                            proposal : "https://blog.enecuum.com/the-proposals-fe2dcf1a5dd7#22aa",
                            farm_ids : [
                                "ecb398af2c94c3a175d8881f854a3e5a627d218d6cfd4f125b37a136e1def1a1",
                                "be7367e3454844a7dc467a3ef5a12cec45108cec88d4f1782d068535135aab48"
                            ]
                        }
                    ]
                },
                tickerPrefix : {
                    finalBlockNum : 6061056,
                    forceDeactivation : true,
                    situationReadme : "",
                    voutingReadme : "",
                    resultsReadme : "", 
                    list : [
                        {
                            issue : "Save current logic. Add \"sb\" prefix to token's ticker in the destination network.",
                            proposal : "",
                            farm_ids : [
                                "c86eedcd0423c0d7f21ca84e7f4e2fbc9cb1d0dc79677d563941d8afdfbf9781",
                            ]
                        },
                        {
                            issue : "Change logic. Save the original  token's ticker in the destination network.",
                            proposal : "",
                            farm_ids : [
                                "d431583f7d828777d85c96c21f75714107b76b8c69e565ad0c6610562075c689",
                            ]
                        }
                    ]
                },
                tuneTokenomics: {
                    finalBlockNum : 6172544,
                    forceDeactivation : true,
                    canceled : true,
                    situationReadme : "",
                    voutingReadme : "https://t.me/Enecuum_EN/316613",
                    resultsReadme : "",
                    list : [
                        {
                            issue : "Extend Max Supply to 2,500,000,000 ENQ",
                            proposal : "",
                            farm_ids : [
                                "119559f5ba540f76d579c240056997a9ddf5a262a04d0bb7e8b7de51f40af549",
                            ]
                        },
                        {
                            issue : "Extend Max Supply to 3,500,000,000 ENQ",
                            proposal : "",
                            farm_ids : [
                                "8ec18b2b7693257cb06857a4ce850ee2c07ca20ad7f071217803e09756eeee52",
                            ]
                        },
                        {
                            issue : "Extend Max Supply to 5,000,000,000 ENQ",
                            proposal : "",
                            farm_ids : [
                                "f99b4a02d88bced756ab029234d8a988aae6efe2cb469b6daecb36697f139c87",
                            ]
                        },
                        {
                            issue : "DAO token proposal",
                            proposal : "",
                            farm_ids : [
                                "e3c91e604480cc57878816afd0320cad1454827f9fcd34d9a95f3f9a968072bb",
                            ]
                        },
                    ]
                },
                testVouting : {
                    finalBlockNum : 6196733,
                    forceDeactivation : false,
                    canceled : false,
                    situationReadme : "",
                    voutingReadme : "https://blog.enecuum.com/start-of-the-voting-on-trinity-dao-token-f884474f4ac5",
                    resultsReadme : "",
                    list : [
                        {
                            issue : "Distribute Trinity DAO (governance) token as a drop based on accounts balance and history. Extend Max Supply to 2,500,000,000 ENQ.",
                            proposal : "",
                            farm_ids : [
                                "9b6c30b7674ac670f8383d2a1b495f71390496d173efb4e0b62e899c4051af4d",
                            ]
                        },
                        {
                            issue : "Distribute Trinity DAO (governance) token in exchange for donation to the network developers team budget. Leave Max Supply unchanged.",
                            proposal : "",
                            farm_ids : [
                                "01ef8132546e477a359133683ce31707a71589fdb3c19dc5841381c5751ff10d",
                            ]
                        },
                    ]
                }
            }
        }
    },
    

}

export default presets
