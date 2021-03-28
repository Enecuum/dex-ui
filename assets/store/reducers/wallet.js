import initialState from '../initialState';
import actions from '../actions/wallet';

function walletStore (state, changingProperty) {
    return {
        ...wallet,
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