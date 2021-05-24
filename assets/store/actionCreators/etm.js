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
        console.log('updateDataValid', payload)
        return {
            type : actions.UPDATE_DATA_VALID,
            payload : payload.value 
        };
    },
    updatePossibleToIssueToken (payload) {
        console.log('updatePossibleToIssueToken', payload)
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
    updateShowForm (payload) {
        return {
            type : actions.UPDATE_SHOW_FORM,
            payload : payload.value
        };
    },    

    // assignBalanceObj (mode, field, balanceObj) {
    //     return {
    //         type : actions.ASSIGN_WALLET_VALUE,
    //         field : field,
    //         value : balanceObj,
    //         mode : mode
    //     };
    // },

    // assignCoinValue (mode, field, value) {
    //     return {
    //         type : actions.ASSIGN_COIN_VALUE,
    //         field : field,
    //         value : value,
    //         mode : mode
    //     };
    // },

    // assignTokenValue (mode, field, tokenObj) {
    //     return {
    //         type : actions.ASSIGN_TOKEN_VALUE,
    //         field : field,
    //         value : tokenObj,
    //         mode : mode
    //     };
    // },

    // openTokenList () {
    //     return {
    //         type : actions.OPEN_TOKEN_LIST
    //     };
    // },

    // closeTokenList () {
    //     return {
    //         type : actions.CLOSE_TOKEN_LIST
    //     };
    // },

    // changeLiquidityMode () {
    //     return {
    //         type : actions.CHANGE_LIQUIDITY_MODE
    //     };
    // },

    // openConfirmCard () {
    //     return {
    //         type : actions.OPEN_CONFIRM_CARD
    //     };
    // },

    // closeConfirmCard () {
    //     return {
    //         type : actions.CLOSE_CONFIRM_CARD
    //     };
    // },

    // updActiveField (value) {
    //     return {
    //         type : actions.UPD_ACTIVE_FIELD,
    //         value : value
    //     };
    // },

    // openWaitingConfirmation () {
    //     return {
    //         type : actions.OPEN_WAITING_CONFIRMATION
    //     };
    // },

    // closeWaitingConfirmation () {
    //     return {
    //         type : actions.CLOSE_WAITING_CONFIRMATION
    //     };
    // },

    // changeWaitingStateType (stateType) {
    //     return {
    //         type : actions.CHANGE_WAITING_STATE_TYPE,
    //         value : stateType
    //     };
    // },
    
    // toggleRemoveLiquidityView () {
    //     return {
    //         type : actions.TOGGLE_REMOVE_LIQUIDITY_VIEW
    //     };
    // },

    // changeCreatePoolState (booleanVar) {
    //     return {
    //         type : actions.CHANGE_CREATE_POOL_STATE,
    //         value : booleanVar
    //     }
    // },

    // changeRemoveLiquidityVisibility () {
    //     return {
    //         type : actions.CHANGE_REMOVE_LIQUDITY_VISIBILITY
    //     };
    // }
};

export default actionCreators;