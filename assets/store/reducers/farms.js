import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.farms;

export default function farmsReducer (state = initialState.farms, action) {
    switch (action.type) {
        case actions.UPDATE_EXPANDED_ROW:
            return {
                ...state,
                extendedRow : action.value
            };
        case actions.UPDATE_SORT_TYPE:
            return {
                ...state,
                sortType : action.value
            };            
            
        default: 
            return state;
    }
};