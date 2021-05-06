import React, { Suspense } from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import presets from '../../store/pageDataPresets';
import ConfirmSupply from './ConfirmSupply';
import LogoToken from '../elements/LogoToken';
import Tooltip from '../elements/Tooltip';
import TokenCard from './TokenCard';
import History from './History';
import Settings from './Settings';
import testFormulas from '../utils/testFormulas';
import utils from '../utils/swapUtils';
import LiquidityTokensZone from './LiquidityTokensZone';
import ValueProcessor from '../utils/ValueProcessor';
import swapApi from '../requests/swapApi';
import extRequests from '../requests/extRequests';

import img1 from '../../img/logo.png';
import img2 from '../../img/bry-logo.png';
import '../../css/swap-card.css';
import '../../css/font-style.css';

const valueProcessor = new ValueProcessor();

class SwapCard extends React.Component {
    constructor(props) {
        super(props);
        this.pairExists = false;
        this.readyToSubmit = false;
        this.activePair = {};
        this.rmPercents = 50;
        this.total_supply = 0;
        this.removeLiquidity = {
            ranges : [
                {
                    value : 25,
                    alias : '25%'
                },
                {
                    value : 50,
                    alias : '50%'
                },
                {
                    value : 75,
                    alias : '75%'
                },
                {
                    value : 100,
                    alias : 'MAX'
                }
            ]
        };
        this.updPooledAmount();
    };

    updPooledAmount () {
        setInterval(() => {
            this.countPooledAmount(this.activePair);
        }, 1000);
    };

    swapPair() {
        this.props.swapFields(this.props.menuItem);
    };

    changeBalance(field, hash) {
        this.props.assignBalanceObj(this.getMode(), field, utils.getBalanceObj(this.props.balances, hash));
    };

    setRemoveLiquidityValue(value) {
        this.rmPercents = value;
        this.props.assignCoinValue('removeLiquidity', 'ltfield', utils.countPortion(this.props.removeLiquidity.ltfield.balance.amount, value));
        this.countRemoveLiquidity(this.getMode(), 'ltfield');
    };

    removeRequest() {
        this.props.openWaitingConfirmation();
        extRequests.removeLiquidity(this.props.pubkey, this.props.removeLiquidity.ltfield.token.hash, this.props.removeLiquidity.ltfield.value)
        .then(result => {
            this.props.changeWaitingStateType('submitted');
        },
        error => {
            this.props.changeWaitingStateType('rejected');
        });
    };

    /* ================================ cards rendering functions ================================== */

    renderSwapCard () {
        let mode        = this.getMode();
        let langData    = this.props.langData;
        let modeStruct  = this.props[mode];
        let firstToken  = utils.getTokenObj(this.props.tokens, modeStruct.field0.token.hash);
        let secondToken = utils.getTokenObj(this.props.tokens, modeStruct.field1.token.hash);
        return (
            <>
                <div className={`p-4 ${((!this.props.liquidityMain && mode == 'liquidity') || mode == 'removeLiquidity') ? '' : 'bottom-line-1'}`}>
                    <div className='d-flex justify-content-between align-items-center'>
                        {/* ---------------------------------------- add-liquidity and remove-liquidity header ---------------------------------------- */}
                        { ((!this.props.liquidityMain && mode == 'liquidity') || mode == 'removeLiquidity') && 
                            <>
                                <span className='icon-Icon13 back-button hover-pointer' onClick={this.changeAddRemoveCards.bind(this, mode)}></span>
                                <h4 className='add-liquidity-header' id='swap-mode-header'>
                                    {langData[mode].secondHeader}
                                </h4>
                                <Tooltip text={langData.liquidity.tooltipText} />
                            </>
                        }

                        {/* ---------------------------------------- exchange or liquidity-main header ---------------------------------------- */}
                        { ((mode == 'liquidity' && this.props.liquidityMain) || mode == 'exchange') &&
                            <>
                                <div className="mr-3">
                                    <div className='h4' id='swap-mode-header'>
                                        {langData[mode].header}
                                    </div>
                                    <div id='under-header'>
                                        {langData[mode].description}
                                    </div>
                                </div>
                                <div className='d-flex justify-content-center align-items-center'>
                                    <div className='d-flex justify-content-center align-items-center'>
                                        <div className="control-container d-flex justify-content-center align-items-center mr-2">
                                            <Settings />
                                        </div>
                                        <div className="control-container d-flex justify-content-center align-items-center">
                                            <History />
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                    {/* ---------------------------------------- liquidity-main header-button ---------------------------------------- */}
                    { this.props.liquidityMain && mode == 'liquidity' &&
                        <button className='btn btn-secondary liquidity-btn py-3 px-5 mt-4' type='submit' onClick={this.changeAddRemoveCards.bind(this, mode)}>
                            {langData[mode].addButton}
                        </button>
                    }
                </div>
                <div className="p-4">
                    {/* ---------------------------------------- exchange or add-liquidity: body ---------------------------------------- */}
                    { ((mode == 'liquidity' && !this.props.liquidityMain) || mode == 'exchange') &&
                        <>
                            <div className='swap-input py-2 px-3' id='from'>
                                {this.getInputField({
                                    fieldName: langData[mode].input0,
                                    id : (mode == 'exchange') ? 0 : 2,
                                    fieldData : modeStruct.field0
                                })}
                            </div>
                            
                            { mode == 'exchange' && 
                                <div id='exch' className="d-flex justify-content-center align-items-center mx-auto my-3" onClick={this.swapPair.bind(this)}>
                                    <span className='icon-Icon13 exch-button hover-pointer' />
                                </div> ||
                                <span className='icon-Icon17 d-flex justify-content-center plus-liquidity my-4' />
                            }

                            <div className='swap-input py-2 px-3' id='to'>
                                {this.getInputField({
                                    fieldName: langData[mode].input1,
                                    id : (mode == 'exchange') ? 1 : 3,
                                    fieldData : modeStruct.field1
                                })}
                            </div>
                            <div className='py-2 px-3 d-flex justify-content-between align-items-center my-3'>
                                {/* <div>Coming soon</div>
                                <div>1%</div> */}
                            </div>
                            {/* ---------------------------------------- add-liquidity: exchange rate ---------------------------------------- */}
                            { !this.props.liquidityMain && mode == 'liquidity' &&
                                <>
                                    <div className='pool-prices my-3'>{langData[mode].priceAndPoolShare}</div>
                                    <div className='swap-input py-2 px-3 d-flex align-items-center justify-content-between mb-5'>
                                        <div>
                                            <div className='d-flex justify-content-center'>{this.showExchRate(false)}</div>
                                            <div className='d-flex justify-content-center'>{this.getExchangeText(langData[this.props.menuItem].per, true)}</div>
                                        </div>
                                        <div>
                                            <div className='d-flex justify-content-center'>{this.showExchRate(true)}</div>
                                            <div className='d-flex justify-content-center'>{this.getExchangeText(langData[this.props.menuItem].per, false)}</div>
                                        </div>
                                        <div>
                                            <div className='d-flex justify-content-center'>{this.showPoolShare()}</div>
                                            <div className='d-flex justify-content-center'>{langData[mode].shareOfPool}</div>
                                        </div>
                                    </div>
                                </>
                            }
                            { this.getSubmitButton() }
                        </>
                    }

                    {/* ---------------------------------------- liquidity-main: body ---------------------------------------- */}
                    { this.props.liquidityMain && mode == 'liquidity' &&
                        <>
                            <div className='your-liquidity-header d-flex justify-content-between align-items-center mb-2'>
                                <div>
                                    {langData[mode].yourLiquidity}
                                </div>
                                <Tooltip text='text'/> {/*langData.trade.tokenCard.tooltipText*/}
                            </div>
                            <div className='your-liquidity-field my-3'>
                                <LiquidityTokensZone changeBalance={this.changeBalance.bind(this)}/>
                            </div>
                            <div className='your-liquidity-header'>
                                {langData[mode].additionInfo}
                            </div>
                        </>
                    }
                    {/* ---------------------------------------- remove-liquidity: body ---------------------------------------- */}
                    { mode == 'removeLiquidity' &&
                        <>
                            <div className="p-3 border-solid-2 c-border-radius2 border-color2">
                                <div className="d-flex justify-content-between">
                                    <div>Amount</div>
                                    <div onClick={this.toggleView.bind(this)} className="hover-pointer no-selectable hover-color3">{ this.props.removeLiquiditySimpleView ? this.props.langData.removeLiquidity.detailed : this.props.langData.removeLiquidity.simple }</div>
                                </div>
                                <div className="h1 font-weight-bold my-3">{this.showPercents()}%</div>
                                {this.props.removeLiquiditySimpleView &&
                                    <div id="removeLiquidityRange" >
                                        <Form className="mb-4">
                                        <Form.Group controlId="formBasicRangeCustom">
                                            <Form.Control type="range"
                                                value= {this.rmPercents}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                onChange = {e => this.setRemoveLiquidityValue(e.target.value)} />
                                        </Form.Group>
                                        </Form>
                                        <div className="d-flex align-items-center justify-content-between">
                                            {this.removeLiquidity.ranges.map((item, index) => (
                                                <button key={index+''} className="btn btn-secondary px-3 py-1" onClick={this.setRemoveLiquidityValue.bind(this, item.value)}>{item.alias}</button>
                                            ))}
                                        </div>
                                    </div>
                                }
                            </div>
                            { this.renderRemoveLiquidity(modeStruct, firstToken, secondToken) }
                        </>
                    }
                    
                    {/* ---------------------------------------- remove-liquidity: bottom info and buttons ---------------------------------------- */}
                    { this.props.liquidityRemove && mode != 'exchange' &&
                        <>
                            <div className="d-flex align-items-start justify-content-between mb-3 mt-4">
                                <div>Price</div>
                                <div>
                                    <div>1 {firstToken.ticker} = {this.showExchRate(true)} {secondToken.ticker}</div>
                                    <div>1 {secondToken.ticker} = {this.showExchRate(false)} {firstToken.ticker}</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-center">
                                <button
                                    className='btn btn-secondary w-100 py-2'
                                    type='submit'
                                    id='submit'
                                    onClick={this.removeRequest.bind(this)}
                                    style={{backgroundColor : (this.props.connectionStatus) ? undefined : 'var(--color5)'}}>
                                    Remove liquidity
                                </button>
                            </div>
                        </>
                    }
                </div>
            </>
        );
    };

    renderRemoveLiquidity(modeStruct, firstToken, secondToken) {
        let amount_1 = Number(modeStruct.field0.value);
        let amount_2 = Number(modeStruct.field1.value);
        return (
            <>
                { this.props.removeLiquiditySimpleView &&
                    <>
                        <div className="text-center my-3">
                            <span className="icon-Icon13" style={{color: "var(--color4)"}}></span>
                        </div>
                        <div className="swap-input py-2 px-3">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>{valueProcessor.usCommasBigIntDecimals(amount_1.toFixed(), 10)}</div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <LogoToken data = {{url : img1, value : firstToken.ticker}}/>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>{valueProcessor.usCommasBigIntDecimals(amount_2.toFixed(), 10)}</div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <LogoToken data = {{url : img2, value : secondToken.ticker}}/>
                                </div>
                            </div>
                            <div className="text-right">
                                Receive
                            </div>
                        </div>
                    </>
                }
                { !this.props.removeLiquiditySimpleView &&
                    <>
                        <div className="mt-2">
                            <div className='swap-input py-2 px-3'>
                                {this.getInputField({
                                    fieldName: this.props.langData.removeLiquidity.input,
                                    id : 6,
                                    fieldData : modeStruct.ltfield
                                })}
                            </div>

                            <span className="icon-Icon13 d-flex justify-content-center my-3 text-color4" />

                            <div className='swap-input py-2 px-3 unclickable'>
                                {this.getInputField({
                                    fieldName: this.props.langData.removeLiquidity.input,
                                    id : 4,
                                    fieldData : modeStruct.field0
                                })}
                            </div>

                            <span className='icon-Icon17 d-flex justify-content-center plus-liquidity my-3 text-color4' />

                            <div className='swap-input py-2 px-3 unclickable'>
                                {this.getInputField({
                                    fieldName: this.props.langData.removeLiquidity.input,
                                    id : 5,
                                    fieldData :  modeStruct.field1
                                })}
                            </div>                      
                        </div>
                    </>
                }
            </>
        );    
    };

    getSubmitButton() {
        let names = this.props.langData.submitButton;
        let buttonName;
        if (this.props.connectionStatus == false)
            buttonName = names.beforeConnection;
        else {
            if (this.props.menuItem == 'exchange')
                buttonName = names.swap;
            else if (this.props.menuItem == 'liquidity')
                buttonName = names.addLiquidity;
            if (!this.readyToSubmit) {
                buttonName = names.fillAllFields;
            }
            if (this.pairExists == false) {
                buttonName = (!this.readyToSubmit) ? names.fillAllFields : names.createPair;
                return (
                    <div>
                        <div className='about-button-info d-flex justify-content-center align-items-center w-100'>
                            { this.props.t('trade.swapCard.aboutButtonInfo.withoutPair') }
                        </div>
                        <button
                            className='btn btn-secondary alt-submit w-100 py-2'
                            onClick={this.openConfirmCard.bind(this)}
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
                className='btn btn-secondary w-100 py-2'
                type='submit'
                id='submit'
                onClick={this.openConfirmCard.bind(this)}
                style={{backgroundColor : (this.props.connectionStatus) ? undefined : 'var(--color5)'}}>
                { buttonName }
            </button>
        );
    };

    getInputField(props) {
        return (
            <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className='input-name'>
                        {props.fieldName}
                    </div>
                    <div className='my-token-amount d-flex justify-content-end'>
                        {this.showBalance(valueProcessor.usCommasBigIntDecimals(props.fieldData.balance.amount, props.fieldData.balance.decimals, 3))}
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                    <input id={props.id}
                        onChange={this.changeField.bind(this, props.id)}
                        className='c-input-field'
                        type='text'
                        value={props.fieldData.value}
                        placeholder='0.0'
                        autoComplete='off'>
                    </input>
                    <div className={`token-button hover-pointer d-flex align-items-center justify-content-end`} onClick={this.openTokenList.bind(this, props.id)}>
                        <div className='d-flex align-items-center mr-2'>{props.fieldData.token.ticker}</div>
                        <span className='icon-Icon26 d-flex align-items-center chevron-down'></span>
                    </div>                
                </div>
            </div>
        );
    };

    renderTokenCard() {
        if (this.props.tokenListStatus)
            return (
                <>
                    <TokenCard
                        changeBalance={this.changeBalance.bind(this)}
                        getMode={this.getMode.bind(this)}
                        useSuspense={false} />
                </>
            );
    };

    /* ============================ data calculation and filtration ============================= */

    showPoolShare () {
        let res =  utils.countPoolShare(this.activePair, this.props.liquidity, true) + ''; //
        if (res < 0.001 && res != '-')
            res = '< 0.001';
        if (res == Infinity)
            res = '-';
        return res.substring(0, 7) + ' %';
    };

    showBalance (balance) {
        return (balance == '-') ? balance : `Balance: ${balance}`;
    };

    showExchRate (firstToken) {
        let res = utils.countExchangeRate(this.activePair, firstToken, this.props[this.getMode()]) + '';
        return res.substring(0, 6);
    };

    removeEndZeros (value) {
        if (value == 0)
            return '0';
        if ((/\.[0-9]*0+$/).test(value)) {
            value = value.replace(/0*$/, '');
            if (value[value.length-1] == '.')
                value = value.slice(0, value.length-1);
        }
        return value;
    };

    showPercents () {
        let fixedLength = 1;
        let result = Number(this.rmPercents).toFixed(fixedLength);
        if (result == 0)
            return `< 0.${'0'.repeat(fixedLength - 1)}1`;
        return result;
    };

    getMode () {
        let item = this.props.menuItem;
        if (item == 'exchange') 
            return 'exchange';
        else if (item == 'liquidity' && !this.props.liquidityRemove)
            return 'liquidity';
        else {
            return 'removeLiquidity';
        }
    };

    getFieldName(fieldId, counter) {
        if (fieldId == 6)
            return 'ltfield';
        if (fieldId % 2 == 0)
            return (counter) ? 'field1' : 'field0';
        else
            return (counter) ? 'field0' : 'field1';
    };

    changeField(fieldId) {
        let mode = this.getMode();
        let field = this.getFieldName(fieldId);
        let value = this.props[mode][field].value;
        if (['insertText', 'deleteContentBackward', 'deleteContentForward'].indexOf(event.inputType) !== -1) {
            if (document.getElementById(fieldId).value == '.')
                value = '0.';
            if (event.inputType == 'insertText' && !(new RegExp('[0-9|\\.|\\,]+')).test(event.data)) {
                // nothing to do. this.updCardInternals() will save you previous number
            } else if (event.inputType == 'deleteContentBackward' || event.inputType == 'deleteContentForward') {
                value = document.getElementById(fieldId).value;
            } else {
                let newVal = document.getElementById(fieldId).value;
                if ((new RegExp('^[0-9|,]+\\.?[0-9]*$')).test(newVal) && !(new RegExp('^0(0)+')).test(newVal)) {
                    if ((/.*\..*/).test(newVal)) {
                        value = newVal;
                    } else {
                        value = this.removeEndZeros(valueProcessor.usCommasBigIntDecimals(valueProcessor.valueToBigInt(newVal.replace(/,/g,"")).value));
                    }
                }
            }
        } else if (['deleteWordBackward', 'deleteWordForward'].indexOf(event.inputType) !== -1) {
            value = document.getElementById(fieldId).value;
        } else { }
        this.props.assignCoinValue(mode, field, value);
        value = value.replace(/,/g,"");
        let fieldObj = this.props[mode][field];
        fieldObj.value = value;
        this.countCounterField(fieldObj, this.getFieldName(fieldId, true), (mode == 'removeLiquidity') ? true : false, field);
        this.establishReadiness();
    };

    isValidPercent (rmPercent) {
        if (rmPercent > 100)
            return false;
        return true;
    };

    countPrice(activeField, counterField, pair) {
        let decimals = [activeField.balance.decimals, counterField.balance.decimals];
        if (activeField.token.hash != pair.token_0.hash) 
            [decimals[0], decimals[1]] = [decimals[1], decimals[0]];
        let volume0  = {
            value : BigInt(pair.token_0.volume),
            decimals : decimals[0]
        };
        let volume1  = {
            value : BigInt(pair.token_1.volume),
            decimals : decimals[1]
        };
        let amountIn = valueProcessor.valueToBigInt(activeField.value, activeField.balance.decimals);

        if (this.props.menuItem == 'exchange') {
            if (activeField.token.hash == pair.token_0.hash)
                return testFormulas.getSwapPrice(volume0, volume1, amountIn);
            else
                return testFormulas.getSwapPrice(volume1, volume0, amountIn);
        } else {
            if (activeField.token.hash == pair.token_0.hash)
                return testFormulas.getAddLiquidityPrice(volume0, volume1, amountIn);
            else
                return testFormulas.getAddLiquidityPrice(volume1, volume0, amountIn);
        }
    };

    countCounterField(activeField, cField, removeLiquidity, aField) {
        let mode = this.getMode();
        if (!this.pairExists)
            return;
        if (activeField.value == '') {
            this.props.assignCoinValue(mode, cField, '');
            return;
        }
        let counterField = this.props[this.getMode()][cField];
        if (activeField.token.ticker !== presets.swapTokens.emptyToken.ticker && counterField.token.ticker !== presets.swapTokens.emptyToken.ticker) {
            if (this.activePair === undefined) {
                return;
            }
            if (removeLiquidity) {
                this.countRemoveLiquidity(mode, aField);
            } else {
                let counterFieldPrice = this.countPrice(activeField, counterField, this.activePair);
                counterFieldPrice = valueProcessor.usCommasBigIntDecimals(counterFieldPrice.value, counterFieldPrice.decimals);
                counterFieldPrice = this.removeEndZeros(counterFieldPrice);
                this.props.assignCoinValue(mode, cField, counterFieldPrice);
            }
        }
    };

    countPooledAmount (pair) {
        if (pair.lt == undefined)
            return;
        swapApi.getTokenInfo(pair.lt)
        .then(res => {
            if (!res.lock) {
                res.json()
                .then(total => {
                    if (Array.isArray(total) && total.length) {
                        this.total_supply = total[0].total_supply;
                    }
                })
            }
        })
    };

    countRemoveLiquidity (mode, cField, forcedLt) {
        let counted = testFormulas.ltDestruction(this.activePair, this.total_supply, {
            amount_1  : this.props.removeLiquidity.field0.value,
            amount_2  : this.props.removeLiquidity.field1.value,
            amount_lt : (forcedLt) ? forcedLt : this.props.removeLiquidity.ltfield.value
        }, cField);
        let rmPercent = utils.countPercentsByPortion(this.props.removeLiquidity.ltfield.balance.amount, counted.amount_lt).toFixed(1);
        if (!this.isValidPercent(rmPercent)) {
            let full = this.props.removeLiquidity.ltfield.balance.amount;
            this.rmPercents = 100;
            this.props.assignCoinValue(mode, 'ltfield', full);
            this.countRemoveLiquidity(mode, 'ltfield', full);
        } else {
            if (cField != 'field0')
                this.props.assignCoinValue(mode, 'field0',  counted.amount_1);
            if (cField != 'field1')
                this.props.assignCoinValue(mode, 'field1',  counted.amount_2);
            if (cField != 'ltfield')
                this.props.assignCoinValue(mode, 'ltfield', counted.amount_lt);
        }
    };

    getExchTokenName(name) {
        return (name == presets.swapTokens.emptyToken.ticker) ? '-' : name;
    };

    getExchangeText(langProp_Per_, firstPerSecond) {
        let first = this.getExchTokenName(this.props.liquidity.field0.token.ticker);
        let second = this.getExchTokenName(this.props.liquidity.field1.token.ticker);
        if (firstPerSecond)
            return `${first} ${langProp_Per_} ${second}`;
        else
            return `${second} ${langProp_Per_} ${first}`;
    };

    /* ================================ control cards rendering ================================= */
    openTokenList(fieldId) {
        this.props.updActiveField(this.getFieldName(fieldId));
        this.props.openTokenList();
    };

    closeTokenList() {
        this.props.closeTokenList();
        this.establishReadiness();
    }

    changeAddRemoveCards(mode) {
        if (mode == 'liquidity')
            this.props.changeLiquidityMode();
        else if (mode == 'removeLiquidity')
            this.props.changeRemoveLiquidityVisibility();
    };

    openConfirmCard() {
        if (this.props.connectionStatus && this.isReadyToSubmit())
            this.props.openConfirmCard();
    };

    toggleView() {
        // this.props.toggleRemoveLiquidityView();
    }

    /* =========================== rules checking for ConfirmCard opening ========================== */
    establishReadiness() {
        if (this.isReadyToSubmit())
            this.readyToSubmit = true;
        else
            this.readyToSubmit = false;
    };

    establishPairExistence() {
        let token0 = this.props[this.getMode()].field0.token;
        let token1 = this.props[this.getMode()].field1.token;
        this.activePair = utils.searchSwap(this.props.pairs, [token0, token1]);
        if (token0.hash == presets.swapTokens.emptyToken.hash || token1.hash == presets.swapTokens.emptyToken.hash) {
            this.pairExists = true; // make an exclusion for first page render
            return;
        }
        if (utils.searchSwap(this.props.pairs, [token0, token1]).pool_fee == undefined) {
            this.pairExists = false;
            this.props.changeCreatePoolState(true);
        } else {
            this.pairExists = true;
            this.props.changeCreatePoolState(false);
        }
    };

    isReadyToSubmit() {
        let mode = this.getMode();
        if (this.props[mode].field0.value != 0 &&
            this.props[mode].field1.value != 0 &&
            this.props[mode].field0.token.hash != undefined &&
            this.props[mode].field1.token.hash != undefined) {
            return true;
        }
        return false;
    };

    /* ================================== main rendering function ================================== */
    render() {
        this.establishReadiness();
        this.establishPairExistence();
        return (
            <div>
                { this.renderSwapCard()  }
                { this.renderTokenCard() }
                <Suspense fallback={<div>---</div>}>
                    <ConfirmSupply />
                </Suspense>    
            </div>
        );
    };
};

const WSwapCard = connect(mapStoreToProps(components.SWAP_CARD), mapDispatchToProps(components.SWAP_CARD))(withTranslation()(SwapCard));

export default WSwapCard;