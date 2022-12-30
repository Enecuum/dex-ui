import initialState from '../initialState'
import actionPack from '../actions/actions'

const actions = actionPack.spaceBridge

export default function spaceBridgeReducer (state = initialState.spaceBridge, action) {
    switch (action.type) {
        case actions.UPDATE_SRC_TOKEN_HASH:
            return {
                ...state,
                srcTokenHash : action.value
            }
        case actions.UPDATE_SRC_TOKEN_ALLOWANCE:
            return {
                ...state,
                srcTokenAllowance: action.value
            }
        case actions.UPDATE_SRC_TOKEN_BALANCE:
            return {
                ...state,
                srcTokenBalance : action.value
            }
        case actions.UPDATE_SRC_TOKEN_DECIMALS:
            return {
                ...state,
                srcTokenDecimals: action.value
            }
            case actions.UPDATE_SRC_TOKEN_TICKER:
            return {
                ...state,
                srcTokenTicker : action.value
            }
        case actions.UPDATE_SRC_TOKEN_AMOUNT_TO_SEND:
            return {
                ...state,
                srcTokenAmountToSend: action.value
            }
        case actions.UPDATE_CURRENT_BRIDGE_TX:
            return {
                ...state,
                currentBridgeTx: action.value
            }
        case actions.UPDATE_BRIDGE_DIRECTION:
            return {
                ...state,
                bridgeDirection: action.value
            }    
        default: 
            return state
    }
}