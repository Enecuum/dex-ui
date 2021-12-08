import actionPack from '../actions/actions';

const actions = actionPack.spaceStation;

const actionCreators = {
    updateExpandedRow (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_EXPANDED_ROW,
            payload : payload.value 
        };
    },
    updateFarmsList (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_FARMS_LIST,
            payload : payload.value 
        };
    },
    updatePoolsList (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_POOLS_LIST,
            payload : payload.value 
        };
    },
    updateManagedFarmData (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_MANAGED_FARM_DATA,
            payload : payload.value 
        };
    },    
    updateSortType (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_SORT_TYPE,
            payload : payload.value 
        };
    },
    updShowStakeModal (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_SHOW_STAKE_MODAL,
            payload : payload.value 
        };
    },
    updateMainTokenAmount (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_MAIN_TOKEN_AMOUNT,
            payload : payload.value 
        };
    },
    updateMainTokenDecimals (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_MAIN_TOKEN_DECIMALS,
            payload : payload.value 
        };
    },
    updateMainTokenFee (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_MAIN_TOKEN_FEE,
            payload : payload.value 
        };
    },
    updatePricelist (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_PRICELIST,
            payload : payload.value 
        };
    },
    updateCurrentAction (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_CURRENT_ACTION,
            payload : payload.value 
        };
    },
    updateStakeData (payload) {
        return {
            type : actions.SPACE_STATION_UPDATE_STAKE_DATA,
            payload : payload 
        };
    }
};

export default actionCreators;