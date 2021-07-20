import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.farms;
function getKeyValueObj(action) {
    console.log(action)
    let field = action.payload.field;
    if (field == 'actionCost')
        return { actionCost: action.payload.value };
    else if (field == 'stakeValue')
        return { stakeValue: action.payload.value };
    else if (field == 'stakeTokenAmount')
        return { stakeTokenAmount: action.payload.value };
    else if (field == 'stakeTxStatus')
        return { stakeTxStatus: action.payload.value };
    else if (field == 'stakeValid')
        return { stakeValid: action.payload.value };
    else if (field == 'msgData')
        return { msgData: action.payload.value };                                             
    else 
        return { unknownProperty: action.payload.value };
}

function assignStakeDataProperty(state, fragment, action) {
    return {
        ...state[fragment],
        ...getKeyValueObj(action)
    }
}
export default function farmsReducer (state = initialState.farms, action) {
    switch (action.type) {
        case actions.UPDATE_STAKE_DATA:
            return {
                ...state,
                stakeData : assignStakeDataProperty(state, 'stakeData', action)
            };        
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