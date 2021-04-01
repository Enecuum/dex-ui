import initialState from '../initialState';
import actions from '../actions/actions';

function rootStore (state, changingProperty) {
    return {
        ...state,
        root : {
            ...state.root,
            ...changingProperty
        }
    };
};

function tokenCardStore (state, changingProperty) {
    return {
        ...state,
        tokenCard : {
            ...state.tokenCard,
            ...changingProperty
        }
    };
};

function swapCardStore(state, changingProperty) {
    return {
        ...state,
        swapCard: {
            ...state.swapCard,
            ...changingProperty
        }
    };
};

function convertIntoMode(mode, packed) {
    if (mode == 'exchange')
        return { exchange: packed };
    else
        return { liquidity: packed };
};

function fieldStore(state, mode, field, changingProperty) {
    return swapCardStore(state, {
        ...convertIntoMode(mode, {
            ...state.swapCard[mode],
            field0: {
                ...state.swapCard[mode][field],
                ...changingProperty
            }
        })
    });
};

function swapFields(state, mode) {
    let field0 = state.swapCard[mode].field0;
    return {
        ...state,
        swapCard: {
            ...state.swapCard,
            ...convertIntoMode(mode, {
                ...state.swapCard[mode],
                field0: state.swapCard[mode].field1,
                field1: field0
            })
        }
    };
};

export default function rootReducer (state = initialState, action) {
    switch (action.type) {
        case actions.root.OPEN_ASIDE: 
            return rootStore(state, {
                navOpened : true,
                swapCardLeft : '45%'
            });

        case actions.root.CLOSE_ASIDE:
            return rootStore(state, { 
                navOpened : false,
                swapCardLeft : '41%'
            });

        case actions.root.CHANGE_NET:
            return rootStore(state, { net : action.value });

        case actions.root.CHANGE_LANG:
            return rootStore(state, { langData : action.value });

        case actions.root.OPEN_CONNECTION_LIST:
            return rootStore(state, { connecionListOpened : true });

        case actions.root.CLOSE_CONNECTION_LIST:
            return rootStore(state, { connecionListOpened : false });

        case actions.root.CHANGE_CONN_STATUS:
            return rootStore(state, { connectionStatus : action.value });

        case actions.root.CHANGE_MENU_ITEM:
            return rootStore(state, { menuItem : action.value });

        // ==================================================================

        case actions.tokenCard.ASSIGN_ALL_TOKENS:
            return tokenCardStore(state, { tokens : action.value });

        case actions.tokenCard.ASSIGN_TOKEN_LIST: 
            return tokenCardStore(state, { list : action.value });

        case actions.tokenCard.CHANGE_SORT_MODE:
            return tokenCardStore(state, { sort : action.value });

        // ==================================================================

        case actions.swapCard.SWAP_FIELDS:
            return swapFields(state, action.mode);

        case actions.swapCard.ASSIGN_WALLET_VALUE:
            return fieldStore(state, action.mode, action.field, { walletValue: action.value });

        case actions.swapCard.OPEN_TOKEN_LIST:
            return swapCardStore(state, { tokenListStatus: true });

        case actions.swapCard.CLOSE_TOKEN_LIST:
            return swapCardStore(state, { tokenListStatus: false });

        case actions.swapCard.CHANGE_LIQUIDITY_MODE:
            return swapCardStore(state, { liquidityMain: !state.swapCard.liquidityMain });

        case actions.swapCard.OPEN_CONFIRM_CARD:
            return swapCardStore(state, { confirmCard: true });

        case actions.swapCard.CLOSE_CONFIRM_CARD:
            return swapCardStore(state, { confirmCard: false });

        case actions.swapCard.ASSIGN_COIN_VALUE:
            return fieldStore(state, action.mode, action.field, { value: action.value });

        case actions.swapCard.ASSIGN_TOKEN_VALUE:
            return fieldStore(state, action.mode, action.field, { token: action.value });

        case actions.swapCard.UPD_PAIRS:
            return swapCardStore(state, { pairs: action.value });

        // ==================================================================

        default: 
            return state;
    }
};