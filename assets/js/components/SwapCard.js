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
        this.enoughMoney = [];
        this.insufficientFunds = false;
        this.activePair = {};
        this.rmPercents = 50;
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
    };

    swapPair() {
        this.props.swapFields(this.props.menuItem);
    };

    changeBalance(field, hash) {
        this.props.assignBalanceObj(this.getMode(), field, utils.getBalanceObj(this.props.balances, hash));
    };

    setRemoveLiquidityValue(value) {
        this.rmPercents = value;
        let newVal = this.props.removeLiquidity.ltfield.balance.amount;
        let newDecimals = this.props.removeLiquidity.ltfield.balance.decimals;
        let fieldObj = utils.countPortion({
            value : newVal,
            decimals : newDecimals
        }, value);
        this.assignCoinValueWithText('removeLiquidity', 'ltfield', fieldObj);
        this.countRemoveLiquidity(this.getMode(), 'ltfield', fieldObj);
    };

    removeRequest() {
        if (!this.pairExists)
            return;
        this.props.openWaitingConfirmation();
        extRequests.removeLiquidity(this.props.pubkey, this.props.removeLiquidity.ltfield.token.hash, this.props.removeLiquidity.ltfield)
        .then(result => {
            this.props.updCurrentTxHash(result.hash);
            this.props.changeWaitingStateType('submitted');
        }, () => {
            this.props.changeWaitingStateType('rejected');
        });
    };

    /* ================================ cards rendering functions ================================== */

    renderSwapCard () {
        const t = this.props.t;
        let dp = 'trade.swapCard'; // default place (in translation file)
        let mode        = this.getMode();
        let modeStruct  = this.props[mode];
        let firstToken  = utils.getTokenObj(this.props.tokens, modeStruct.field0.token.hash);
        let secondToken = utils.getTokenObj(this.props.tokens, modeStruct.field1.token.hash);
        return (
            <>
                <div className={`p-4 ${((!this.props.liquidityMain && mode === 'liquidity') || mode === 'removeLiquidity') ? '' : 'bottom-line-1'}`}>
                    <div className='d-flex justify-content-between align-items-center'>
                        {/* ---------------------------------------- add-liquidity and remove-liquidity header ---------------------------------------- */}
                        { ((!this.props.liquidityMain && mode === 'liquidity') || mode === 'removeLiquidity') &&
                            <>
                                <span className='icon-Icon13 back-button hover-pointer' onClick={this.changeAddRemoveCards.bind(this, mode)}/>
                                <h4 className='add-liquidity-header' id='swap-mode-header'>
                                    {t(dp + `.${mode}.header`)}
                                </h4>
                                <Tooltip text={t(dp + `.${mode}.tooltipText`)} />
                            </>
                        }

                        {/* ---------------------------------------- exchange or liquidity-main header ---------------------------------------- */}
                        { ((mode === 'liquidity' && this.props.liquidityMain) || mode === 'exchange') &&
                            <>
                                <div className="mr-3">
                                    <div className='h4' id='swap-mode-header'>
                                        {t(dp + `.${mode}.header`)}
                                    </div>
                                    <div id='under-header'>
                                        {t(dp + `.${mode}.description`)}
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
                    { this.props.liquidityMain && mode === 'liquidity' &&
                        <button className='btn btn-secondary liquidity-btn py-3 px-5 mt-4' type='submit' onClick={this.changeAddRemoveCards.bind(this, mode)}>
                            {t(dp + `.${mode}.addButton`)}
                        </button>
                    }
                </div>
                <div className="p-4">
                    {/* ---------------------------------------- exchange or add-liquidity: body ---------------------------------------- */}
                    { ((mode === 'liquidity' && !this.props.liquidityMain) || mode === 'exchange') &&
                        <>
                            <div className='swap-input py-2 px-3' id='from'>
                                {this.getInputField({
                                    fieldName: t(dp + `.${mode}.input0`),
                                    id : (mode === 'exchange') ? 0 : 2,
                                    fieldData : modeStruct.field0
                                })}
                            </div>
                            
                            { mode === 'exchange' &&
                                <div id='exch' className="d-flex justify-content-center align-items-center mx-auto my-3" onClick={this.swapPair.bind(this)}>
                                    <span className='icon-Icon13 exch-button hover-pointer' />
                                </div> ||
                                <span className='icon-Icon17 d-flex justify-content-center plus-liquidity my-4' />
                            }

                            <div className='swap-input py-2 px-3' id='to'>
                                {this.getInputField({
                                    fieldName: t(dp + `.${mode}.input1`),
                                    id : (mode === 'exchange') ? 1 : 3,
                                    fieldData : modeStruct.field1
                                })}
                            </div>
                            <div className='py-2 px-3 d-flex justify-content-between align-items-center my-3'>
                                {/* <div>Coming soon</div>
                                <div>1%</div> */}
                            </div>
                            {/* ---------------------------------------- add-liquidity: exchange rate ---------------------------------------- */}
                            { !this.props.liquidityMain && mode === 'liquidity' &&
                                <>
                                    <div className='pool-prices my-3'>{t(dp + `.${mode}.priceAndPoolShare`)}</div>
                                    <div className='swap-input py-2 px-3 d-flex align-items-center justify-content-between mb-5'>
                                        <div>
                                            <div className='d-flex justify-content-center'>{this.showExchangeRate(false)}</div>
                                            <div className='d-flex justify-content-center'>{this.getExchangeText(t(dp + `.${mode}.per`), true)}</div>
                                        </div>
                                        <div>
                                            <div className='d-flex justify-content-center'>{this.showExchangeRate(true)}</div>
                                            <div className='d-flex justify-content-center'>{this.getExchangeText(t(dp + `.${mode}.per`), false)}</div>
                                        </div>
                                        <div>
                                            <div className='d-flex justify-content-center'>{this.showPoolShare()}</div>
                                            <div className='d-flex justify-content-center'>{t(dp + `.${mode}.shareOfPool`)}</div>
                                        </div>
                                    </div>
                                </>
                            }
                            { this.getSubmitButton(modeStruct) }
                        </>
                    }

                    {/* ---------------------------------------- liquidity-main: body ---------------------------------------- */}
                    { this.props.liquidityMain && mode === 'liquidity' &&
                        <>
                            <div className='your-liquidity-header d-flex justify-content-between align-items-center mb-2'>
                                <div>
                                    {t(dp + `.${mode}.yourLiquidity`)}
                                </div>
                                <Tooltip text='text'/> {/*langData.trade.tokenCard.tooltipText*/}
                            </div>
                            <div className='your-liquidity-field my-3'>
                                <LiquidityTokensZone changeBalance={this.changeBalance.bind(this)}/>
                            </div>
                            <div className='your-liquidity-header'>
                                {t(dp + `.${mode}.additionInfo`)}
                            </div>
                        </>
                    }
                    {/* ---------------------------------------- remove-liquidity: body ---------------------------------------- */}
                    { mode === 'removeLiquidity' &&
                        <>
                            <div className="p-3 border-solid-2 c-border-radius2 border-color2">
                                <div className="d-flex justify-content-between">
                                    <div>Amount</div>
                                    <div onClick={this.toggleView.bind(this)} className="hover-pointer no-selectable hover-color3">{ this.props.removeLiquiditySimpleView ? t(dp + `.removeLiquidity.detailed`) : t(dp + `.removeLiquidity.simple`) }</div>
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
                    { this.props.liquidityRemove && mode !== 'exchange' &&
                        <>
                            <div className="d-flex align-items-start justify-content-between mb-3 mt-4">
                                <div>Price</div>
                                <div>
                                    <div>1 {firstToken.ticker} = {this.showExchangeRate(true)} {secondToken.ticker}</div>
                                    <div>1 {secondToken.ticker} = {this.showExchangeRate(false)} {firstToken.ticker}</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-center">
                                { this.getRemoveLiquidityButton(t) }
                            </div>
                        </>
                    }
                </div>
            </>
        );
    };

    getRemoveLiquidityButton (t) {
        let buttonName = 'removeLiquidity';
        if (!this.pairExists)
            buttonName = 'invalidPool';
        return (
            <button
                className='btn btn-secondary w-100 py-2'
                type='submit'
                id='submit'
                onClick={this.removeRequest.bind(this)}
                style={{backgroundColor : (this.props.connectionStatus) ? undefined : 'var(--color5)'}}>
                { t(`trade.swapCard.submitButton.${buttonName}`) }
            </button>
        );
    };

    renderRemoveLiquidity(modeStruct, firstToken, secondToken) {
        const t = this.props.t;
        let dp = 'trade.swapCard';
        return (
            <>
                { this.props.removeLiquiditySimpleView &&
                    <>
                        <div className="text-center my-3">
                            <span className="icon-Icon13" style={{color: "var(--color4)"}}/>
                        </div>
                        <div className="swap-input py-2 px-3">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>{this.showInputValue(modeStruct.field0.value)}</div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <LogoToken data = {{url : img1, value : firstToken.ticker}}/>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>{this.showInputValue(modeStruct.field1.value)}</div>
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
                                    fieldName: t(dp + `.removeLiquidity.input`),
                                    id : 6,
                                    fieldData : modeStruct.ltfield
                                })}
                            </div>

                            <span className="icon-Icon13 d-flex justify-content-center my-3 text-color4" />

                            <div className='swap-input py-2 px-3'>
                                {this.getInputField({
                                    fieldName: t(dp + `.removeLiquidity.input`),
                                    id : 4,
                                    fieldData : modeStruct.field0
                                })}
                            </div>

                            <span className='icon-Icon17 d-flex justify-content-center plus-liquidity my-3 text-color4' />

                            <div className='swap-input py-2 px-3'>
                                {this.getInputField({
                                    fieldName: t(dp + `.removeLiquidity.input`),
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

    getSubmitButton(modeStruct) {
        const t = this.props.t;
        let buttonName;
        if (this.props.connectionStatus === false)
            buttonName = 'beforeConnection';
        else {
            if (this.props.menuItem === 'exchange')
                buttonName = 'swap';
            else if (this.props.menuItem === 'liquidity')
                buttonName = 'addLiquidity';
            if (!this.readyToSubmit)
                buttonName = 'fillAllFields';
            let id0 = this.enoughMoney.indexOf(modeStruct.field0.id);
            let id1 = this.enoughMoney.indexOf(modeStruct.field1.id);
            if (id0 !== -1 || id1 !== -1) {
                buttonName = 'insufficientFunds';
                this.insufficientFunds = true;
            } else 
                this.insufficientFunds = false;
            if (this.pairExists === false) {
                buttonName = (!this.readyToSubmit) ? 'fillAllFields' : 'createPair';
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
                            { t(`trade.swapCard.submitButton.${buttonName}`) }
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
                { t(`trade.swapCard.submitButton.${buttonName}`) }
            </button>
        );
    };

    getBalanceColor (id) {
        let c_color = { danger : '#CD5C5C', simple : '#61c2d0' };
        let danger = { color : c_color.danger }, simple = { color : c_color.simple };
        if (id === 4 || id === 5)
            return simple;
        if (this.enoughMoney.indexOf(id) === -1)
            return simple;
        else
            return danger;
    };

    getInputField(props) {
        let ticker = props.fieldData.token.ticker;
        if (ticker === undefined)
            ticker = this.props.t('trade.swapCard.inputField.selectToken');
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
                        value={this.showInputValue(props.fieldData.value)}
                        placeholder='0.0'
                        autoComplete='off'
                        style={this.getBalanceColor(props.id)}>
                    </input>
                    <div className={`token-button hover-pointer d-flex align-items-center justify-content-end`} onClick={this.openTokenList.bind(this, props.id)}>
                        <div className='d-flex align-items-center mr-2'>{ticker}</div>
                        <span className='icon-Icon26 d-flex align-items-center chevron-down'/>
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

    showInputValue(valueObj) {
        // make rules for showing numbers acording to national standarts
        let res;
        if (valueObj.text !== undefined)
            if (valueObj.text !== '')
                res = utils.removeEndZeros(valueObj.text);
        else
            res = '';
        return res;
    }

    showPoolShare () {
        let res =  utils.countPoolShare(this.activePair, {
            value0 : this.props.liquidity.field0.value,
            value1 : this.props.liquidity.field1.value
        }, this.props.balances, true);
        if (res === undefined)
            return '-';
        if (res < 0.001)
            res = '< 0.001';
        return res.substring(0, 7) + ' %';
    };

    showBalance (balance) {
        return (balance === '-') ? balance : `${this.props.t('trade.swapCard.inputField.balance')}: ${balance}`;
    };

    showExchangeRate (firstToken) {
        return utils.countExchangeRate(this.activePair, firstToken, this.props[this.getMode()]);
    };

    showPercents () {
        let fixedLength = 1;
        let result = '-';
        if (!Number.isNaN(this.rmPercents))
            result = Number(this.rmPercents).toFixed(fixedLength);
        if (result == 0)
            return `< 0.${'0'.repeat(fixedLength - 1)}1`;
        return result;
    };

    getMode () {
        let item = this.props.menuItem;
        if (item === 'exchange')
            return 'exchange';
        else if (item === 'liquidity' && !this.props.liquidityRemove)
            return 'liquidity';
        else {
            return 'removeLiquidity';
        }
    };

    getFieldName(fieldId, counter) {
        if (fieldId === 6)
            return 'ltfield';
        if (fieldId % 2 === 0)
            return (counter) ? 'field1' : 'field0';
        else
            return (counter) ? 'field0' : 'field1';
    };

    changeField (fieldId) {
        let mode = this.getMode();
        let field = this.getFieldName(fieldId);
        let defaultVal = this.props[mode][field].value.text;
        let value;

        if ('insertText' === event.inputType) {
            let newVal = document.getElementById(fieldId).value;
            if ((new RegExp('[0-9|\\.|,]+')).test(event.data)) {
                if ((new RegExp('^[0-9]+(\\.|,)?[0-9]*$')).test(newVal) && !(new RegExp('^0(0)+')).test(newVal))
                    value = newVal.replace(',','.');
                else if (newVal === '.' || newVal === ',')
                    value = '0.';
                else
                    value = defaultVal
            } else
                value = defaultVal;
        } else if (['deleteContentBackward', 'deleteContentForward', 'deleteWordBackward', 'deleteWordForward'].indexOf(event.inputType) !== -1) {
            value = document.getElementById(fieldId).value;
        }
        
        let newValObj;
        let decimals = this.props[mode][field].token.decimals;
        if (value === undefined) {
            newValObj = {};
        } else {
            if (decimals === undefined)
                decimals = 10;
            newValObj = {
                value : valueProcessor.valueToBigInt(value, decimals).value,
                decimals : decimals,
                text : value
            };
        }
        this.props.assignCoinValue(mode, field, newValObj);
        let fieldObj = this.props[mode][field];
        fieldObj.value = newValObj;
        this.countCounterField(fieldObj, this.getFieldName(fieldId, true), mode === 'removeLiquidity', field);
        this.establishReadiness();
    }

    isValidPercent (rmPercent) {
        return Number(rmPercent) <= 100;
    };

    countPrice(activeField, counterField, pair) {
        let decimals = [activeField.balance.decimals, counterField.balance.decimals];
        if (activeField.token.hash !== pair.token_0.hash)
            [decimals[0], decimals[1]] = [decimals[1], decimals[0]];
        let volume0  = {
            value : BigInt(pair.token_0.volume),
            decimals : decimals[0]
        };
        let volume1  = {
            value : BigInt(pair.token_1.volume),
            decimals : decimals[1]
        };
        let amountIn = activeField.value;

        if (this.props.menuItem === 'exchange') {
            if (activeField.token.hash === pair.token_0.hash)
                return testFormulas.getSwapPrice(volume0, volume1, amountIn);
            else
                return testFormulas.getSwapPrice(volume1, volume0, amountIn);
        } else {
            if (activeField.token.hash === pair.token_0.hash)
                return testFormulas.getAddLiquidityPrice(volume1, volume0, amountIn);
            else
                return testFormulas.getAddLiquidityPrice(volume0, volume1, amountIn);
        }
    };

    countCounterField(fieldObj, cField, removeLiquidity, aField) {
        let mode = this.getMode();
        if (!this.pairExists)
            return;
        if (fieldObj.value.value === undefined)
            return;
        let counterField = this.props[mode][cField];
        if (fieldObj.token.ticker !== presets.swapTokens.emptyToken.ticker && counterField.token.ticker !== presets.swapTokens.emptyToken.ticker) {
            if (this.activePair === undefined) {
                return;
            }
            if (removeLiquidity) {
                this.countRemoveLiquidity(mode, aField, fieldObj.value);
            } else {
                let counterFieldPrice = this.countPrice(fieldObj, counterField, this.activePair);
                this.props.assignCoinValue(mode, cField, {
                    value : counterFieldPrice.value,
                    decimals : counterFieldPrice.decimals,
                    text : this.bigIntToString(counterFieldPrice.value, counterFieldPrice.decimals)
                });
            }
        }
    };

    assignCoinValueWithText (mode, field, value) {
        value.text = this.bigIntToString(value.value, value.decimals);
        this.props.assignCoinValue(mode, field, value);
    }

    bigIntToString (value, decimals, fixed) {
        let res = valueProcessor.usCommasBigIntDecimals(value, decimals, fixed);
        if (res !== undefined)
            return res.replace(/,/g, '');
        else
            return undefined;
    }

    countRemoveLiquidity (mode, cField, fieldValue, forcedLt) {
        let counted = testFormulas.ltDestruction(this.props.tokens, this.activePair, {
            t0 : this.props.removeLiquidity.field0.value,
            t1 : this.props.removeLiquidity.field1.value,
            lt : {
                value : (forcedLt) ? forcedLt : fieldValue.value,
                decimals : fieldValue.decimals,
                total_supply : {
                    value : this.props.removeLiquidity.ltfield.token.total_supply,
                    decimals : this.props.removeLiquidity.ltfield.token.decimals
                }
            }
        }, cField);
        let balanceObj = {value : this.props.removeLiquidity.ltfield.balance.amount, decimals : this.props.removeLiquidity.ltfield.balance.decimals};
        let rmPercent = utils.countPercentsByPortion(balanceObj, counted.lt);
        if (!this.isValidPercent(rmPercent) && forcedLt === undefined) {
            let full = this.props.removeLiquidity.ltfield.balance.amount;
            this.rmPercents = 100;
            this.props.assignCoinValue(mode, 'ltfield', {
                value : full,
                decimals : fieldValue.decimals,
                text : this.bigIntToString(full, fieldValue.decimals)
            });
            this.countRemoveLiquidity(mode, 'ltfield', fieldValue, full);
        } else {
            this.rmPercents = rmPercent;
            if (cField !== 'field0')
                this.assignCoinValueWithText(mode, 'field0',  counted.t0);
            if (cField !== 'field1')
                this.assignCoinValueWithText(mode, 'field1',  counted.t1);
            if (cField !== 'ltfield')
                this.assignCoinValueWithText(mode, 'ltfield', counted.lt);
        }
    };

    getExchTokenName(name) {
        return (name === presets.swapTokens.emptyToken.ticker) ? '-' : name;
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
        if (mode === 'liquidity')
            this.props.changeLiquidityMode();
        else if (mode === 'removeLiquidity')
            this.props.changeRemoveLiquidityVisibility();
    };

    openConfirmCard() {
        if (this.props.connectionStatus && this.getReadinessState() && !this.insufficientFunds)
            this.props.openConfirmCard();
    };

    toggleView() {
        this.props.toggleRemoveLiquidityView();
    }

    /* =========================== rules checking for ConfirmCard opening ========================== */
    establishReadiness() {
        this.countBadBalance();
        this.readyToSubmit = this.getReadinessState();
    };

    establishPairExistence() {
        let mode = this.getMode();
        let token0 = this.props[mode].field0.token;
        let token1 = this.props[mode].field1.token;
        this.activePair = utils.searchSwap(this.props.pairs, [token0, token1], (mode === 'removeLiquidity') ? this.props[mode].ltfield.token.hash : undefined);
        if (token0.hash === presets.swapTokens.emptyToken.hash || token1.hash === presets.swapTokens.emptyToken.hash) {
            this.pairExists = true; // make an exclusion for first page render
            return;
        }
        if (this.activePair.pool_fee === undefined) {
            this.pairExists = false;
            this.props.changeCreatePoolState(true);
        } else {
            this.pairExists = true;
            this.props.changeCreatePoolState(false);
        }
    };

    pushBadBalanceId (id) {
        let i = this.enoughMoney.indexOf(id);
        if (i === -1)
            this.enoughMoney.push(id);
    };

    popBadBalanceId (id) {
        let i = this.enoughMoney.indexOf(id);
        if (i !== -1)
            this.enoughMoney.splice(i, 1);
    }

    countBadBalance () {
        let mode = this.getMode();
        let f0 = this.props[mode].field0;
        let f1 = this.props[mode].field1;
        let balance0 = {value : f0.balance.amount, decimals : f0.balance.decimals};
        let balance1 = {value : f1.balance.amount, decimals : f1.balance.decimals};
        let substraction0, substraction1;
        try {
            substraction0 = valueProcessor.sub(balance0, f0.value);
            substraction1 = valueProcessor.sub(balance1, f1.value);
        } catch (e) {
            return;
        }
        if (substraction0.value < 0)
            this.pushBadBalanceId(f0.id);
        else
            this.popBadBalanceId(f0.id);
        if (substraction1.value < 0)
            this.pushBadBalanceId(f1.id);
        else 
            this.popBadBalanceId(f1.id);
    };

    getReadinessState() {
        let mode = this.getMode();
        let f0 = this.props[mode].field0, f1 = this.props[mode].field1;
        return (f0.value.value !== undefined && f0.value.value != 0) &&
               (f1.value.value !== undefined && f1.value.value != 0) &&
                f0.token.hash  !== undefined &&
                f1.token.hash  !== undefined;
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
}

const WSwapCard = connect(mapStoreToProps(components.SWAP_CARD), mapDispatchToProps(components.SWAP_CARD))(withTranslation()(SwapCard));

export default WSwapCard;