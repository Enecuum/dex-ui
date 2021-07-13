import actionPack from '../actions/actions';

const actions = actionPack.farms;

const actionCreators = {
    updateExpandedRow (payload) {
        return {
            type : actions.UPDATE_EXPANDED_ROW,
            payload : payload.value 
        };
    },
    updateManagedFarmData (payload) {
        return {
            type : actions.UPDATE_MANAGED_FARM_DATA,
            payload : payload.value 
        };
    },    
    updateSortType (payload) {
        return {
            type : actions.UPDATE_SORT_TYPE,
            payload : payload.value 
        };
    },
    updShowStakeModal (payload) {
        return {
            type : actions.UPDATE_SHOW_STAKE_MODAL,
            payload : payload.value 
        };
    },
    updateMainTokenAmount (payload) {
        return {
            type : actions.UPDATE_MAIN_TOKEN_AMOUNT,
            payload : payload.value 
        };
    },
    updateMainTokenDecimals (payload) {
        return {
            type : actions.UPDATE_MAIN_TOKEN_DECIMALS,
            payload : payload.value 
        };
    },
    updateMainTokenFee (payload) {
        return {
            type : actions.UPDATE_MAIN_TOKEN_FEE,
            payload : payload.value 
        };
    },
    updatePricelist (payload) {
        return {
            type : actions.UPDATE_PRICELIST,
            payload : payload.value 
        };
    }
};

export default actionCreators;