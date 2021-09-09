import initialState from '../initialState'
import actionPack from '../actions/actions'

const actions = actionPack.indicatorPanel

export default function indicatorPanelReducer (state = initialState.indicatorPanel, action) {
    switch (action.type) {
        case actions.UPD_COIN_AMOUNT:
            return {
                ...state,
                coinAmount : action.value
            }
        case actions.UPD_COIN_NAME:
            return {
                ...state,
                coinName: action.value
            }
        default: 
            return state
    }
}