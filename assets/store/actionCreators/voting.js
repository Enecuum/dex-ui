import actionPack from '../actions/actions';

const actions = actionPack.voting;

const actionCreators = {
    updateExpandedRow (payload) {
        return {
            type : actions.VOTING_UPDATE_EXPANDED_ROW,
            payload : payload.value 
        };
    },
    updateFarmsList (payload) {
        return {
            type : actions.VOTING_UPDATE_FARMS_LIST,
            payload : payload.value 
        };
    },    
    updateManagedFarmData (payload) {
        return {
            type : actions.VOTING_UPDATE_MANAGED_FARM_DATA,
            payload : payload.value 
        };
    },    
    updateSortType (payload) {
        return {
            type : actions.VOTING_UPDATE_SORT_TYPE,
            payload : payload.value 
        };
    },
    updShowStakeModal (payload) {
        return {
            type : actions.VOTING_UPDATE_SHOW_STAKE_MODAL,
            payload : payload.value 
        };
    },
    updateMainTokenAmount (payload) {
        return {
            type : actions.VOTING_UPDATE_MAIN_TOKEN_AMOUNT,
            payload : payload.value 
        };
    },
    updateMainTokenDecimals (payload) {
        return {
            type : actions.VOTING_UPDATE_MAIN_TOKEN_DECIMALS,
            payload : payload.value 
        };
    },
    updateMainTokenFee (payload) {
        return {
            type : actions.VOTING_UPDATE_MAIN_TOKEN_FEE,
            payload : payload.value 
        };
    },
    updatePricelist (payload) {
        return {
            type : actions.VOTING_UPDATE_PRICELIST,
            payload : payload.value 
        };
    },
    updateCurrentAction (payload) {
        return {
            type : actions.VOTING_UPDATE_CURRENT_ACTION,
            payload : payload.value 
        };
    },
    updateStakeData (payload) {
        return {
            type : actions.VOTING_UPDATE_STAKE_DATA,
            payload : payload 
        };
    }
};

export default actionCreators;