import actionPack from '../actions/actions';

const actions = actionPack.farms;

const actionCreators = {
    updateExpandedRow (payload) {
        return {
            type : actions.UPDATE_EXPANDED_ROW,
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
    }
};

export default actionCreators;