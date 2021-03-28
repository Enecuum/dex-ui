import actions from '../actions/root';

const actionCreators = {
    openAside() {
        return {
            type : actions.OPEN_ASIDE
        };
    },
    
    closeAside() {
        return {
            type : actions.CLOSE_ASIDE 
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
    }
};

export default actionCreators;