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
    else if (mode == 'liquidity')
        return { liquidity: packed };
    else 
        return { removeLiquidity: packed };
};

function convertIntoField(field, packed) {
    if (field == 'field0')
        return { field0: packed };
    else if (field == 'field1')
        return { field1: packed };
    else
        return { ltfield: packed };
};

function fieldStore(state, mode, field, changingProperty) {
    return swapCardStore(state, {
        ...convertIntoMode(mode, {
            ...state[mode],
            ...convertIntoField(field, {
                ...state[mode][field],
                ...changingProperty
            })
        })
    });
};

function swapFields(state, mode) {
    let field0 = {...state[mode].field1}
    field0.id = state[mode].field0.id
    let field1 = {...state[mode].field0}
    field1.id = state[mode].field1.id
    return swapCardStore(state, {
        ...convertIntoMode(mode, {
            ...state[mode],
            field0: field0,
            field1: field1
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
            return fieldStore(state, action.mode, action.field, { balance: action.value });

        case actions.OPEN_TOKEN_LIST:
            return swapCardStore(state, { tokenListStatus: true });

        case actions.CLOSE_TOKEN_LIST:
            return swapCardStore(state, { tokenListStatus: false });

        case actions.CHANGE_LIQUIDITY_MODE:
            return swapCardStore(state, { liquidityMain: !state.liquidityMain });

        case actions.OPEN_CONFIRM_CARD:
            return swapCardStore(state, { confirmCardOpened: true });

        case actions.CLOSE_CONFIRM_CARD:
            return swapCardStore(state, { confirmCardOpened: false });

        case actions.ASSIGN_COIN_VALUE:
            return fieldStore(state, action.mode, action.field, { value: action.value });

        case actions.ASSIGN_TOKEN_VALUE:
            return fieldStore(state, action.mode, action.field, { token: action.value });

        case actions.UPD_ACTIVE_FIELD:
            return swapCardStore(state, { activeField: action.value });

        case actions.OPEN_WAITING_CONFIRMATION:
            return swapCardStore(state, {
                waitingConfirmation : {
                    ...state.waitingConfirmation,
                    visibility : true
                }
            });

        case actions.CLOSE_WAITING_CONFIRMATION:
            return swapCardStore(state, {
                waitingConfirmation : {
                    ...state.waitingConfirmation,
                    visibility : false
                }
            });

        case actions.CHANGE_WAITING_STATE_TYPE:
            return swapCardStore(state, {
                waitingConfirmation : {
                    ...state.waitingConfirmation,
                    txStateType : action.value
                }
            });

        case actions.TOGGLE_REMOVE_LIQUIDITY_VIEW:
            return swapCardStore(state, {
                removeLiquidity : {
                    ...state.removeLiquidity,
                    simpleView : !state.removeLiquidity.simpleView
                }
            });              
            
        case actions.CHANGE_CREATE_POOL_STATE:
            return swapCardStore(state, { createPool : action.value });

        case actions.CHANGE_REMOVE_LIQUDITY_VISIBILITY:
            return swapCardStore(state, {liquidityRemove : !state.liquidityRemove});

        default:
            return state;
    }
};