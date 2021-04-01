import { createStore, combineReducers } from 'redux';

import rootReducer from './reducers/root';
import walletReducer from './reducers/wallet';

// const totalReducer = combineReducers({
//     root : rootReducer,
//     wallet : walletReducer
// });

const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store;