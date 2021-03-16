import React from 'react';
import History from './History';
import Settings from './Settings';
import TokenCard from './TokenCard';

import '../css/swap-card.css';
import '../css/font-style.css';

const startToken = '...';

class SwapCard extends React.Component {
    constructor(props) {
        super(props);
        this.mode = props.mode;
        this.root = props.root;
        this.activeField = 0;
        this.pairs = [];
        this.state = {
            exchange : {
                field0 : {
                    value : '',
                    token : {
                        name : startToken,
                        hash : undefined
                    }
                },
                field1 : {
                    value : '',
                    token : {
                        name : startToken,
                        hash : undefined
                    }
                }
            },
            liquidity : {
                field0 : {
                    value : '',
                    token : {
                        name : startToken,
                        hash : undefined
                    }
                },
                field1 : {
                    value : '',
                    token : {
                        name : startToken,
                        hash : undefined
                    }
                }
            },
            tokenListStatus : false
        };
    };

    swapPair () {
        this.setState(state => {
            state.exchange.field0 = [state.exchange.field1, state.exchange.field1=state.exchange.field0 ][0];
            return state;
        });
    };

    getInputField (props) {
        return (
            <div>
                <p className='input-name'>
                    {props.fieldName}
                </p>
                <input id={props.fieldClass}
                    onChange={this.changeField.bind(this, props.fieldClass)}
                    className='c-input-field'
                    type='text'
                    value={props.value}
                    placeholder='0.0'>
                </input>
                <button onClick={ this.openTokenList.bind(this, props.fieldClass) }
                        className={`btn btn-secondary my-2 my-sm-0 ${props.fieldClass} token-button`}
                        type='submit'
                        style={{ height: '40px' }}>
                    {props.tokenName}
                </button>
            </div>
        );
    };

    getActiveField (fieldId, counter) {
        if (fieldId === 'token-use')
            return (counter) ? 'field1' : 'field0';
        else
            return (counter) ? 'field0' : 'field1';
    };

    openTokenList (fieldId) {
        this.activeField = fieldId;
        console.log(123);
        this.setState({ tokenListStatus : true });
    };

    closeTokenList () {
        this.setState({ tokenListStatus : false });
    }

    changeField (fieldId) {
        let field = this.getActiveField(fieldId);
        let value = this.state[this.mode][field].value;
        if (['insertText', 'deleteContentBackward', 'deleteContentForward'].indexOf(event.inputType) !== -1) {
            if (event.inputType == 'insertText' && !(new RegExp('[0-9|\\.]+')).test(event.data)) {
                // nothing to do. this.updCardInternals() will save you previous number
            } else if (event.inputType == 'deleteContentBackward' || event.inputType == 'deleteContentForward') {
                value = document.getElementById(fieldId).value;
            } else {
                let newVal = document.getElementById(fieldId).value;
                if ((new RegExp('^[0-9]+\\.?[0-9]*$')).test(newVal) && !(new RegExp('^0(0)+')).test(newVal))
                    value = newVal;
            }
        } else if (['deleteWordBackward', 'deleteWordForward'].indexOf(event.inputType) !== -1) {
            value = document.getElementById(fieldId).value;
        } else {}

        this.setState(state => { 
            state[this.mode][field].value = value;
            return state;
        });
        this.countCounterField(field, this.getActiveField(fieldId, true));
    };

    searchSwap (tokens) {
        let hashes = [tokens[0].hash, tokens[1].hash];
        return this.pairs.find(el => {
            if (hashes.indexOf(el.token_0.hash) != -1 && 
                hashes.indexOf(el.token_1.hash) != -1 && 
                el.token_0.hash !== el.token_1.hash) {
                return el;
            }
        });
    };

    countCoinValue (input_0, input_1) {
        try {
            return input_1 / input_0;
        } catch (e) {
            return 0;
        }
    };

    getAddLiquidityPrice (input_0, input_1, coinValue) {
        return this.countCoinValue(input_0, input_1) * coinValue;
    };

    countLiqudity (pair) {
        return pair.token_0.volume * pair.token_1.volume;
    };

    getSwapPrice (pair, amountIn) {
        if (amountIn == 0) // use 'if' instead of try/catch in order to check empty string
            return 0;
        return (1 - pair.pool_fee) * this.countLiqudity(pair) / amountIn;
    };

    countPrice (activeField, pair) {
        if (this.mode == 'exchange') {
            if (activeField.token == pair.token_0.hash)
                return this.getAddLiquidityPrice(pair.token_0.hash, pair.token_1.hash, activeField.value);
            else
                return this.getAddLiquidityPrice(pair.token_1.volume, pair.token_0.volume, activeField.value);
        } else {
            if (activeField.token == pair.token_0.hash)
                return this.getSwapPrice(pair, activeField.value);
            else
                return this.getSwapPrice(pair, activeField.value);
        }
    };

    countCounterField (field, cField) {
        let activeField = this.state[this.mode][field];
        let counterField = this.state[this.mode][cField];

        if (activeField.token.name !== startToken && counterField.token.name !== startToken) {
            let pair = this.searchSwap([activeField.token, counterField.token]);
            if (pair === undefined)
                return;
            let counterFieldPrice = this.countPrice(activeField, pair);
            if (!counterFieldPrice)
                counterFieldPrice = '';
            this.setState(state => {
                state[this.mode][cField].value = counterFieldPrice;
                return state;
            });
        }
    };

    changeToken (token) {
        let field = this.getActiveField(this.activeField);
        this.setState(state => {
            state[this.mode][field].token = token;
            return state;
        });
        this.countCounterField(field, this.getActiveField(this.activeField, true));
    };

    renderTokenCard () {
        if (this.state.tokenListStatus)
            return (
                <div id='tokens-card'>
                    <TokenCard root={ this.root } 
                               changeToken={ this.changeToken.bind(this) } 
                               closeTokenList={this.closeTokenList.bind(this)} />
                </div>
            );
    };

    renderExchangeCard() {
        return (
            <div>
                <div className='row no-gutters swap-header-group'>
                    <div className='col-9'>
                        <h4 className='row' id='swap-mode-header'>
                            {this.root.state.langData.trade.swapCard[this.mode].header}
                        </h4>
                        <p className='row' id='under-header'>
                            {this.root.state.langData.trade.swapCard[this.mode].description}
                        </p>
                    </div>
                    <div className='col d-flex justify-content-center align-items-center no-gutters'>
                        <Settings />
                        <History />
                    </div>
                </div>
                <div id='head-line'></div>
                <div className='row swap-input' id='from'>
                    {this.getInputField({
                        fieldName: this.root.state.langData.trade.swapCard[this.mode].input0,
                        fieldClass: 'token-use',
                        tokenName: this.state[this.mode].field0.token.name,
                        value: this.state[this.mode].field0.value
                    })}
                </div>
                <div className='row' id='exch' onClick={ this.swapPair.bind(this) }>
                    <span className='icon-Icon13 exch-button d-flex align-items-end' />
                </div>
                <div className='swap-input' id='to'>
                    {this.getInputField({
                        fieldName: this.root.state.langData.trade.swapCard[this.mode].input1,
                        fieldClass: 'token-use1',
                        tokenName: this.state[this.mode].field1.token.name,
                        value: this.state[this.mode].field1.value
                    })}
                </div>
                <div className='row no-gutters'>
                    <div className='col-7 d-flex justify-content-center'>Coming soon</div>
                    <div className='col-3 d-flex justify-content-end'>1%</div>
                </div>
                <button
                    className='btn btn-secondary my-2 my-sm-0 swap-input'
                    type='submit'
                    id='submit'>
                    { this.root.state.langData.trade.swapCard.submitButton.afterConnection }
                </button>
                { this.renderTokenCard() }
            </div>
        );
    };

    renderLiquidityCard () {
        return (
            <div></div>
        );
    };

    render() {
        return (this.mode == 'exchange') ? this.renderExchangeCard() : this.renderLiquidityCard();
    };
};

export default SwapCard;