import actionPack from '../actions/actions';

const actions = actionPack.aside;

const actionCreators = {
    updExchangeRate (value) {
        return {
            type : actions.UPD_EXCH_RATE,
            value : value
        };
    }
};

export default actionCreators;