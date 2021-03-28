import { createStore, combineReducers } from 'redux';

import rootReducer from './reducers/root';
import walletReducer from './reducers/wallet';
import swapCardReducer from './reducers/swapCard';

const totalReducer = combineReducers({
    root : rootReducer,
    wallet : walletReducer,
    swapCard : swapCardReducer
});

const store = createStore(totalReducer);

export default store;