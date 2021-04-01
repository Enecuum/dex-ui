import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.wallet;

function walletStore (state, changingProperty) {
    return {
        ...state,
        ...changingProperty
    };
};

export default function walletReducer (state = initialState.wallet, action) {
    switch (action.type) {
        case actions.SET_PUBKEY: 
            return walletStore(state, { pubkey : action.value });

        default: 
            return state;
    }
};