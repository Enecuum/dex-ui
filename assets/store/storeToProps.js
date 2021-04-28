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
    WAITING_CONFIRMATION: 0xB,
    LIQUIDITY_TOKEN_ZONE: 0xC
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
                    navOpened: state.root.navOpened,
                    connectionStatus        : state.root.connectionStatus,
                    langData                : state.root.langData.trade.swapCard,
                    menuItem                : state.root.menuItem,
                    removeLiquiditySimpleView     : state.swapCard.removeLiquidity.simpleView,
                    removeLiquidityAmount   : state.swapCard.removeLiquidity.amount,
                    pairs                   : state.root.pairs,
                    balances                : state.root.balances
                };
            };
        case components.SWITCH:
            return function (state) {
                return {
                    pubkey      : state.root.pubkey,
                    menuItem    : state.root.menuItem
                };
            };
        case components.TOKEN_CARD:
            return function (state) {
                return {
                    ...state.tokenCard,
                    activeField : state.swapCard.activeField,
                    menuItem    : state.root.menuItem,
                    tokens      : state.root.tokens
                };
            };
        case components.ASIDE:
            return function (state) {
                return {
                    ...state.aside,
                    connectionStatus : state.root.connectionStatus,
                    menuItem: state.root.menuItem,
                    navOpened: state.root.navOpened,
                    siteLocales : state.root.siteLocales,
                    langTitles : state.root.langTitles
                };
            };
        case components.CONNECTION_SERVICE:
            return function (state) {
                return {
                    pubkey              : state.root.pubkey,
                    connectionStatus    : state.root.connectionStatus,
                    connecionListOpened : state.root.connecionListOpened
                };
            };
        case components.NAVBAR:
            return function (state) {
                return {
                    pending             : state.root.pending,
                    navOpened           : state.root.navOpened,
                    connectionStatus    : state.root.connectionStatus
                };
            };  
        // case components.CONNECT:
        //     return function (state) {
        //         return {
        //             langData : state.root.langData.navbars.top,

        //         };
        //     };  
        case components.TOAST: //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            return function (state) {
                return {
                    info : state.root.langData.info  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                };
            }
        case components.INDICATOR_PANEL:
            return function (state) {
                return {
                    ...state.indicatorPanel,
                    pubkey              : state.root.pubkey,
                    pendingIndicator    : state.root.pendingIndicator,
                    net                 : state.root.net,
                    balances            : state.root.balances
                };
            };
        case components.CONFIRM_SUPPLY:
            return function (state) {
                return {
                    confirmCardOpened : state.swapCard.confirmCardOpened,
                    exchange    : state.swapCard.exchange,
                    liquidity   : state.swapCard.liquidity,
                    menuItem    : state.root.menuItem,
                    pubkey      : state.root.pubkey,
                    pairs       : state.root.pairs
                };
            };
        case components.WAITING_CONFIRMATION:
            return function (state) {
                return {
                    ...state.swapCard.waitingConfirmation,
                    createPool  : state.swapCard.createPool,
                    exchange    : state.swapCard.exchange,
                    liquidity   : state.swapCard.liquidity,
                    menuItem    : state.root.menuItem,
                    langData    : state.root.langData
                };
            };
        case components.LIQUIDITY_TOKEN_ZONE:
            return function (state) {
                return {
                    pubkey      : state.root.pubkey,
                    ltList      : state.swapCard.ltList,
                    menuItem    : state.root.menuItem,
                    tList       : state.root.tokens,
                    pairs       : state.root.pairs,
                    tokens      : state.root.tokens,
                    balances    : state.root.balances
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
                return bindActionCreators({
                    ...rootCreator
                }, dispatch);
            };
        case components.SWAP_CARD:
            return function (dispatch) {
                return bindActionCreators({
                    ...swapCardCreator
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
                    assignTokenValue    : swapCardCreator.assignTokenValue,
                    closeTokenList      : swapCardCreator.closeTokenList
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
                    toggleAside     : rootCreator.toggleAside
                }, dispatch);
            };
        case components.CONNECT:
            return function (dispatch) {
                return bindActionCreators({
                    openConList     : rootCreator.openConList
                }, dispatch);
            };
        case components.INDICATOR_PANEL:
            return function (dispatch) {
                return bindActionCreators({
                    ...indicatorPanelCreator,
                    assignPubkey    : rootCreator.assignPubkey,
                    changeNetwork   : rootCreator.changeNetwork
                }, dispatch);
            };
        case components.CONFIRM_SUPPLY:
            return function (dispatch) {
                return bindActionCreators({
                    closeConfirmCard        : swapCardCreator.closeConfirmCard,
                    openWaitingConfirmation : swapCardCreator.openWaitingConfirmation,
                    changeWaitingStateType  : swapCardCreator.changeWaitingStateType,
                    showPendingIndicator    : rootCreator.showPendingIndicator,
                    hidePendingIndicator    : rootCreator.hidePendingIndicator
                }, dispatch); 
            };
        case components.WAITING_CONFIRMATION:
            return function (dispatch) {
                return bindActionCreators({
                    closeWaitingConfirmation    : swapCardCreator.closeWaitingConfirmation,
                    changeWaitingStateType      : swapCardCreator.changeWaitingStateType,
                    changeCreatePoolState       : swapCardCreator.changeCreatePoolState
                }, dispatch);
            };
        case components.LIQUIDITY_TOKEN_ZONE:
            return function (dispatch) {
                return bindActionCreators({
                    updltList                       : swapCardCreator.updltList,
                    changeLiquidityMode             : swapCardCreator.changeLiquidityMode,
                    assignTokenValue                : swapCardCreator.assignTokenValue,
                    changeRemoveLiquidityVisibility : swapCardCreator.changeRemoveLiquidityVisibility
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