import presets from './pageDataPresets';

const initialState = {
    root : {
        net             : presets.network.defaultNet,
        langData        : presets.langData,
        connecionListOpened : false,
        navOpened : window.innerWidth <= 757 ? false : true,
        connectionStatus : false,
        menuItem : 'exchange',
        pubkey : '',
        siteLocales : presets.langData.siteLocales,
        activeLocale : presets.langData.preferredLocale,
        langTitles : presets.langData.langTitles,
        pendingIndicator : false,
        pending         : true,
        swapCardLeft    : '45%',
        balances    : [],   // [{amount, token, ticker, decimals, minable, reissuable}] - explorer data
        pairs       : [],   // [{t1, t2, v1, v2, lt}] - all pairs from dex
        tokens      : [],   // [{ticker, hash}]
    },
    swapCard : {
        ltList  : [],       // [{t1, t2, v1, v2, lt}] - only pairs that contain user's liquidity tokens 
        exchange: {
            field0: {
                id          : 0,
                walletValue : '-',
                value       : '',
                token       : presets.swapTokens.emptyToken
            },
            field1: {
                id          : 1,
                walletValue : '-',
                value       : '',
                token       : presets.swapTokens.emptyToken
            }
        },
        liquidity: {
            field0: {
                id          : 2,
                walletValue : '-',
                value       : '',
                token       : presets.swapTokens.emptyToken
            },
            field1: {
                id          : 3,
                walletValue : '-',
                value       : '',
                token       : presets.swapTokens.emptyToken
            }
        },
        removeLiquidity : {
            simpleView : true,
            lt         : undefined,
            amount     : 50
        },
        activeField     : 0,
        tokenListStatus : false,
        liquidityMain   : true,
        liquidityRemove : false,
        confirmCardOpened: false,
        createPool      : false,
        waitingConfirmation: {
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
        nativeToken : presets.network.nativeToken.hash,
        coinName    : presets.network.nativeToken.ticker,
        net         : presets.network.defaultNet,
        coinAmount  : 0,
        enx         : 0
    }
};

export default initialState;