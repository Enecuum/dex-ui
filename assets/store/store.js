import { createStore, combineReducers } from 'redux';

import rootReducer from './reducers/root';
import swapCardReducer from './reducers/swapCard';
import tokenCardReducer from './reducers/tokenCard';
import asideReducer from './reducers/aside';
import indicatorPanelReducer from './reducers/indicatorPanel';

const totalReducer = combineReducers({
    root : rootReducer,
    swapCard : swapCardReducer,
    tokenCard : tokenCardReducer,
    aside : asideReducer,
    indicatorPanel : indicatorPanelReducer
});

const store = createStore(totalReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store;