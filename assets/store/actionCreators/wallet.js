import actionPack from '../actions/actions';

const actions = actionPack.wallet;

const actionCreators = {
    setPubkey (pubkey) {
        return {
            type : actions.SET_PUBKEY,
            value : pubkey
        };
    }
};

export default actionCreators;