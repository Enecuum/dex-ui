import actionPack from '../actions/actions';

const actions = actionPack.spaceBridge;

const actionCreators = {
    update_src_token_hash (payload) {
        return {
            type : actions.UPDATE_SRC_TOKEN_HASH,
            value : payload 
        };
    },
    update_src_token_allowance (payload) {        
        return {
            type : actions.UPDATE_SRC_TOKEN_ALLOWANCE,
            value : payload 
        };
    },
    update_src_token_balance (payload) {
        return {
            type : actions.UPDATE_SRC_TOKEN_BALANCE,
            value : payload 
        };
    },
    update_src_token_decimals (payload) {
        return {
            type : actions.UPDATE_SRC_TOKEN_DECIMALS,
            value : payload 
        };
    },
    update_src_token_ticker (payload) {
        return {
            type : actions.UPDATE_SRC_TOKEN_TICKER,
            value : payload 
        };
    },
    update_src_token_amount_to_send (payload) {
        return {
            type : actions.UPDATE_SRC_TOKEN_AMOUNT_TO_SEND,
            value : payload 
        };
    },
    update_current_bridge_tx (payload) {
        return {
            type : actions.UPDATE_CURRENT_BRIDGE_TX,
            value : payload 
        };
    },
        
};

export default actionCreators;