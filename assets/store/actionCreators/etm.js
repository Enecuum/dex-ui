import actionPack from '../actions/actions';

const actions = actionPack.etm;

const actionCreators = {
    updateTokenProperty (payload) {
        return {
            type : actions.UPDATE_TOKEN_PROPERTY,
            payload : payload 
        };
    },
    updateTokenBigIntData (payload) {
        return {
            type : actions.UPDATE_TOKEN_BIGINT_DATA,
            payload : payload.value 
        };
    },
    updateMsgData (payload) {
        return {
            type : actions.UPDATE_MSG_DATA,
            payload : payload.value 
        };
    },
    updateDataValid (payload) {
        return {
            type : actions.UPDATE_DATA_VALID,
            payload : payload.value 
        };
    },
    updatePossibleToIssueToken (payload) {
        return {
            type : actions.UPDATE_POSSIBLE_TO_ISSUE_TOKEN,
            payload : payload.value
        };
    },
    updateIssueTokenTxAmount (payload) {
        return {
            type : actions.UPDATE_ISSUE_TOKEN_TX_AMOUNT,
            payload : payload.value
        };
    },
    updateMainTokenTicker (payload) {
        return {
            type : actions.UPDATE_MAIN_TOKEN_TICKER,
            payload : payload.value
        };
    },
    updateMainTokenDecimals (payload) {
        return {
            type : actions.UPDATE_MAIN_TOKEN_DECIMALS,
            payload : payload.value
        };
    },    
    updateShowForm (payload) {
        return {
            type : actions.UPDATE_SHOW_FORM,
            payload : payload.value
        };
    },
    openWaitingConfirmation () {
        return {
            type : actions.OPEN_WAITING_CONFIRMATION
        };
    },    
    closeWaitingConfirmation () {
        return {
            type : actions.CLOSE_WAITING_CONFIRMATION
        };
    },
    changeWaitingStateType (stateType) {
        return {
            type : actions.CHANGE_WAITING_STATE_TYPE,
            value : stateType
        };
    },
    resetStore() { 
        return {
            type : actions.RESET_STORE
        }        
    }    
};

export default actionCreators;