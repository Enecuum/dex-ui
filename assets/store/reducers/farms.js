import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.farms;

export default function farmsReducer (state = initialState.farms, action) {
    switch (action.type) {
        case actions.UPDATE_EXPANDED_ROW:
            return {
                ...state,
                expandedRow : action.payload
            };
        case actions.UPDATE_SORT_TYPE:
            return {
                ...state,
                sortType : action.payload
            };            
            
        default: 
            return state;
    }
};