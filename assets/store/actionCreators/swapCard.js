import actions from '../actions/swapCard';

const actionCreators = {
    swapFields () {
        return {
            type : actions.SWAP_FIELDS
        };
    },

    assignWalletValue (field, walletValue) {
        let fieldName = (field == 0) ? 'field0' : 'field1';
        return {
            type : actions.ASSIGN_WALLET_VALUE,
            field : fieldName,
            value : walletValue
        };
    },

    assignCoinValue (field, value) {
        let fieldName = (field == 0) ? 'field0' : 'field1';
        return {
            type : actions.ASSIGN_COIN_VALUE,
            field : fieldName,
            value : value
        };
    },

    assignTokenValue (field, value) {
        let fieldName = (field == 0) ? 'field0' : 'field1';
        return {
            type : actions.ASSIGN_TOKEN_VALUE,
            field : fieldName,
            value : value
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
    }
};

export default actionCreators;