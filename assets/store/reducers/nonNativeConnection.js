import initialState from '../initialState'
import actionPack from '../actions/actions'

const actions = actionPack.nonNativeConnection

export default function nonNativeConnectionReducer (state = initialState.nonNativeConnection, action) {
    switch (action.type) {
        case actions.UPDATE_CHAIN:
            return {
                ...state,
                chain : action.value
            }
        case actions.UPDATE_IS_WALLET_CONNECT:
            return {
                ...state,
                isWalletConnect: action.value
            }
        case actions.UPDATE_WALLET_CONNECT_WALLET:
            return {
                ...state,
                walletConnectWallet: action.value
            }
        case actions.UPDATE_IS_WEB3_EXTENSION_CONNECT:
            return {
                ...state,
                isWeb3ExtensionConnect: action.value
            }
        case actions.UPDATE_ACCOUNT_ID:
            return {
                ...state,
                accountId: action.value
            }
        default: 
            return state
    }
}