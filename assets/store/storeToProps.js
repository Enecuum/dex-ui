import { bindActionCreators } from 'redux'

import rootCreator from './actionCreators/root'
import swapCardCreator from './actionCreators/swapCard'
import tokenCardCreator from './actionCreators/tokenCard'
import asideCreator from './actionCreators/aside'
import indicatorPanelCreator from './actionCreators/indicatorPanel'
import etmCreator from './actionCreators/etm'
import farmsCreator from './actionCreators/farms'
import dropsCreator from './actionCreators/drops'
import votingCreator from './actionCreators/voting'
import spaceStationCreator from './actionCreators/spaceStation'
import nonNativeConnectionCreator from './actionCreators/nonNativeConnection'
import spaceBridgeCreator from './actionCreators/spaceBridge'

const components = {
    ROOT                             : 0x0,
    SWAP_CARD                        : 0x1,
    SWITCH                           : 0x2,
    TOKEN_CARD                       : 0x3,
    ASIDE                            : 0x4,
    WALLET_LIST                      : 0x5,
    NAVBAR                           : 0x6,
    CONNECT                          : 0x7,
    INDICATOR_PANEL                  : 0x8,
    CONFIRM_SUPPLY                   : 0x9,
    WAITING_CONFIRMATION             : 0xA,
    LIQUIDITY_TOKEN_ZONE             : 0xB,
    LP_WALLET_INFO                   : 0xC,
    TOP_PAIRS                        : 0xD,
    ETM                              : 0xE,
    CONFIRM_ISSUE_TOKEN              : 0xF,
    ACCOUNT_SHORT_INFO               : 0x10,
    RECENT_TXS_LIST                  : 0x11,
    WAITING_ISSUE_TOKEN_CONFIRMATION : 0x12,
    FARMS                            : 0x13,
    DROPS                            : 0x14,
    SWAP_ADDON                       : 0x15,
    SPACE_STATION                    : 0x16,
    ROUTING                          : 0x17,
    SPACE_BRIDGE                     : 0x18,
    TOKEN_CARD_BRIDGE                : 0x19,
    BIRDGE_CHAINS_DROPDOWN           : 0x1A,
    VOTING                           : 0x1B
}

function mapStoreToProps(component) {
    switch (component) {
        case components.ROOT:
            return function (state) {
                return {
                    ...state.root,
                    liquidityRemove     : state.swapCard.liquidityRemove,
                    exchange            : state.swapCard.exchange,
                    liquidity           : state.swapCard.liquidity,
                    removeLiquidity     : state.swapCard.removeLiquidity,
                    topPairs            : state.topPairs,
                    nonNativeConnection : state.nonNativeConnection
                }
            }
        case components.SWAP_CARD:
            return function (state) {
                return {
                    ...state.swapCard,
                    pubkey                     : state.root.pubkey,
                    mainToken                  : state.root.mainToken,
                    mainTokenFee               : state.root.mainTokenFee,
                    connectionStatus           : state.root.connectionStatus,
                    menuItem                   : state.root.menuItem,
                    removeLiquiditySimpleView  : state.swapCard.removeLiquidity.simpleView,
                    removeLiquidityAmount      : state.swapCard.removeLiquidity.amount,
                    pairs                      : state.root.pairs,
                    balances                   : state.root.balances,
                    navOpened                  : state.root.navOpened,
                    tokens                     : state.root.tokens,
                    nativeToken                : state.root.nativeToken,
                    net                        : state.root.net,
                    coinName                   : state.indicatorPanel.coinName,
                    farmsList                  : state.farms.farmsList
                }
            }
        case components.SWITCH:
            return function (state) {
                return {
                    pubkey      : state.root.pubkey,
                    menuItem    : state.root.menuItem
                }
            }
        case components.TOKEN_CARD:
            return function (state) {
                return {
                    ...state.swapCard,
                    ...state.tokenCard,
                    activeField : state.swapCard.activeField,
                    menuItem    : state.root.menuItem,
                    tokens      : state.root.tokens,
                    balances    : state.root.balances,
                    pairs       : state.root.pairs,
                    net         : state.root.net,
                    networkInfo : state.root.networkInfo
                }
            }
        case components.TOKEN_CARD_BRIDGE:
            return function (state) {
                return {
                    ...state.swapCard,
                    ...state.tokenCard,
                    activeField : state.swapCard.activeField,
                    menuItem    : state.root.menuItem,
                    tokens      : state.root.tokens,
                    balances    : state.root.balances,
                    pairs       : state.root.pairs,
                    net         : state.root.net,
                    networkInfo : state.root.networkInfo
                }
            }    
        case components.ASIDE:
            return function (state) {
                return {
                    ...state.aside,
                    connectionStatus: state.root.connectionStatus,
                    menuItem        : state.root.menuItem,
                    navOpened       : state.root.navOpened,
                    siteLocales     : state.root.siteLocales,
                    langTitles      : state.root.langTitles
                }
            }

        case components.NAVBAR:
            return function (state) {
                return {
                    navOpened           : state.root.navOpened,
                    connectionStatus    : state.root.connectionStatus
                }
            }  
        case components.CONNECT:
            return function (state) {
                return {
                    connectionStatus : state.root.connectionStatus
                }
            }
        case components.INDICATOR_PANEL:
            return function (state) {
                return {
                    ...state.root,
                    ...state.indicatorPanel,
                    pubkey          : state.root.pubkey,
                    balances        : state.root.balances,
                    tokens          : state.root.tokens,
                    net             : state.root.net,
                    coinAmount      : state.indicatorPanel.coinAmount,
                    mainToken       : state.root.mainToken,
                    mainTokenFee    : state.root.mainTokenFee,
                    connectionStatus: state.root.connectionStatus,
                    networkInfo     : state.root.networkInfo
                }
            }
        case components.CONFIRM_SUPPLY:
            return function (state) {
                return {
                    exchange          : state.swapCard.exchange,
                    liquidity         : state.swapCard.liquidity,
                    menuItem          : state.root.menuItem,
                    pubkey            : state.root.pubkey,
                    pairs             : state.root.pairs,
                    tokens            : state.root.tokens,
                    balances          : state.root.balances,
                    connectionStatus  : state.root.connectionStatus,
                    removeLiquidity   : state.swapCard.removeLiquidity,
                    liquidityRemove   : state.swapCard.liquidityRemove,
                    nativeToken       : state.root.nativeToken,
                    net               : state.root.net,
                    farmsList         : state.farms.farmsList
                }
            }
        case components.WAITING_CONFIRMATION:
            return function (state) {
                return {
                    ...state.swapCard.waitingConfirmation,
                    createPool      : state.swapCard.createPool,
                    exchange        : state.swapCard.exchange,
                    liquidity       : state.swapCard.liquidity,
                    menuItem        : state.root.menuItem,
                    removeLiquidity : state.swapCard.removeLiquidity,
                    net             : state.root.net,
                    liquidityRemove : state.swapCard.liquidityRemove,
                }
            }
        case components.WAITING_ISSUE_TOKEN_CONFIRMATION:
            return function (state) {
                return {
                    ...state.swapCard.waitingConfirmation,
                    net             : state.root.net
                }
            }            
        case components.LIQUIDITY_TOKEN_ZONE:
            return function (state) {
                return {
                    connectionStatus : state.root.connectionStatus,
                    pubkey           : state.root.pubkey,
                    menuItem         : state.root.menuItem,
                    tList            : state.root.tokens,
                    pairs            : state.root.pairs,
                    tokens           : state.root.tokens,
                    balances         : state.root.balances,
                    net              : state.root.net,
                    farmsList        : state.farms.farmsList
                }
            }
        case components.LP_WALLET_INFO:
            return function (state) {
                return {
                    menuItem        : state.root.menuItem,
                    liquidityRemove : state.swapCard.liquidityRemove,
                    exchange        : state.swapCard.exchange,
                    liquidity       : state.swapCard.liquidity,
                    removeLiquidity : state.swapCard.removeLiquidity,
                    pairs           : state.root.pairs,
                    tokens          : state.root.tokens,
                    balances        : state.root.balances,
                    liquidityMain   : state.swapCard.liquidityMain,
                    farmsList       : state.farms.farmsList
                }
            }
        case components.TOP_PAIRS:
            return function (state) {
                return {
                    ...state.root,
                    connectionStatus  : state.root.connectionStatus,
                    pairs             : state.root.pairs,
                    balances          : state.root.balances,
                    tokens            : state.root.tokens,
                    farmsList         : state.farms.farmsList,
                    networkInfo       : state.root.networkInfo
                }
            }
        case components.ETM:
            return function (state) {
                return {
                    showForm                : state.etm.showForm,
                    mainToken               : state.root.mainToken,
                    connectionStatus        : state.root.connectionStatus,                   
                    balances                : state.root.balances,
                    tokenData : {
                        mining_period                   : state.etm.tokenData.mining_period,
                        ticker                          : state.etm.tokenData.ticker,
                        name                            : state.etm.tokenData.name,
                        token_type                      : state.etm.tokenData.token_type,
                        reissuable                      : state.etm.tokenData.reissuable,
                        mineable                        : state.etm.tokenData.mineable,
                        max_supply                      : state.etm.tokenData.max_supply,
                        block_reward                    : state.etm.tokenData.block_reward,
                        min_stake                       : state.etm.tokenData.min_stake,
                        referrer_stake                  : state.etm.tokenData.referrer_stake,
                        ref_share                       : state.etm.tokenData.ref_share,   
                        decimals                        : state.etm.tokenData.decimals,
                        total_supply                    : state.etm.tokenData.total_supply,
                        fee_type                        : state.etm.tokenData.fee_type,
                        fee_value                       : state.etm.tokenData.fee_value,
                        min_fee_for_percent_fee_type    : state.etm.tokenData.min_fee_for_percent_fee_type
                    },
                    issueTokenTxAmount : state.etm.issueTokenTxAmount,
                    mainTokenTicker : state.etm.mainTokenTicker,
                    mainTokenDecimals : state.etm.mainTokenDecimals,
                    msgData : state.etm.msgData,
                    tokenBigIntData : state.etm.tokenBigIntData,
                    dataValid : state.etm.dataValid,
                    showFormErrMessages  : state.etm.showFormErrMessages,
                    possibleToIssueToken : state.etm.possibleToIssueToken
                }
            }
        case components.CONFIRM_ISSUE_TOKEN:
            return function (state) {
                return {
                    ...state.root,
                    ...state.etm,
                    mainTokenTicker      : state.etm.mainTokenTicker,
                    issueTokenTxAmount   : state.etm.issueTokenTxAmount,
                    tokenData            : state.etm.tokenData,
                    tokenBigIntData      : state.etm.tokenBigIntData,
                    dataValid            : state.etm.dataValid,
                    possibleToIssueToken : state.etm.possibleToIssueToken
                }
            }
        case components.ACCOUNT_SHORT_INFO:
            return function (state) {
                return {
                    pubkey                : state.root.pubkey,
                    net                   : state.root.net,
                }
            }
        case components.RECENT_TXS_LIST:
            return function (state) {
                return {
                    pubkey                : state.root.pubkey,
                    recentTxs             : state.root.recentTxs,
                    pairs                 : state.root.pairs,
                    tokens                : state.root.tokens,
                    net                   : state.root.net
                }
            }
        case components.FARMS:
            return function (state) {
                return {
                    ...state.root,
                    ...state.farms,
                    pairs             : state.root.pairs,
                    tokens            : state.root.tokens,
                    farmsList         : state.farms.farmsList,
                    mainTokenAmount   : state.farms.mainTokenAmount,
                    mainTokenDecimals : state.farms.mainTokenDecimals,
                    mainTokenFee      : state.farms.mainTokenFee,
                    pricelist         : state.farms.pricelist,                    
                    showStakeModal    : state.farms.showStakeModal,
                    managedFarmData   : state.farms.managedFarmData,
                    currentAction     : state.farms.currentAction,
                    expandedRow       : state.farms.expandedRow,
                    networkInfo       : state.root.networkInfo,
                    stakeData         : {
                        actionCost         : state.farms.stakeData.actionCost,
                        stakeValue         : state.farms.stakeData.stakeValue,  
                        stakeTxStatus      : state.farms.stakeData.stakeTxStatus,
                        stakeValid         : state.farms.stakeData.stakeValid,
                        msgData            : state.farms.stakeData.msgData,
                        stakeTokenAmount   : state.farms.stakeData.stakeTokenAmount
                    }
                }
            }
        case components.DROPS:
            return function (state) {
                return {
                    ...state.root,
                    ...state.drops,
                    farmsList         : state.drops.farmsList,
                    pairs             : state.root.pairs,
                    mainTokenAmount   : state.drops.mainTokenAmount,
                    mainTokenDecimals : state.drops.mainTokenDecimals,
                    mainTokenFee      : state.drops.mainTokenFee,
                    pricelist         : state.drops.pricelist,                    
                    showStakeModal    : state.drops.showStakeModal,
                    managedFarmData   : state.drops.managedFarmData,
                    currentAction     : state.drops.currentAction,
                    expandedRow       : state.drops.expandedRow,
                    exchangeRate      : state.aside.exchangeRate,
                    networkInfo       : state.root.networkInfo,
                    stakeData         : {
                        actionCost         : state.drops.stakeData.actionCost,
                        stakeValue         : state.drops.stakeData.stakeValue,  
                        stakeTxStatus      : state.drops.stakeData.stakeTxStatus,
                        stakeValid         : state.drops.stakeData.stakeValid,
                        msgData            : state.drops.stakeData.msgData,
                        stakeTokenAmount   : state.drops.stakeData.stakeTokenAmount
                    }
                }
            }
        case components.VOTING:
            return function (state) {
                return {
                    ...state.root,
                    ...state.voting
                }
            }
        case components.SPACE_STATION:
            return function (state) {
                return {
                    ...state.root,
                    networkInfo         : state.root.networkInfo,
                    tokens              : state.root.tokens,
                    farmsList           : state.spaceStation.farmsList,
                    poolsList           : state.spaceStation.poolsList,
                    mainTokenAmount     : state.spaceStation.mainTokenAmount,
                    mainTokenDecimals   : state.spaceStation.mainTokenDecimals,
                    mainTokenFee        : state.spaceStation.mainTokenFee,
                    pricelist           : state.spaceStation.pricelist,                    
                    showStakeModal      : state.spaceStation.showStakeModal,
                    showDistributeModal : state.spaceStation.showDistributeModal,
                    managedFarmData     : state.spaceStation.managedFarmData,
                    managedPool         : state.spaceStation.managedPool,
                    currentAction       : state.spaceStation.currentAction,
                    expandedRow         : state.spaceStation.expandedRow,
                    exchangeRate        : state.aside.exchangeRate,
                    stakeData           : {
                        actionCost         : state.spaceStation.stakeData.actionCost,
                        stakeValue         : state.spaceStation.stakeData.stakeValue,  
                        stakeTxStatus      : state.spaceStation.stakeData.stakeTxStatus,
                        stakeValid         : state.spaceStation.stakeData.stakeValid,
                        msgData            : state.spaceStation.stakeData.msgData,
                        stakeTokenAmount   : state.spaceStation.stakeData.stakeTokenAmount
                    }
                }
            }            
        case components.SWAP_ADDON:
            return function (state) {
                return {
                    pairs       : state.root.pairs,
                    exchange    : state.swapCard.exchange,
                    nativeToken : state.root.nativeToken,
                    tokens      : state.root.tokens,
                    swapCalculationsDirection : state.swapCard.swapCalculationsDirection,
                    route       : state.swapCard.route
                }
            }
        case components.ROUTING:
            return function (state) {
                return {
                    swapCalculationsDirection : state.swapCard.swapCalculationsDirection,
                    net : state.root.net
                }
            }
        case components.SPACE_BRIDGE:
            return function (state) {
                return {
                    ...state.root,
                    ...state.spaceBridge,
                    nonNativeConnection : state.nonNativeConnection,
                    pubkey              : state.root.pubkey,
                }
            }
        case components.BIRDGE_CHAINS_DROPDOWN:
            return function (state) {
                return {
                    ...state.root,
                    ...state.spaceBridge,
                    nonNativeConnection : state.nonNativeConnection,
                    pubkey              : state.root.pubkey,
                }
            }        
        default:
            return undefined
    }
}

function mapDispatchToProps(component) {
    switch (component) {
        case components.ROOT:
            return function (dispatch) {
                return bindActionCreators({
                    ...rootCreator,
                    assignBalanceObj               : bindActionCreators(swapCardCreator.assignBalanceObj, dispatch),
                    changeMenuItem                 : rootCreator.changeMenuItem,
                    assignTokenValue               : swapCardCreator.assignTokenValue,
                    assignCoinValue                : swapCardCreator.assignCoinValue,
                    updateFarmsList                : farmsCreator.updateFarmsList,

                    updateWalletConnectIsConnected : nonNativeConnectionCreator.updateWalletConnectIsConnected,
                    updateWalletConnect            : nonNativeConnectionCreator.updateWalletConnect,
                    updateWalletConnectChain       : nonNativeConnectionCreator.updateWalletConnectChain,
                    updateWalletConnectWalletTitle : nonNativeConnectionCreator.updateWalletConnectWalletTitle,
                    updateWalletConnectAccountId   : nonNativeConnectionCreator.updateWalletConnectAccountId,

                    updateWeb3ExtensionIsConnected : nonNativeConnectionCreator.updateWeb3ExtensionIsConnected,
                    updateWeb3Extension            : nonNativeConnectionCreator.updateWeb3Extension,
                    updateWeb3ExtensionChain       : nonNativeConnectionCreator.updateWeb3ExtensionChain,
                    updateWeb3ExtensionWalletTitle : nonNativeConnectionCreator.updateWeb3ExtensionWalletTitle,
                    updateWeb3ExtensionAccountId   : nonNativeConnectionCreator.updateWeb3ExtensionAccountId,
                }, dispatch)
            }
        case components.SWAP_CARD:
            return function (dispatch) {
                return bindActionCreators({
                    ...swapCardCreator,
                    updCurrentTxHash : rootCreator.updCurrentTxHash,
                    assignTokenValue : swapCardCreator.assignTokenValue,
                    updateFarmsList  : farmsCreator.updateFarmsList
                }, dispatch)
            }
        case components.SWITCH:
            return function (dispatch) {
                return {
                    changeMenuItem: bindActionCreators(rootCreator.changeMenuItem, dispatch)
                }
            }
        case components.TOKEN_CARD:
            return function (dispatch) {
                return bindActionCreators({
                    ...tokenCardCreator,
                    assignTokenValue    : swapCardCreator.assignTokenValue,
                    closeTokenList      : swapCardCreator.closeTokenList
                }, dispatch)
            }
        case components.ASIDE:
            return function (dispatch) {
                return bindActionCreators({
                    ...asideCreator,
                    changeMenuItem  : rootCreator.changeMenuItem,
                    toggleAside     : rootCreator.toggleAside,
                    updActiveLocale : rootCreator.updActiveLocale,
                    changeLanguage  : rootCreator.changeLanguage
                }, dispatch)
            }
        case components.WALLET_LIST:
            return function (dispatch) {
                return bindActionCreators({
                    setConStatus : rootCreator.setConStatus,
                    assignPubkey : rootCreator.assignPubkey
                }, dispatch)
            }
        case components.NAVBAR:
            return function (dispatch) {
                return bindActionCreators({
                    toggleAside     : rootCreator.toggleAside
                }, dispatch)
            }
        case components.CONNECT:
            return function (dispatch) {
                return bindActionCreators({
                    setConStatus : rootCreator.setConStatus,
                    assignPubkey : rootCreator.assignPubkey
                }, dispatch)
            }
        case components.INDICATOR_PANEL:
            return function (dispatch) {
                return bindActionCreators({
                    ...indicatorPanelCreator,
                    assignPubkey    : rootCreator.assignPubkey,
                    changeNetwork   : rootCreator.changeNetwork,
                    updMainTokenData: rootCreator.updMainTokenData
                }, dispatch)
            }
        case components.CONFIRM_SUPPLY:
            return function (dispatch) {
                return bindActionCreators({
                    updCurrentTxHash        : rootCreator.updCurrentTxHash
                }, dispatch) 
            }
        case components.WAITING_CONFIRMATION:
            return function (dispatch) {
                return bindActionCreators({
                    changeCreatePoolState       : swapCardCreator.changeCreatePoolState
                }, dispatch)
            }
        case components.WAITING_ISSUE_TOKEN_CONFIRMATION:
            return function (dispatch) {
                return bindActionCreators({
                    closeWaitingConfirmation    : etmCreator.closeWaitingConfirmation,
                    openWaitingConfirmation     : etmCreator.openWaitingConfirmation,
                    changeWaitingStateType      : etmCreator.changeWaitingStateType,
                    resetStore                  : etmCreator.resetStore
                }, dispatch)
            }            
        case components.LIQUIDITY_TOKEN_ZONE:
            return function (dispatch) {
                return bindActionCreators({
                    changeLiquidityMode             : swapCardCreator.changeLiquidityMode,
                    assignTokenValue                : swapCardCreator.assignTokenValue,
                    changeRemoveLiquidityVisibility : swapCardCreator.changeRemoveLiquidityVisibility,
                    assignCoinValue                 : swapCardCreator.assignCoinValue
                }, dispatch)
            }
        case components.ETM:
            return function (dispatch) {
                return bindActionCreators({
                    updateShowForm                 : etmCreator.updateShowForm,
                    updateTokenProperty            : etmCreator.updateTokenProperty,
                    updateTokenBigIntData          : etmCreator.updateTokenBigIntData,
                    updateMsgData                  : etmCreator.updateMsgData,
                    updateDataValid                : etmCreator.updateDataValid,
                    updatePossibleToIssueToken     : etmCreator.updatePossibleToIssueToken,
                    updateIssueTokenTxAmount       : etmCreator.updateIssueTokenTxAmount,
                    updateMainTokenTicker          : etmCreator.updateMainTokenTicker,
                    updateMainTokenDecimals        : etmCreator.updateMainTokenDecimals,
                    resetStore                     : etmCreator.resetStore
                }, dispatch)
            }            
        case components.CONFIRM_ISSUE_TOKEN:
            return function (dispatch) {
                return bindActionCreators({
                    updatePossibleToIssueToken : etmCreator.updatePossibleToIssueToken,
                    openWaitingConfirmation    : etmCreator.openWaitingConfirmation,
                    changeWaitingStateType     : etmCreator.changeWaitingStateType,
                    updCurrentTxHash           : rootCreator.updCurrentTxHash,
                    resetStore                  : etmCreator.resetStore
                }, dispatch) 
            }

        case components.RECENT_TXS_LIST:
            return function (dispatch) {
                return bindActionCreators({
                    updRecentTxs : rootCreator.updRecentTxs
                }, dispatch)
            }
        case components.FARMS:
            return function (dispatch) {
                return bindActionCreators({
                    updCurrentTxHash        : rootCreator.updCurrentTxHash,
                    updateFarmsList         : farmsCreator.updateFarmsList,
                    updateExpandedRow       : farmsCreator.updateExpandedRow,
                    updateManagedFarmData   : farmsCreator.updateManagedFarmData,
                    updateSortType          : farmsCreator.updateSortType,                    
                    updShowStakeModal       : farmsCreator.updShowStakeModal,
                    updateMainTokenAmount   : farmsCreator.updateMainTokenAmount,
                    updateMainTokenDecimals : farmsCreator.updateMainTokenDecimals,
                    updateMainTokenFee      : farmsCreator.updateMainTokenFee,
                    updatePricelist         : farmsCreator.updatePricelist,
                    updateCurrentAction     : farmsCreator.updateCurrentAction,
                    updateStakeData         : farmsCreator.updateStakeData,
                    changeMenuItem          : rootCreator.changeMenuItem
                }, dispatch) 
            }
        case components.DROPS:
            return function (dispatch) {
                return bindActionCreators({
                    updCurrentTxHash        : rootCreator.updCurrentTxHash,
                    updateFarmsList         : dropsCreator.updateFarmsList,
                    updateExpandedRow       : dropsCreator.updateExpandedRow,
                    updateManagedFarmData   : dropsCreator.updateManagedFarmData,
                    updateSortType          : dropsCreator.updateSortType,                    
                    updShowStakeModal       : dropsCreator.updShowStakeModal,
                    updateMainTokenAmount   : dropsCreator.updateMainTokenAmount,
                    updateMainTokenDecimals : dropsCreator.updateMainTokenDecimals,
                    updateMainTokenFee      : dropsCreator.updateMainTokenFee,
                    updatePricelist         : dropsCreator.updatePricelist,
                    updateCurrentAction     : dropsCreator.updateCurrentAction,
                    updateStakeData         : dropsCreator.updateStakeData,
                    changeMenuItem          : rootCreator.changeMenuItem
                }, dispatch) 
            }
        case components.VOTING:
            return function (dispatch) {
                return bindActionCreators({
                    updCurrentTxHash        : rootCreator.updCurrentTxHash,
                    updateFarmsList         : votingCreator.updateFarmsList,
                    updateExpandedRow       : votingCreator.updateExpandedRow,
                    updateManagedFarmData   : votingCreator.updateManagedFarmData,
                    updateSortType          : votingCreator.updateSortType,                    
                    updShowStakeModal       : votingCreator.updShowStakeModal,
                    updateMainTokenAmount   : votingCreator.updateMainTokenAmount,
                    updateMainTokenDecimals : votingCreator.updateMainTokenDecimals,
                    updateMainTokenFee      : votingCreator.updateMainTokenFee,
                    updatePricelist         : votingCreator.updatePricelist,
                    updateCurrentAction     : votingCreator.updateCurrentAction,
                    updateStakeData         : votingCreator.updateStakeData,
                    changeMenuItem          : rootCreator.changeMenuItem
                }, dispatch) 
            }
        case components.SPACE_STATION:
            return function (dispatch) {
                return bindActionCreators({
                    updCurrentTxHash        : rootCreator.updCurrentTxHash,
                    updateFarmsList         : spaceStationCreator.updateFarmsList,
                    updatePoolsList         : spaceStationCreator.updatePoolsList,
                    updateExpandedRow       : spaceStationCreator.updateExpandedRow,
                    updateManagedFarmData   : spaceStationCreator.updateManagedFarmData,
                    updateManagedPool       : spaceStationCreator.updateManagedPool,
                    updateSortType          : spaceStationCreator.updateSortType,
                    updShowStakeModal       : spaceStationCreator.updShowStakeModal,
                    updShowDistributeModal  : spaceStationCreator.updShowDistributeModal,
                    updateMainTokenAmount   : spaceStationCreator.updateMainTokenAmount,
                    updateMainTokenDecimals : spaceStationCreator.updateMainTokenDecimals,
                    updateMainTokenFee      : spaceStationCreator.updateMainTokenFee,
                    updatePricelist         : spaceStationCreator.updatePricelist,
                    updateCurrentAction     : spaceStationCreator.updateCurrentAction,
                    updateStakeData         : spaceStationCreator.updateStakeData,
                    changeMenuItem          : rootCreator.changeMenuItem
                }, dispatch) 
            }                         
        case components.TOP_PAIRS:
            return function (dispatch) {
                return bindActionCreators({
                    changeMenuItem          : rootCreator.changeMenuItem
                }, dispatch) 
            }
        case components.SPACE_BRIDGE:
            return function (dispatch) {
                return bindActionCreators({
                    updateWalletConnectIsConnected : nonNativeConnectionCreator.updateWalletConnectIsConnected,
                    updateWalletConnect            : nonNativeConnectionCreator.updateWalletConnect,
                    updateWalletConnectChain       : nonNativeConnectionCreator.updateWalletConnectChain,
                    updateWalletConnectWalletTitle : nonNativeConnectionCreator.updateWalletConnectWalletTitle,
                    updateWalletConnectAccountId   : nonNativeConnectionCreator.updateWalletConnectAccountId,

                    updateWeb3ExtensionIsConnected : nonNativeConnectionCreator.updateWeb3ExtensionIsConnected,
                    updateWeb3Extension            : nonNativeConnectionCreator.updateWeb3Extension,
                    updateWeb3ExtensionChain       : nonNativeConnectionCreator.updateWeb3ExtensionChain,
                    updateWeb3ExtensionWalletTitle : nonNativeConnectionCreator.updateWeb3ExtensionWalletTitle,
                    updateWeb3ExtensionAccountId   : nonNativeConnectionCreator.updateWeb3ExtensionAccountId,
 
                    updCurrentTxHash               : rootCreator.updCurrentTxHash,
                    updateSrcTokenHash             : spaceBridgeCreator.update_src_token_hash,
                    updateSrcTokenAllowance        : spaceBridgeCreator.update_src_token_allowance,
                    updateSrcTokenBalance          : spaceBridgeCreator.update_src_token_balance,
                    updateSrcTokenDecimals         : spaceBridgeCreator.update_src_token_decimals,
                    updateSrcTokenTicker           : spaceBridgeCreator.update_src_token_ticker,
                    updateSrcTokenAmountToSend     : spaceBridgeCreator.update_src_token_amount_to_send,
                    updateCurrentBridgeTx          : spaceBridgeCreator.update_current_bridge_tx,
                    updateBridgeDirection          : spaceBridgeCreator.update_bridge_direction,
                    updateShowTokenList            : spaceBridgeCreator.update_show_token_list,
                    updateSrcTokenObj              : spaceBridgeCreator.update_src_token_obj,
                    updateShowHistory              : spaceBridgeCreator.update_show_history,
                    updateFromBlockchain           : spaceBridgeCreator.update_from_blockchain,
                    updateToBlockchain             : spaceBridgeCreator.update_to_blockchain,
                    updateDstDecimals              : spaceBridgeCreator.update_dst_decimals,
    
                }, dispatch) 
            }
        case components.BIRDGE_CHAINS_DROPDOWN:
        return function (dispatch) {
                return bindActionCreators({                    
                    updateFromBlockchain  : spaceBridgeCreator.update_from_blockchain,
                    updateToBlockchain    : spaceBridgeCreator.update_to_blockchain    
                }, dispatch) 
            }   
        case components.TOKEN_CARD_BRIDGE:
            return function (dispatch) {
                return bindActionCreators({
                    ...tokenCardCreator,
                    updateShowTokenList            : spaceBridgeCreator.update_show_token_list,                    
                    updateSrcTokenDecimals         : spaceBridgeCreator.update_src_token_decimals,
                    updateSrcTokenTicker           : spaceBridgeCreator.update_src_token_ticker,
                    updateSrcTokenHash             : spaceBridgeCreator.update_src_token_hash,
                    updateSrcTokenBalance          : spaceBridgeCreator.update_src_token_balance,
                    updateSrcTokenAllowance        : spaceBridgeCreator.update_src_token_allowance
                }, dispatch)
            }                    
        default:
            return undefined
    }
}

export {
    mapStoreToProps,
    mapDispatchToProps,
    components
}
