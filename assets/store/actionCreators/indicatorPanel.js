import actionPack from '../actions/actions'

const actions = actionPack.indicatorPanel

const actionCreators = {
    updCoinAmount (amount) {
        return {
            type : actions.UPD_COIN_AMOUNT,
            value : amount
        }
    },
    updCoinName (name) {
        return {
            type : actions.UPD_COIN_NAME,
            value : name
        }
    }
}

export default actionCreators