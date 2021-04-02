import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.root;

function rootStore (state, changingProperty) {
    return {
        ...state,
        ...changingProperty
    };
};

export default function rootReducer (state = initialState.root, action) {
    switch (action.type) {
        case actions.TOGGLE_ASIDE: 
            let leftOffset = (state.navOpened) ? '41%' : '45%';
            return rootStore(state, {
                navOpened : !state.navOpened,
                swapCardLeft : leftOffset
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

        case actions.ASSIGN_PUBKEY:
            return rootStore(state, { pubkey : action.value });

        case actions.UPD_ACTIVE_LOCALE:
            return rootStore(state, { activeLocale : action.value });

        default:
            return state;
    }
};