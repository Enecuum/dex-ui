import initialState from '../initialState';
import actionPack from '../actions/actions';

const actions = actionPack.etm;

function getKeyValueObj(action) {
    let field = action.payload.field;
    if (field == 'mining_period')
        return { mining_period: action.payload.value };
    else if (field == 'ticker')
        return { ticker: action.payload.value };
    else if (field == 'name')
        return { name: action.payload.value };
    else if (field == 'token_type')
        return { token_type: action.payload.value };
    else if (field == 'reissuable')
        return { reissuable: action.payload.value };
    else if (field == 'mineable')
        return { mineable: action.payload.value };
    else if (field == 'max_supply')
        return { max_supply: action.payload.value };    
    else if (field == 'block_reward')
        return { block_reward: action.payload.value };
    else if (field == 'min_stake')
        return { min_stake: action.payload.value };
    else if (field == 'referrer_stake')
        return { referrer_stake: action.payload.value };
    else if (field == 'ref_share')
        return { ref_share: action.payload.value };
    else if (field == 'decimals')
        return { decimals: action.payload.value };
    else if (field == 'total_supply')
        return { total_supply: action.payload.value };
    else if (field == 'fee_type')
        return { fee_type: action.payload.value };
    else if (field == 'fee_value')
        return { fee_value: action.payload.value };
    else if (field == 'min_fee_for_percent_fee_type')
        return { min_fee_for_percent_fee_type: action.payload.value };                    
    else 
        return { unknownProperty: action.payload.value };
}

function assignTokenProperty(state, fragment, action) {
    return {
        ...state[fragment],
        ...getKeyValueObj(action)
    }
}

export default function etmReducer(state = initialState.etm, action) {
    switch (action.type) {
        case actions.UPDATE_TOKEN_PROPERTY:
            return {
                ...state,
                tokenData : assignTokenProperty(state, 'tokenData', action)
            };
        case actions.UPDATE_TOKEN_BIGINT_DATA:
            return {
                ...state,
                tokenBigIntData : action.payload
            };
        case actions.UPDATE_MSG_DATA:
            return {
                ...state,
                msgData : action.payload
            };            
        case actions.UPDATE_SHOW_FORM:
            return {
                ...state,
                showForm : action.payload
            };
        case actions.UPDATE_DATA_VALID:
            return {
                ...state,
                dataValid : action.payload
            };
        case actions.UPDATE_ISSUE_TOKEN_TX_AMOUNT:
            return {
                ...state,
                issueTokenTxAmount : action.payload
            } 
        case actions.UPDATE_MAIN_TOKEN_TICKER:
            return {
                ...state,
                mainTokenTicker : action.payload
            }
        case actions.UPDATE_MAIN_TOKEN_DECIMALS:
            return {
                ...state,
                mainTokenDecimals : action.payload
            }
        case actions.UPDATE_POSSIBLE_TO_ISSUE_TOKEN:
            return {
                ...state,
                possibleToIssueToken : action.payload
            };            
        default:
            return state;
    }
};