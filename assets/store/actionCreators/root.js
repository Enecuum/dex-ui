import actionPack from '../actions/actions';

const actions = actionPack.root;

const actionCreators = {
    toggleAside() {
        return {
            type : actions.TOGGLE_ASIDE
        };
    },
    
    changeNetwork(netName) {
        return {
            type : actions.CHANGE_NET,
            value : netName
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

    changePendingIndicatorVisibility() {
        return {
            type : actions.CHANGE_PENDING_STATE
        };
    }
};

export default actionCreators;