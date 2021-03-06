import actionPack from '../actions/actions';

const actions = actionPack.root;

const actionCreators = {
    toggleAside() {
        return {
            type : actions.TOGGLE_ASIDE
        };
    },
    
    changeNetwork(netName, netUrl) {
        return {
            type : actions.CHANGE_NET,
            value : {
                name : netName,
                url : netUrl
            }
        };
    },

    updateNetworkInfo(networkInfo) {
        return {
            type : actions.UPD_NETWORK_INFO,
            value : networkInfo
        };
    },
    
    changeLanguage(langData) {
        return {
            type : actions.CHANGE_LANG,
            value : langData
        };
    },
    
    setConStatus(connected) {
        return {
            type : actions.CHANGE_CONN_STATUS,
            value : connected
        };
    },
    
    changeMenuItem(item) {
        return {
            type : actions.CHANGE_MENU_ITEM,
            value : item
        };
    },

    assignPubkey(key) {
        return {
            type : actions.ASSIGN_PUBKEY,
            value : key
        };
    },

    updActiveLocale(locale) {
        return {
            type : actions.UPD_ACTIVE_LOCALE,
            value : locale
        };
    },

    updBalances (balances) {
        return {
            type : actions.UPD_BALANCES,
            value : balances
        };
    },

    updPairs (value) {
        return {
            type : actions.UPD_PAIRS,
            value : value
        };
    },

    assignAllTokens (list) {
        return {
            type : actions.ASSIGN_ALL_TOKENS,
            value : list
        };
    },

    updCurrentTxHash (hash) {
        return {
            type : actions.UPD_CURRENT_TX_HASH,
            value : hash
        }
    },

    updRecentTxs (txs) {
        return {
            type : actions.UPD_RECENT_TXS,
            value : txs
        }
    },

    updMainTokenData (hash, fee) {
        return {
            type : actions.UPD_MAIN_TOKEN_DATA,
            hash : hash,
            fee  : fee
        }
    },

    updNativeToken (data) {
        return {
            type : actions.UPD_NATIVE_TOKEN_DATA,
            value : data
        }
    }
};

export default actionCreators;