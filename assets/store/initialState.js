import presets from './pageDataPresets';

function getDefaultField(id) {
    return {
        id      : id,
        balance : presets.swapTokens.emptyBalance, // balance of the token from 'token' property
        value   : '',
        token   : presets.swapTokens.emptyToken
    };
};

const initialState = {
    root : {
        net                     : presets.network.defaultNet,
        langData                : presets.langData,
        connecionListOpened     : false,
        navOpened               : window.innerWidth <= 757 ? false : true,
        connectionStatus        : false,
        menuItem                : 'exchange',
        pubkey                  : '',
        siteLocales             : presets.langData.siteLocales,
        activeLocale            : presets.langData.preferredLocale,
        langTitles              : presets.langData.langTitles,
        pendingIndicator        : false,
        pending                 : true,
        swapCardLeft            : '45%',
        balances    : [],   // [{amount, token, ticker, decimals, minable, reissuable}] - explorer data
        pairs       : [],   // [{token_0 : {volume, hash}, token_2 : {volume, hash}, pool_fee, lt}] - all pairs from dex
        tokens      : [],   // [{ticker, hash, caption}] - all tokens from dex
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
        nativeToken : presets.network.nativeToken.hash,
        coinName    : presets.network.nativeToken.ticker,
        net         : presets.network.defaultNet,
        coinAmount  : 0,
        enx         : 0
    }
};

export default initialState;