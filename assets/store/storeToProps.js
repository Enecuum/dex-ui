import { bindActionCreators } from 'redux';

import rootCreator from './actionCreators/root';
import swapCardCreator from './actionCreators/swapCard';
import tokenCardCreator from './actionCreators/tokenCard';
import asideCreator from './actionCreators/aside';
import indicatorPanelCreator from './actionCreators/indicatorPanel';

const components = {
    ROOT                : 0x0,
    SWAP_CARD           : 0x1,
    SWITCH              : 0x2,
    TOKEN_CARD          : 0x3,
    ASIDE               : 0x4,
    CONNECTION_SERVICE  : 0x5,
    NAVBAR              : 0x6,
    CONNECT             : 0x7,
    TOAST               : 0x8,
    INDICATOR_PANEL     : 0x9,
    CONFIRM_SUPPLY      : 0xA,
    WAITING_CONFIRMATION: 0xB
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
                    connectionStatus : state.root.connectionStatus,
                    langData: state.root.langData.trade.swapCard,
                    menuItem: state.root.menuItem,
                    removeLiquidityView: state.swapCard.removeLiquidity.simpleView,
                    removeLiquidityAmount: state.swapCard.removeLiquidity.amount
                };
            };
        case components.SWITCH:
            return function (state) {
                return {
                    pubkey : state.root.pubkey,
                    langData: state.root.langData.trade.switch,
                    menuItem: state.root.menuItem
                };
            };
        case components.TOKEN_CARD:
            return function (state) {
                return {
                    ...state.tokenCard,
                    activeField : state.swapCard.activeField,
                    langData: state.root.langData.trade.tokenCard,
                    menuItem: state.root.menuItem
                };
            };
        case components.ASIDE:
            return function (state) {
                return {
                    ...state.aside,
                    menuItem: state.root.menuItem,
                    langData: state.root.langData.navbars.left,
                    navOpened: state.root.navOpened,
                    siteLocales : state.root.siteLocales,
                    activeLocale : state.root.activeLocale,
                    langTitles : state.root.langTitles
                };
            };
        case components.CONNECTION_SERVICE:
            return function (state) {
                return {
                    pubkey : state.root.pubkey,
                    connectionStatus : state.root.connectionStatus,
                    connecionListOpened : state.root.connecionListOpened,
                    langData : state.root.langData.navbars.top.connectionCard
                };
            };
        case components.NAVBAR:
            return function (state) {
                return {
                    pending : state.root.pending,
                    navOpened: state.root.navOpened,
                    connectionStatus : state.root.connectionStatus
                };
            };  
        case components.CONNECT:
            return function (state) {
                return {
                    langData : state.root.langData.navbars.top,

                };
            };  
        case components.TOAST:
            return function (state) {
                return {
                    info : state.root.langData.info  
                };
            }
        case components.INDICATOR_PANEL:
            return function (state) {
                return {
                    ...state.indicatorPanel,
                    pubkey : state.root.pubkey,
                    pendingIndicator : state.root.pendingIndicator
                };
            };
        case components.CONFIRM_SUPPLY:
            return function (state) {
                return {
                    langData : state.root.langData.trade.confirmCard,
                    confirmCardOpened : state.swapCard.confirmCardOpened,
                    exchange : state.swapCard.exchange,
                    liquidity : state.swapCard.liquidity,
                    menuItem : state.root.menuItem,
                    pairs : state.swapCard.pairs
                };
            };
        case components.WAITING_CONFIRMATION:
            return function (state) {
                return {
                    langData : state.root.langData,
                    visibility : state.swapCard.waitingConfirmation.visibility,
                    txStateType : state.swapCard.waitingConfirmation.txStateType
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
        case components.ASIDE:
            return function (dispatch) {
                return bindActionCreators({
                    ...asideCreator,
                    changeMenuItem  : rootCreator.changeMenuItem,
                    toggleAside     : rootCreator.toggleAside,
                    updActiveLocale : rootCreator.updActiveLocale,
                    changeLanguage  : rootCreator.changeLanguage
                }, dispatch);
            };
        case components.CONNECTION_SERVICE:
            return function (dispatch) {
                return bindActionCreators({
                    closeConList : rootCreator.closeConList,
                    setConStatus : rootCreator.setConStatus,
                    assignPubkey : rootCreator.assignPubkey
                }, dispatch);
            };
        case components.NAVBAR:
            return function (dispatch) {
                return bindActionCreators({
                    toggleAside : rootCreator.toggleAside
                }, dispatch);
            };
        case components.CONNECT:
            return function (dispatch) {
                return bindActionCreators({
                    openConList : rootCreator.openConList
                }, dispatch);
            };
        case components.INDICATOR_PANEL:
            return function (dispatch) {
                return bindActionCreators({
                    ...indicatorPanelCreator,
                    assignPubkey : rootCreator.assignPubkey
                }, dispatch);
            };
        case components.CONFIRM_SUPPLY:
            return function (dispatch) {
                return bindActionCreators({
                    closeConfirmCard : swapCardCreator.closeConfirmCard,
                    openWaitingConfirmation : swapCardCreator.openWaitingConfirmation,
                    changeWaitingStateType : swapCardCreator.changeWaitingStateType,
                    changePendingIndicatorVisibility : rootCreator.changePendingIndicatorVisibility
                }, dispatch); 
            };
        case components.WAITING_CONFIRMATION:
            return function (dispatch) {
                return bindActionCreators({
                    closeWaitingConfirmation : swapCardCreator.closeWaitingConfirmation
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