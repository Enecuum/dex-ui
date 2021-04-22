import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.tokenCard;

export default function tokenCardReducer (state = initialState.tokenCard, action) {
    switch (action.type) {
        case actions.ASSIGN_TOKEN_LIST: 
            return {
                ...state,
                list : action.value
            };

        case actions.CHANGE_SORT_MODE:
            return {
                ...state,
                sort : action.value
            };

        default: 
            return state;
    }
};