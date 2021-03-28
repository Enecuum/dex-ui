import actions from '../actions/wallet';

const actionCreators = {
    setPubkey (pubkey) {
        return {
            type : actions.SET_PUBKEY,
            value : pubkey
        };
    }
};

export default actionCreators;