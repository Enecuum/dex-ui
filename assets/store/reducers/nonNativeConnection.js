import initialState from '../initialState'
import actionPack from '../actions/actions'

const actions = actionPack.nonNativeConnection

export default function nonNativeConnectionReducer (state = initialState.nonNativeConnection, action) {
    switch (action.type) {
        case actions.UPDATE_WALLET_CONNECT_IS_CONNECTED:
            return {
                ...state,
                walletConnectIsConnected : action.value
            }
        case actions.UPDATE_WALLET_CONNECT:
            return {
                ...state,
                walletConnect: action.value
            }
        case actions.UPDATE_WALLET_CONNECT_CHAIN:
            return {
                ...state,
                walletConnectChain: action.value
            }
        case actions.UPDATE_WALLET_CONNECT_WALLET_TITLE:
            return {
                ...state,
                walletConnectWalletTitle: action.value
            }
        case actions.UPDATE_WALLET_CONNECT_ACCOUNT_ID:
            return {
                ...state,
                walletConnectAccountId: action.value
            }
        case actions.UPDATE_WEB3_EXTENSION_IS_CONNECTED:
            return {
                ...state,
                web3ExtensionIsConnected : action.value
            }
        case actions.UPDATE_WEB3_EXTENSION:
            return {
                ...state,
                web3Extension: action.value
            }
        case actions.UPDATE_WEB3_EXTENSION_CHAIN:
            return {
                ...state,
                web3ExtensionChain: action.value
            }
        case actions.UPDATE_WEB3_EXTENSION_WALLET_TITLE:
            return {
                ...state,
                web3ExtensionWalletTitle: action.value
            }
        case actions.UPDATE_WEB3_EXTENSION_ACCOUNT_ID:
            return {
                ...state,
                web3ExtensionAccountId: action.value
            }            
        default: 
            return state
    }
}