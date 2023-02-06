import actionPack from '../actions/actions';

const actions = actionPack.nonNativeConnection;

const actionCreators = {
    updateWalletConnectIsConnected (valueAsBool) {
        return {
            type : actions.UPDATE_WALLET_CONNECT_IS_CONNECTED,
            value : valueAsBool
        };
    },
    updateWalletConnect (walletConnectObj) {
        return {
            type : actions.UPDATE_WALLET_CONNECT,
            value : walletConnectObj
        };
    },
    updateWalletConnectChain (chainIndexAsString) {
        return {
            type : actions.UPDATE_WALLET_CONNECT_CHAIN,
            value : chainIndexAsString
        };
    },
    updateWalletConnectWalletTitle (walletTitleAsString) {
        return {
            type : actions.UPDATE_WALLET_CONNECT_WALLET_TITLE,
            value : walletTitleAsString
        };
    },
    updateWalletConnectAccountId (accountIdAsString) {
        return {
            type : actions.UPDATE_WALLET_CONNECT_ACCOUNT_ID,
            value : accountIdAsString
        };
    },


    updateWeb3ExtensionIsConnected (valueAsBool) {
        return {
            type : actions.UPDATE_WEB3_EXTENSION_IS_CONNECTED,
            value : valueAsBool
        };
    },
    updateWeb3Extension (web3ExtensionProviderObj) {
        return {
            type : actions.UPDATE_WEB3_EXTENSION,
            value : web3ExtensionProviderObj
        };
    },
    updateWeb3ExtensionChain (chainIndexAsString) {
        return {
            type : actions.UPDATE_WEB3_EXTENSION_CHAIN,
            value : chainIndexAsString
        };
    },
    updateWeb3ExtensionWalletTitle (walletTitleAsString) {
        return {
            type : actions.UPDATE_WEB3_EXTENSION_WALLET_TITLE,
            value : walletTitleAsString
        };
    },
    updateWeb3ExtensionAccountId (accountIdAsString) {
        return {
            type : actions.UPDATE_WEB3_EXTENSION_ACCOUNT_ID,
            value : accountIdAsString
        };
    }
};

export default actionCreators;