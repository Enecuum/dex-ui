import actionPack from '../actions/actions';

const actions = actionPack.tokenCard;

const actionCreators = {
    assignTokenList (list) {
        return {
            type : actions.ASSIGN_TOKEN_LIST,
            value : list
        };
    },

    changeSort (sort) {
        return {
            type : actions.CHANGE_SORT_MODE,
            value : sort
        }
    }
};

export default actionCreators;