import actionPack from '../actions/actions';

const actions = actionPack.etm;

const actionCreators = {
    updateExpandedRow (payload) {
        return {
            type : actions.UPDATE_EXPANDED_ROW,
            payload : payload 
        };
    },
    updateSortType (payload) {
        return {
            type : actions.UPDATE_SORT_TYPE,
            payload : payload 
        };
    }      
};

export default actionCreators;