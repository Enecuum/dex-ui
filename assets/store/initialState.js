import presets from './pageDataPresets';

function getDefaultField(id) {
    return {
        id      : id,
        balance : presets.swapTokens.emptyBalance,
        value   : {
            value   : undefined,
            decimals: undefined
        },
        token   : presets.swapTokens.emptyToken
    }
}

const initialState = {

    root : {
        net                     : presets.network.defaultNet,
        networkInfo             : {},
        mainToken               : presets.network.nativeToken.hash, // <-
        mainTokenFee            : presets.network.nativeToken.fee,  // <-
        langData                : presets.langData,
        connecionListOpened     : false,
        navOpened               : window.innerWidth > 757,
        connectionStatus        : false,
        menuItem                : 'exchange',
        pubkey                  : '',
        siteLocales             : presets.langData.siteLocales,
        activeLocale            : presets.langData.preferredLocale,
        langTitles              : presets.langData.langTitles,
        swapCardLeft            : '45%',
        currentTxHash           : undefined,
        balances    : [],   // [{amount, token, ticker, decimals, minable, reissuable}] - explorer data
        pairs       : [],   // [{token_0 : {volume, hash}, token_2 : {volume, hash}, pool_fee, lt}] - all pairs from dex
        tokens      : [],   // [{ticker, hash, caption}] - all tokens from dex
        recentTxs   : [],
        nativeToken : {}
    },
    
    nonNativeConnection : {
        walletConnectIsConnected  : false,
        walletConnect             : undefined,
        walletConnectChain        : undefined,        
        walletConnectWalletTitle  : undefined,
        walletConnectAccountId    : undefined,
       
        web3ExtensionIsConnected  : false,
        web3Extension             : undefined,
        web3ExtensionChain        : undefined,
        web3ExtensionWalletTitle  : undefined,
        web3ExtensionAccountId    : undefined
    },

    swapCard : {
        exchange: {
            field0  : getDefaultField(0),
            field1  : getDefaultField(1)
        },
        liquidity: {
            field0  : getDefaultField(2),
            field1  : getDefaultField(3)
        },
        removeLiquidity : {
            simpleView : true,
            field0  : getDefaultField(4),
            field1  : getDefaultField(5),
            ltfield : getDefaultField(6)
        },
        activeField         : 0,
        swapCalculationsDirection : "down",
        tokenListStatus     : false,
        liquidityMain       : true,
        liquidityRemove     : false,
        createPool          : false,
        waitingConfirmation : {
        },
        route : []
    },

    tokenCard : {
        list : [],
        sort : 'asc'
    },

    navbar : {
    },

    aside : {
        exchangeRate : ''
    },

    indicatorPanel : {
        coinName    : presets.network.nativeToken.ticker,
        net         : presets.network.defaultNet,
        coinAmount  : 0,
        enx         : 0
    },

    etm : {
        showForm : false,
        tokenData : {
            mining_period: '',
            ticker: presets.etm.tickerDefault,    
            name: presets.etm.nameDefault,
            token_type: '0',
            reissuable: 0,
            mineable: 0,
            max_supply: '',
            block_reward: presets.etm.blockRewardDefault,
            min_stake: '',
            referrer_stake: '',
            ref_share: '',          
            decimals: 10,
            total_supply: presets.etm.totalSupplyDefault,
            fee_type: '0',
            fee_value: presets.etm.feeValueDefault,
            min_fee_for_percent_fee_type: ''
        },
        tokenBigIntData : {
            mining_period: '',
            max_supply: '',
            block_reward: '',
            min_stake: '',
            referrer_stake: '',
            ref_share: '',          
            total_supply: presets.etm.totalSupplyDefault,
            fee_value: presets.etm.feeValueDefault,
            min_fee_for_percent_fee_type: ''
        },
        waitingConfirmation : {
            visibility  : false,
            txStateType : 'waiting'
        },
        issueTokenTxAmount : '',
        mainTokenTicker : presets.network.nativeToken.ticker,
        mainTokenDecimals : 10,
        msgData : {},
        dataValid : false,
        showFormErrMessages : false,
        possibleToIssueToken : false
    },

    farms : {
        mainTokenAmount   : undefined,
        mainTokenDecimals : undefined,
        mainTokenFee      : presets.network.nativeToken.fee,
        pricelist         : {},
        expandedRow       : null,
        managedFarmData   : null,
        sortType          : 'liquidity',
        showStakeModal    : false,
        currentAction     : undefined,
        farmsList         : [],
        stakeData         : {
            actionCost         : 0,
            initialStake       : 0,
            stakeValue         : {
                numberValue : 0
            },  
            stakeTxStatus      : '',
            stakeValid         : true,
            msgData            : {},
            stakeTokenAmount   : undefined
        }
    },

    drops : {
        mainTokenAmount   : undefined,
        mainTokenDecimals : undefined,
        mainTokenFee      : presets.network.nativeToken.fee,
        pricelist         : {},
        expandedRow       : null,
        managedFarmData   : null,
        sortType          : 'liquidity',
        showStakeModal    : false,
        currentAction     : undefined,
        farmsList         : [],
        exchangeRate      : 0,
        stakeData         : {
            actionCost         : 0,
            initialStake       : 0,
            stakeValue         : {
                numberValue : 0
            },  
            stakeTxStatus      : '',
            stakeValid         : true,
            msgData            : {},
            stakeTokenAmount   : undefined
        }
    },

    spaceStation : {
        mainTokenAmount     : undefined,
        mainTokenDecimals   : undefined,
        mainTokenFee        : presets.network.nativeToken.fee,
        pricelist           : {},
        expandedRow         : null,
        managedFarmData     : null,
        managedPool         : null,
        sortType            : 'liquidity',
        showStakeModal      : false,
        showDistributeModal : false,
        currentAction       : undefined,
        farmsList           : [],
        poolsList           : [],
        exchangeRate        : 0,
        stakeData           : {
            actionCost         : 0,
            initialStake       : 0,
            stakeValue         : {
                numberValue : 0
            },  
            stakeTxStatus      : '',
            stakeValid         : true,
            msgData            : {},
            stakeTokenAmount   : undefined
        }
    },
    spaceBridge : {
        direction : 'ETH-ENQ', //'ETH->ENQ' or 'ENQ->ETH'
        showHistory : false,
        showLock : false,
        showClaimInit : false,
        showClaimConfirm : false,
        srcNet : undefined,
        srcTokenHash : undefined,
        srcTokenAllowance : undefined,
        srcTokenBalance : undefined,
        srcTokenDecimals : undefined,
        srcTokenTicker : undefined,
        srcTokenAmountToSend : undefined,
        currentBridgeTx : undefined
    }

}

export default initialState