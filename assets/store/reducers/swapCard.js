import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.swapCard;

function swapCardStore(state, changingProperty) {
    return {
        ...state,
        ...changingProperty
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
            ...state[mode],
            field0: {
                ...state[mode][field],
                ...changingProperty
            }
        })
    });
};

function swapFields(state, mode) {
    let field0 = state[mode].field0;
    return swapCardStore(state, {
        ...convertIntoMode(mode, {
            ...state[mode],
            field0: state[mode].field1,
            field1: field0
        })
    });
};

export default function swapCardReducer(state = initialState.swapCard, action) {
    switch (action.type) {
        case actionPack.root.CHANGE_MENU_ITEM:
            return { ...state };

        case actions.SWAP_FIELDS:
            return swapFields(state, action.mode);

        case actions.ASSIGN_WALLET_VALUE:
            return fieldStore(state, action.mode, action.field, { walletValue: action.value });

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
            return fieldStore(state, action.mode, action.field, { value: action.value });

        case actions.ASSIGN_TOKEN_VALUE:
            return fieldStore(state, action.mode, action.field, { token: action.value });

        case actions.UPD_PAIRS:
            return swapCardStore(state, { pairs: action.value });

        default:
            return state;
    }
};