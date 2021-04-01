import actionPack from '../actions/actions';

const actions = actionPack.swapCard;

const actionCreators = {
    swapFields (mode) {
        return {
            type : actions.SWAP_FIELDS,
            mode : mode
        };
    },

    assignWalletValue (mode, field, walletValue) {
        let fieldName = (field == 0) ? 'field0' : 'field1';
        return {
            type : actions.ASSIGN_WALLET_VALUE,
            field : fieldName,
            value : walletValue,
            mode : mode
        };
    },

    assignCoinValue (mode, field, value) {
        let fieldName = (field == 0) ? 'field0' : 'field1';
        return {
            type : actions.ASSIGN_COIN_VALUE,
            field : fieldName,
            value : value,
            mode : mode
        };
    },

    assignTokenValue (mode, field, value) {
        let fieldName = (field == 0) ? 'field0' : 'field1';
        return {
            type : actions.ASSIGN_TOKEN_VALUE,
            field : fieldName,
            value : value,
            mode : mode
        };
    },

    openTokenList () {
        return {
            type : actions.OPEN_TOKEN_LIST
        };
    },

    closeTokenList () {
        return {
            type : actions.CLOSE_TOKEN_LIST
        };
    },

    changeLiquidityMode () {
        return {
            type : actions.CHANGE_LIQUIDITY_MODE
        };
    },

    openConfirmCard () {
        return {
            type : actions.OPEN_CONFIRM_CARD
        };
    },

    closeConfirmCard () {
        return {
            type : actions.CLOSE_CONFIRM_CARD
        };
    },
    
    updPairs (value) {
        return {
            type : actions.UPD_PAIRS,
            value : value
        };
    }
};

export default actionCreators;