import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.aside;

export default function asideReducer (state = initialState.aside, action) {
    switch (action.type) {
        case actions.UPD_EXCH_RATE:
            return {
                ...state,
                exchangeRate : action.value
            };
            
        default: 
            return state;
    }
};