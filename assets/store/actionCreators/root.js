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
    
    changeLanguage(langData) {
        return {
            type : actions.CHANGE_LANG,
            value : langData
        };
    },
    
    openConList() {
        return {
            type : actions.OPEN_CONNECTION_LIST
        };
    },
    
    closeConList() {
        return {
            type : actions.CLOSE_CONNECTION_LIST
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

    showPendingIndicator() {
        return {
            type : actions.SHOW_PENDING_STATE
        };
    },

    hidePendingIndicator() {
        return {
            type : actions.HIDE_PENDING_STATE
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
        }
    }
};

export default actionCreators;