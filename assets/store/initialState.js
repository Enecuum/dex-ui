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
        menuItem : 'exchange'
    },
    wallet : {
        pubkey : ''
    },
    swapCard : {
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
        tokenListStatus: false,
        liquidityMain: true,
        confirmCard: false
    },
    tokenCard : {},
    Navbar : {},
    Aside : {}
};

export default initialState;