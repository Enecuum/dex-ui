import initialState from '../initialState';
import actions from '../actions/wallet';

function walletStore (state, changingProperty) {
    return {
        ...state,
        wallet : {
            ...state.wallet,
            ...changingProperty
        }
    };
};

export default function walletReducer (state = initialState, action) {
    switch (action.type) {
        case actions.SET_PUBKEY: 
            return walletStore(state, { pubkey : action.value });

        default : 
            return state;
    }
};