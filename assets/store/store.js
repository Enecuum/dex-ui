import { createStore, combineReducers } from 'redux';

import rootReducer from './reducers/root';
import swapCardReducer from './reducers/swapCard';
import tokenCardReducer from './reducers/tokenCard';
import asideReducer from './reducers/aside';
import indicatorPanelReducer from './reducers/indicatorPanel';
import etmReducer from './reducers/etm';
import farmsReducer from './reducers/farms';
import dropsReducer from './reducers/drops';
import spaceStationReducer from './reducers/spaceStation';
import nonNativeConnectionReducer from './reducers/nonNativeConnection';
import spaceBridgeReducer from './reducers/spaceBridge';

const totalReducer = combineReducers({
    root                : rootReducer,
    swapCard            : swapCardReducer,
    tokenCard           : tokenCardReducer,
    aside               : asideReducer,
    indicatorPanel      : indicatorPanelReducer,
    etm				    : etmReducer,
    farms               : farmsReducer,
    drops               : dropsReducer,
    spaceStation        : spaceStationReducer,
    nonNativeConnection : nonNativeConnectionReducer,
    spaceBridge         : spaceBridgeReducer
});

const enhancer = MODE === "development" ? window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() : undefined

const store = createStore(totalReducer, enhancer);

export default store;