import presets from './pageDataPresets';

const initialState = {
    root : {
        net : presets.network.defaultNet,
        langData : presets.langData,
        connecionListOpened : false,
        navOpened : true,
        connectionStatus : false,
        pending : true,
        swapCardLeft : '45%',
        menuItem : 'exchange',
        pubkey : '',
        siteLocales : presets.langData.siteLocales,
        activeLocale : presets.langData.preferredLocale,
        langTitles : presets.langData.langTitles,
        pendingIndicator : false
    },
    swapCard : {
        pairs: [],
        exchange: {
            field0: {
                walletValue: '-',
                value: '',
                token: presets.swapTokens.defaultToken
            },
            field1: {
                walletValue: '-',
                value: '',
                token: presets.swapTokens.emptyToken
            }
        },
        liquidity: {
            field0: {
                walletValue: '-',
                value: '',
                token: presets.swapTokens.defaultToken
            },
            field1: {
                walletValue: '-',
                value: '',
                token: presets.swapTokens.emptyToken
            }
        },
        removeLiquidity : {
            simpleView : true,
            lt : undefined,
            amount : ''
        },
        activeField : 0,
        tokenListStatus: false,
        liquidityMain: true,
        confirmCardOpened: false,
        waitingConfirmation: {
            visibility : false,
            txStateType : 'waiting'
        }
    },
    tokenCard : {
        list : [],
        tokens : [],
        sort : 'asc'
    },
    navbar : {
    },
    aside : {
        exchangeRate : ''
    },
    indicatorPanel : {
        nativeToken: presets.network.nativeToken.hash,
        coinName: presets.network.nativeToken.name,
        net: presets.network.defaultNet,
        coinAmount: 0,
        enx: 0
    }
};

export default initialState;