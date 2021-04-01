import { bindActionCreators } from 'redux';

import rootCreator from './actionCreators/root';
import walletCreator from './actionCreators/wallet';
import swapCardCreator from './actionCreators/swapCard';
import tokenCardCreator from './actionCreators/tokenCard'

const components = {
    ROOT: 0x0,
    SWAP_CARD: 0x1,
    SWITCH: 0x2,
    TOKEN_CARD: 0x3
};

function mapStoreToProps(component) {
    switch (component) {
        case components.ROOT:
            return function (state) {
                return state.root;
            };
        case components.SWAP_CARD:
            return function (state) {
                return {
                    ...state.swapCard,
                    langData: state.root.langData.trade.swapCard,
                    menuItem: state.root.menuItem
                };
            };
        case components.SWITCH:
            return function (state) {
                return {
                    langData: state.root.langData.trade.switch,
                    menuItem: state.root.menuItem
                };
            };
        case components.TOKEN_CARD:
            return function (state) {
                return {
                    ...state.tokenCard,
                    langData: state.root.langData.trade.tokenCard,
                    menuItem: state.root.menuItem
                };
            };
        default:
            return undefined;
    }
};

function mapDispatchToProps(component) {
    switch (component) {
        case components.ROOT:
            return function (dispatch) {
                return bindActionCreators(rootCreator, dispatch);
            };
        case components.SWAP_CARD:
            return function (dispatch) {
                return bindActionCreators({
                    ...swapCardCreator,
                    getBalance : rootCreator.getBalance
                }, dispatch);
            };
        case components.SWITCH:
            return function (dispatch) {
                return {
                    changeMenuItem: bindActionCreators(rootCreator.changeMenuItem, dispatch)
                };
            };
        case components.TOKEN_CARD:
            return function (dispatch) {
                return bindActionCreators({
                    ...tokenCardCreator,
                    assignTokenValue : swapCardCreator.assignTokenValue,
                    closeTokenList : swapCardCreator.closeTokenList
                }, dispatch);
            };
        default:
            return undefined;
    }
};

export {
    mapStoreToProps,
    mapDispatchToProps,
    components
};