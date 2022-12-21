import actionPack from '../actions/actions';

const actions = actionPack.nonNativeConnection;

const actionCreators = {
    updateChain (chainAsString) {
        return {
            type : actions.UPDATE_CHAIN,
            value : chainAsString
        };
    },

    updateIsWalletConnect (valueAsBool) {
        return {
            type : actions.UPDATE_IS_WALLET_CONNECT,
            value : valueAsBool
        };
    },

    updateWalletConnectWallet (walletTitleAsString) {
        return {
            type : actions.UPDATE_WALLET_CONNECT_WALLET,
            value : walletTitleAsString
        };
    },

    updateIsWeb3ExtensionConnect (valueAsBool) {
        return {
            type : actions.UPDATE_IS_WEB3_EXTENSION_CONNECT,
            value : valueAsBool
        };
    },

    updateAccountId (accountIdAsString) {
        return {
            type : actions.UPDATE_ACCOUNT_ID,
            value : accountIdAsString
        };
    },
};

export default actionCreators;