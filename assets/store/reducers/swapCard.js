import initialState from '../initialState';
import actions from '../actions/swapCard';

function swapCardStore(state, changingProperty) {
    return {
        ...state,
        swapCard: {
            ...state.swapCard,
            ...changingProperty
        }
    };
};

function convertIntoMode(packed) {
    if (state.root.menuItem == 'exchange')
        return { exchange: packed };
    else
        return { liquidity: packed };
};

function fieldStore(state, field, changingProperty) {
    let mode = state.root.menuItem;
    return swapCardStore(state, {
        ...convertIntoMode({
            ...state.swapCard[mode],
            field0: {
                ...state.swapCard[mode][field],
                ...changingProperty
            }
        })
    });
};

function swapFields(state) {
    let mode = state.root.menuItem;
    let field0 = state.swapCard[mode].field0;
    return {
        ...state,
        swapCard: {
            ...state.swapCard,
            ...convertIntoMode({
                ...state.swapCard[mode],
                field0: state.swapCard[mode].field1,
                field1: field0
            })
        }
    };
};

export default function swapCardReducer(state = initialState, action) {
    switch (action.type) {
        case actions.SWAP_FIELDS:
            return swapFields(state);

        case actions.ASSIGN_WALLET_VALUE:
            return fieldStore(state, action.field, { walletValue: action.value });

        case actions.OPEN_TOKEN_LIST:
            return swapCardStore(state, { tokenListStatus: true });

        case actions.CLOSE_TOKEN_LIST:
            return swapCardStore(state, { tokenListStatus: false });

        case actions.CHANGE_LIQUIDITY_MODE:
            return swapCardStore(state, { liquidityMain: !state.swapCard.liquidityMain });

        case actions.OPEN_CONFIRM_CARD:
            return swapCardStore(state, { confirmCard: true });

        case actions.CLOSE_CONFIRM_CARD:
            return swapCardStore(state, { confirmCard: false });

        case actions.ASSIGN_COIN_VALUE:
            return fieldStore(state, action.field, { value: action.value });

        case actions.ASSIGN_TOKEN_VALUE:
            return fieldStore(state, action.field, { token: action.value });

        default:
            return state;
    }
};