import initialState from '../initialState';
import actions from '../actions/root';

function rootStore (state, changingProperty) {
    return {
        ...state,
        root : {
            ...state.root,
            ...changingProperty
        }
    };
};

export default function rootReducer (state = initialState, action) {
    switch (action.type) {
        case actions.OPEN_ASIDE: 
            return rootStore(state, {
                navOpened : true,
                swapCardLeft : '45%'
            });

        case actions.CLOSE_ASIDE:
            return rootStore(state, { 
                navOpened : false,
                swapCardLeft : '41%'
            });

        case actions.CHANGE_NET:
            return rootStore(state, { net : action.value });

        case actions.CHANGE_LANG:
            return rootStore(state, { langData : action.value });

        case actions.OPEN_CONNECTION_LIST:
            return rootStore(state, { connecionListOpened : true });

        case actions.CLOSE_CONNECTION_LIST:
            return rootStore(state, { connecionListOpened : false });

        case actions.CHANGE_CONN_STATUS:
            return rootStore(state, { connectionStatus : action.value });

        case actions.CHANGE_MENU_ITEM:
            return rootStore(state, { menuItem : action.value });

        default : 
            return state;
    }
};