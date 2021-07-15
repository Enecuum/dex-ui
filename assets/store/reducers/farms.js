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
        case actions.UPDATE_MANAGED_FARM_DATA:
            return {
                ...state,
                managedFarmData : action.payload
            };            
        case actions.UPDATE_SORT_TYPE:
            return {
                ...state,
                sortType : action.payload
            };
        case actions.UPDATE_SHOW_STAKE_MODAL:
            return {
                ...state,
                showStakeModal : action.payload
            };
        case actions.UPDATE_MAIN_TOKEN_AMOUNT:
            return {
                ...state,
                mainTokenAmount : action.payload
            };
        case actions.UPDATE_MAIN_TOKEN_DECIMALS:
            return {
                ...state,
                mainTokenDecimals : action.payload
            };
        case actions.UPDATE_MAIN_TOKEN_FEE:
            return {
                ...state,
                mainTokenFee : action.payload
            };
        case actions.UPDATE_PRICELIST:
            return {
                ...state,
                pricelist : action.payload
            };
        case actions.UPDATE_CURRENT_ACTION:
            return {
                ...state,
                currentAction : action.payload
            };    
        default: 
            return state;
    }
};