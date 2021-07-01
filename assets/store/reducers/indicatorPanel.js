import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.indicatorPanel;

export default function indicatorPanelReducer (state = initialState.indicatorPanel, action) {
    switch (action.type) {
        case actions.UPD_COIN_AMOUNT:
            return {
                ...state,
                coinAmount : action.value
            };
        case actions.CHANGE_ACC_INFO_VISIBILITY:
            return {
                ...state,
                accountInfoVisibility: !state.accountInfoVisibility
            };

        default: 
            return state;
    }
};