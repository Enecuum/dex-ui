import presets from './pageDataPresets';

function getDefaultField(id) {
    return {
        id      : id,
        balance : presets.swapTokens.emptyBalance, // balance of the token from 'token' property
        value   : {
            value   : undefined,
            decimals: undefined
        },
        token   : presets.swapTokens.emptyToken
    };
}

const initialState = {
    root : {
        net                     : presets.network.defaultNet,
        mainToken               : presets.network.nativeToken.hash,
        langData                : presets.langData,
        connecionListOpened     : false,
        navOpened               : window.innerWidth > 757,
        connectionStatus        : false,
        menuItem                : 'exchange',
        pubkey                  : '',
        siteLocales             : presets.langData.siteLocales,
        activeLocale            : presets.langData.preferredLocale,
        langTitles              : presets.langData.langTitles,
        pendingIndicator        : false,
        swapCardLeft            : '45%',
        currentTxHash           : undefined,
        balances    : [],   // [{amount, token, ticker, decimals, minable, reissuable}] - explorer data
        pairs       : [],   // [{token_0 : {volume, hash}, token_2 : {volume, hash}, pool_fee, lt}] - all pairs from dex
        tokens      : [],   // [{ticker, hash, caption}] - all tokens from dex
        recentTxs   : []
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
        tokenListStatus     : false,
        liquidityMain       : true,
        liquidityRemove     : false,
        confirmCardOpened   : false,
        createPool          : false,
        waitingConfirmation : {
            visibility  : false,
            txStateType : 'waiting'
        }
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
        accountInfoVisibility : false,
        nativeToken : presets.network.nativeToken.hash,
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
        mainToken         : presets.network.nativeToken.hash,
        mainTokenAmount   : undefined,
        mainTokenDecimals : undefined,
        mainTokenFee      : presets.network.nativeToken.fee,
        pricelist         : {},
        expandedRow       : null,
        managedFarmData   : null,
        sortType          : 'liquidity',
        showStakeModal    : false,
        currentAction     : undefined,
        stakeData         : {
            actionCost         : 0,
            stakeValue         : {
                numberValue : 0
            },  
            stakeTxStatus      : '',
            stakeValid         : true,
            msgData            : {},
            stakeTokenAmount   : undefined
        }
    }
};

export default initialState;