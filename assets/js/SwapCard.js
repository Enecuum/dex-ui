import React from 'react';
import History from './History';
import Settings from './Settings';
import TokenCard from './TokenCard';
import SwapApi from './swapApi';
import Tooltip from './Tooltip';
import Presets from './pageDataPresets';

import '../css/swap-card.css';
import '../css/font-style.css';

const swapApi = new SwapApi();
const presets = new Presets();

class SwapCard extends React.Component {
    constructor(props) {
        super(props);
        this.root = props.root;
        this.activeField = 0;
        this.pairs = [];
        this.defaultToken = '';
        this.state = {
            exchange: {
                field0: {
                    walletValue: '-',
                    value: '',
                    token: {...presets.swapTokens.defaultToken}
                },
                field1: {
                    walletValue: '-',
                    value: '',
                    token: {...presets.swapTokens.emptyToken}
                }
            },
            liquidity: {
                field0: {
                    walletValue: '-',
                    value: '',
                    token: {...presets.swapTokens.defaultToken}
                },
                field1: {
                    walletValue: '-',
                    value: '',
                    token: {...presets.swapTokens.emptyToken}
                }
            },
            tokenListStatus: false,
            liquidityMain: true
        };
        this.pairExists = false;
        this.readyToSubmit = false;
        this.updPairs();
    };

    async updPairs() {
        this.pairs = await (await swapApi.getPairs()).json();
    };

    swapPair() {
        this.setState(state => {
            state.exchange.field0 = [state.exchange.field1, state.exchange.field1 = state.exchange.field0][0];
            return state;
        });
    };

    changeBalance() {
        let field = this.getActiveField(this.activeField);
        this.root.getBalance(this.state[this.root.state.menuItem][field].token.hash)
            .then(balance => {
                this.setState(state => {
                    state[this.root.state.menuItem][field].walletValue = (balance !== undefined) ? `Balance: ${balance.amount}` : '-';
                    return state;
                });
            });
    }

    getInputField(props) {
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
                    placeholder='0.0'
                    autoComplete='off'>
                </input>
                <div className={`${props.fieldClass} token-button row hover-pointer`} onClick={this.openTokenList.bind(this, props.fieldClass)}>
                    <div className='col d-flex justify-content-center align-items-center'>{props.tokenName}</div>
                    <span className='icon-Icon26 d-flex justify-content-begin align-items-center toggle-token'></span>
                </div>
                <div className='my-token-amount d-flex justify-content-end'>
                    {this.state[this.root.state.menuItem][this.getActiveField(props.fieldClass)].walletValue}
                </div>
            </div>
        );
    };

    getActiveField(fieldId, counter) {
        if (fieldId === 'token-use')
            return (counter) ? 'field1' : 'field0';
        else
            return (counter) ? 'field0' : 'field1';
    };

    openTokenList(fieldId) {
        this.activeField = fieldId;
        this.setState({ tokenListStatus: true });
    };

    closeTokenList() {
        this.setState({ tokenListStatus: false }, () => {
            this.establishReadiness();
        });
    }

    changeField(fieldId) {
        let field = this.getActiveField(fieldId);
        let value = this.state[this.root.state.menuItem][field].value;
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
        } else { }

        let fieldObj = this.state[this.root.state.menuItem][field];
        fieldObj.value = value;
        this.setState(state => {
            state[this.root.state.menuItem][field] = fieldObj;
            return state;
        }, () => {
            this.establishReadiness();
        });
        this.countCounterField(fieldObj, this.getActiveField(fieldId, true));
    };

    establishReadiness() {
        if (this.isReadyToSubmit())
            this.readyToSubmit = true;
        else
            this.readyToSubmit = false;
    };

    isReadyToSubmit() {
        if (this.state[this.root.state.menuItem].field0.value != 0 &&
            this.state[this.root.state.menuItem].field1.value != 0 &&
            this.state[this.root.state.menuItem].field0.token.hash != undefined &&
            this.state[this.root.state.menuItem].field1.token.hash != undefined) {
            return true;
        }
        return false;
    };

    searchSwap(tokens) {
        let hashes = [tokens[0].hash, tokens[1].hash];
        return this.pairs.find(el => {
            if (hashes.indexOf(el.token_0.hash) != -1 &&
                hashes.indexOf(el.token_1.hash) != -1 &&
                el.token_0.hash !== el.token_1.hash) {
                    
                return el;
            }
        });
    };

    divide(input_0, input_1) {
        try {
            return input_1 / input_0;
        } catch (e) {
            return 0;
        }
    };

    getAddLiquidityPrice(input_0, input_1, coinValue) {
        return this.divide(input_0, input_1) * coinValue;
    };

    countLiqudity(pair) {
        return pair.token_0.volume * pair.token_1.volume;
    };

    getSwapPrice(pair, amountIn) {
        if (amountIn == 0) // use 'if' instead of try/catch in order to check empty string
            return 0;
        return (1 - pair.pool_fee) * this.countLiqudity(pair) / amountIn;
    };

    countPrice(activeField, pair) {
        if (this.root.state.menuItem == 'exchange') {
            if (activeField.token.hash == pair.token_0.hash)
                return this.getSwapPrice(pair, activeField.value);
            else
                return this.getSwapPrice(pair, activeField.value);
        } else {
            if (activeField.token.hash == pair.token_0.hash)
                return this.getAddLiquidityPrice(pair.token_0.volume, pair.token_1.volume, activeField.value);
            else
                return this.getAddLiquidityPrice(pair.token_1.volume, pair.token_0.volume, activeField.value);
        }
    };

    countCounterField(activeField, cField) {
        let counterField = this.state[this.root.state.menuItem][cField];

        if (activeField.token.name !== presets.swapTokens.emptyToken.name && counterField.token.name !== presets.swapTokens.emptyToken.name) {
            let pair = this.searchSwap([activeField.token, counterField.token]);
            if (pair === undefined) {
                return;
            }
            let counterFieldPrice = this.countPrice(activeField, pair);
            if (!counterFieldPrice)
                counterFieldPrice = '';
            this.setState(state => {
                state[this.root.state.menuItem][cField].value = counterFieldPrice;
                return state;
            });
        }
    };

    changeToken(token) {
        let field = this.getActiveField(this.activeField);
        let fieldObj = this.state[this.root.state.menuItem][field];
        fieldObj.token = token;
        this.setState(state => {
            state[this.root.state.menuItem][field] = fieldObj;
            return state;
        });
        this.countCounterField(fieldObj, this.getActiveField(this.activeField, true));
    };

    renderTokenCard() {
        if (this.state.tokenListStatus)
            return (
                <>
                    <TokenCard root={this.root} changeBalance={this.changeBalance.bind(this)}
                        changeToken={this.changeToken.bind(this)}
                        closeTokenList={this.closeTokenList.bind(this)} />
                </>
            );
    };

    renderExchangeCard() {
        return (
            <div>
                <div className='row no-gutters swap-header-group'>
                    <div className='col-9'>
                        <h4 className='row' id='swap-mode-header'>
                            {this.root.state.langData.trade.swapCard[this.root.state.menuItem].header}
                        </h4>
                        <p className='row' id='under-header'>
                            {this.root.state.langData.trade.swapCard[this.root.state.menuItem].description}
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
                        fieldName: this.root.state.langData.trade.swapCard[this.root.state.menuItem].input0,
                        fieldClass: 'token-use',
                        tokenName: this.state[this.root.state.menuItem].field0.token.name,
                        value: this.state[this.root.state.menuItem].field0.value
                    })}
                </div>
                <div className='row' id='exch' onClick={this.swapPair.bind(this)}>
                    <span className='icon-Icon13 exch-button d-flex align-items-end' />
                </div>
                <div className='swap-input' id='to'>
                    {this.getInputField({
                        fieldName: this.root.state.langData.trade.swapCard[this.root.state.menuItem].input1,
                        fieldClass: 'token-use1',
                        tokenName: this.state[this.root.state.menuItem].field1.token.name,
                        value: this.state[this.root.state.menuItem].field1.value
                    })}
                </div>
                <div className='row no-gutters'>
                    <div className='col-7 d-flex justify-content-center'>Coming soon</div>
                    <div className='col-3 d-flex justify-content-end'>1%</div>
                </div>
                { this.getSubmitButton() }
            </div>
        );
    };

    renderMainLiquidityCard() {
        return (
            <div>
                <div className='row no-gutters swap-header-group'>
                    <div className='col-9'>
                        <h4 className='row' id='swap-mode-header'>
                            {this.root.state.langData.trade.swapCard[this.root.state.menuItem].header}
                        </h4>
                        <p className='row' id='under-header'>
                            {this.root.state.langData.trade.swapCard[this.root.state.menuItem].description}
                        </p>
                    </div>
                    <div className='col d-flex justify-content-center align-items-center no-gutters'>
                        <div className='col d-flex justify-content-center align-items-center no-gutters'>
                            <Settings />
                            <History />
                        </div>
                    </div>
                </div>
                <button className='btn btn-secondary my-2 my-sm-0 liquidity-btn' type='submit' onClick={this.changeLiquidityCard.bind(this)}>
                    {this.root.state.langData.trade.swapCard[this.root.state.menuItem].addButton}
                </button>
                <div id='head-line'></div>
                <div className='row no-gutters your-liquidity-header'>
                    <div className='col-9'>
                        {this.root.state.langData.trade.swapCard[this.root.state.menuItem].yourLiquidity}
                    </div>
                    <div className='col d-flex justify-content-end'>
                        <span className='icon-Icon4'></span>
                    </div>
                </div>
                <div className='your-liquidity-field'>
                    {/* future content */}
                </div>
                <div className='your-liquidity-header'>
                    {this.root.state.langData.trade.swapCard[this.root.state.menuItem].additionInfo}
                </div>
            </div>
        );
    };

    renderAddLiquidityCard() {
        let langProp_Per_ = this.root.state.langData.trade.swapCard[this.root.state.menuItem].per;
        return (
            <div>
                <div className='row no-gutters swap-header-group'>
                    <div className='col d-flex justify-content-end align-items-center no-gutters' onClick={this.changeLiquidityCard.bind(this)}>
                        <span className='icon-Icon13 back-button hover-pointer'></span>
                    </div>
                    <h4 className='col-9 d-flex justify-content-center align-items-center add-liquidity-header' id='swap-mode-header'>
                        {this.root.state.langData.trade.swapCard[this.root.state.menuItem].secondHeader}
                    </h4>
                    <div className='col d-flex justify-content-begin align-items-center no-gutters'>
                        <Tooltip text={this.root.state.langData.trade.swapCard.liquidity.tooltipText} />
                    </div>
                </div>
                <div className='row swap-input no-top-margin' id='from'>
                    {this.getInputField({
                        fieldName: this.root.state.langData.trade.swapCard[this.root.state.menuItem].input0,
                        fieldClass: 'token-use',
                        tokenName: this.state[this.root.state.menuItem].field0.token.name,
                        value: this.state[this.root.state.menuItem].field0.value
                    })}
                </div>
                <span className='icon-Icon17 d-flex justify-content-center plus-liquidity' />
                <div className='swap-input' id='to'>
                    {this.getInputField({
                        fieldName: this.root.state.langData.trade.swapCard[this.root.state.menuItem].input1,
                        fieldClass: 'token-use1',
                        tokenName: this.state[this.root.state.menuItem].field1.token.name,
                        value: this.state[this.root.state.menuItem].field1.value
                    })}
                </div>
                <div className='pool-prices'>{this.root.state.langData.trade.swapCard[this.root.state.menuItem].priceAndPoolShare}</div>
                <div className='swap-input price-and-poolshare-field row'>
                    <div className='col'>
                        <div className='row d-flex justify-content-center'>{this.countExchangeRate(true)}</div>
                        <div className='row d-flex justify-content-center'>{this.getExchangeText(langProp_Per_, true)}</div>
                    </div>
                    <div className='col'>
                        <div className='row d-flex justify-content-center'>{this.countExchangeRate(false)}</div>
                        <div className='row d-flex justify-content-center'>{this.getExchangeText(langProp_Per_, false)}</div>
                    </div>
                    <div className='col'>
                        <div className='row d-flex justify-content-center'>-</div>
                        <div className='row d-flex justify-content-center'>{this.root.state.langData.trade.swapCard[this.root.state.menuItem].shareOfPool}</div>
                    </div>
                </div>
                { this.getSubmitButton() }
            </div>
        );
    };

    establishPairExistence() {
        let token0 = this.state[this.root.state.menuItem].field0.token;
        let token1 = this.state[this.root.state.menuItem].field1.token;
        if (token0.hash == presets.swapTokens.emptyToken.hash || token1.hash == presets.swapTokens.emptyToken.hash) {
            this.pairExists = true; // make an exclusion for first page render
            return;
        }
        if (this.searchSwap([token0, token1]) == undefined)
            this.pairExists = false;
        else 
            this.pairExists = true;
    };

    getSubmitButton() {
        let names = this.root.state.langData.trade.swapCard.submitButton;
        let buttonName;
        if (this.root.state.connectionStatus == false)
            buttonName = names.beforeConnection;
        else {
            if (this.root.state.menuItem == 'exchange')
                buttonName = names.swap;
            else if (this.root.state.menuItem == 'liquidity')
                buttonName = names.addLiquidity;
            if (!this.readyToSubmit)
                buttonName = names.fillAllFields;
            if (this.pairExists == false) {
                buttonName = names.createPair;
                return (
                    <div className='row no-gutters'>
                        <div className='col-7 swap-input about-button-info d-flex justify-content-center align-items-center'>
                            { this.root.state.langData.trade.swapCard.aboutButtonInfo.withoutPair }
                        </div>
                        <button
                            className='col btn btn-secondary my-2 my-sm-0 swap-input alt-submit'
                            type='submit'
                            id='submit'>
                            { buttonName }
                        </button>
                    </div>
                );
            }
        }
        return (
            <button
                className='btn btn-secondary my-2 my-sm-0 swap-input'
                type='submit'
                id='submit'
                style={{backgroundColor : (this.root.state.connectionStatus) ? undefined : 'var(--color5)'}}>
                { buttonName }
            </button>
        );
    };

    getExchTokenName(name) {
        return (name == presets.swapTokens.emptyToken.name) ? '-' : name;
    };

    getExchangeText(langProp_Per_, firstPerSecond) {
        let first = this.getExchTokenName(this.state.liquidity.field0.token.name);
        let second = this.getExchTokenName(this.state.liquidity.field1.token.name);
        if (firstPerSecond)
            return `${first} ${langProp_Per_} ${second}`;
        else
            return `${second} ${langProp_Per_} ${first}`;
    };

    countExchangeRate(firstPerSecond) {
        let pair = this.searchSwap([this.state.liquidity.field0.token, this.state.liquidity.field1.token]);
        if (pair === undefined) {
            return '-';
        }
        pair = { ...pair };
        if (pair.token_0.hash !== this.state.liquidity.field0.token.hash) {
            if (!firstPerSecond)
                pair.token_0 = [pair.token_1, pair.token_1 = pair.token_0][0];
        } else {
            if (firstPerSecond)
                pair.token_0 = [pair.token_1, pair.token_1 = pair.token_0][0];
        }
        return this.divide(pair.token_0.volume, pair.token_1.volume);
    };

    changeLiquidityCard() {
        this.setState({ liquidityMain: !this.state.liquidityMain });
    };

    renderLiquidityCard() {
        return (this.state.liquidityMain) ? this.renderMainLiquidityCard() : this.renderAddLiquidityCard();
    };

    render() {
        this.establishReadiness();
        this.establishPairExistence();
        return (
            <div>
                { (this.root.state.menuItem == 'exchange') ? this.renderExchangeCard() : this.renderLiquidityCard()}
                { this.renderTokenCard()}
            </div>
        );
    };
};

export default SwapCard;