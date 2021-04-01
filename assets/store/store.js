import { createStore, combineReducers } from 'redux';

import rootReducer from './reducers/root';
import walletReducer from './reducers/wallet';
import swapCardReducer from './reducers/swapCard';
import tokenCardReducer from './reducers/tokenCard';

const totalReducer = combineReducers({
    root : rootReducer,
    wallet : walletReducer,
    swapCard : swapCardReducer,
    tokenCard : tokenCardReducer
});

const store = createStore(totalReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store;