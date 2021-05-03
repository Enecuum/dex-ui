import React from 'react';
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
import swapApi from '../requests/swapApi'

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
        this.rmPersents = 50;
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

    swapPair() {
        this.props.swapFields(this.props.menuItem);
    };

    changeBalance(field, hash) {
        this.props.assignBalanceObj(this.getMode(), field, utils.getBalanceObj(this.props.balances, hash));
    };

    renderBalance (balance) {
        return (balance == '-') ? balance : `Balance: ${balance}`;
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

    getInputField(props) {
        return (
            <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className='input-name'>
                        {props.fieldName}
                    </div>
                    <div className='my-token-amount d-flex justify-content-end'>
                        {this.renderBalance(valueProcessor.usCommasBigIntDecimals(props.fieldData.balance.amount, props.fieldData.balance.decimals, 3))}
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

    getFieldName(fieldId, counter) {
        if (fieldId == 6)
            return 'ltfield';
        if (fieldId % 2 == 0)
            return (counter) ? 'field1' : 'field0';
        else
            return (counter) ? 'field0' : 'field1';
    };

    openTokenList(fieldId) {
        this.props.updActiveField(this.getFieldName(fieldId));
        this.props.openTokenList();
    };

    closeTokenList() {
        this.props.closeTokenList();
        this.establishReadiness();
    }

    changeField(fieldId) {
        let mode = this.getMode();
        let field = this.getFieldName(fieldId);
        let value = this.props[mode][field].value;
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
        value = value.replace(/,/g,"");
        let fieldObj = this.props[mode][field];
        fieldObj.value = value;
        this.props.assignCoinValue(mode, field, value);
        this.establishReadiness();
        this.countCounterField(fieldObj, field, (mode == 'removeLiquidity') ? true : false);
    };

    establishReadiness() {
        if (this.isReadyToSubmit())
            this.readyToSubmit = true;
        else
            this.readyToSubmit = false;
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

    countPrice(activeField, counterField, pair) {
        let decimals = [activeField.balance.decimals, counterField.balance.decimals];
        if (activeField.token.hash != pair.token_0.hash) 
            [decimals[0], decimals[1]] = [decimals[1], decimals[0]];
        let volume0  = valueProcessor.valueToBigInt(pair.token_0.volume, decimals[0]);
        let volume1  = valueProcessor.valueToBigInt(pair.token_1.volume, decimals[1]);
        let amountIn = valueProcessor.valueToBigInt(activeField.value,   activeField.balance.decimals);

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

    countCounterField(activeField, cField, removeLiquidity) {
        let mode = this.getMode();
        if (!this.pairExists)
            return;
        if (activeField.value == '') {
            this.props.assignCoinValue(mode, cField, activeField.value);
            return;
        }
        let counterField = this.props[this.getMode()][cField];
        if (activeField.token.ticker !== presets.swapTokens.emptyToken.ticker && counterField.token.ticker !== presets.swapTokens.emptyToken.ticker) {
            if (this.activePair === undefined) {
                return;
            }
            if (removeLiquidity) 
                this.countRemoveLiquidity(mode, cField);
            else {
                let counterFieldPrice = this.countPrice(activeField, counterField, this.activePair);
                if (!counterFieldPrice)
                    counterFieldPrice = '';
                this.props.assignCoinValue(mode, cField, counterFieldPrice);
            }
        }
    };

    renderTokenCard() {
        if (this.props.tokenListStatus)
            return (
                <>
                    <TokenCard
                        changeBalance={this.changeBalance.bind(this)}
                        useSuspense={false} />
                </>
            );
    };

    renderExchangeCard() {
        let mode = this.getMode();
        return (
            <>
                <div className="p-4 bottom-line-1">
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className="mr-3">
                            <div className='h4' id='swap-mode-header'>
                                {this.props.langData[mode].header}
                            </div>
                            <div id='under-header'>
                                {this.props.langData[mode].description}
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
                    </div>
                </div>
                <div className="p-4">
                    <div className='swap-input py-2 px-3' id='from'>
                        {this.getInputField({
                            fieldName: this.props.langData[mode].input0,
                            id : 0,
                            fieldData : this.props[mode].field0
                        })}
                    </div>
                    <div id='exch' className="d-flex justify-content-center align-items-center mx-auto my-3" onClick={this.swapPair.bind(this)}>
                        <span className='icon-Icon13 exch-button hover-pointer' />
                    </div>
                    <div className='swap-input py-2 px-3' id='to'>
                        {this.getInputField({
                            fieldName: this.props.langData[mode].input1,
                            id : 1,
                            fieldData : this.props[mode].field1
                        })}
                    </div>
                    <div className='py-2 px-3 d-flex justify-content-between align-items-center my-3'>
                        {/* <div>Coming soon</div>
                        <div>1%</div> */}
                    </div>
                    { this.getSubmitButton() }
                </div>    
            </>
        );
    };

    renderMainLiquidityCard() {
        let mode = this.getMode();
        return (
            <>
                <div className="p-4 bottom-line-1">
                    <div className='d-flex justify-content-between align-items-center mb-4'>
                        <div className="mr-3">
                            <div className='h4' id='swap-mode-header'>
                                {this.props.langData[mode].header}
                            </div>
                            <div id='under-header'>
                                {this.props.langData[mode].description}
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
                    </div>
                    <button className='btn btn-secondary liquidity-btn py-3 px-5' type='submit' onClick={this.changeLiquidityCard.bind(this)}>
                        {this.props.langData[mode].addButton}
                    </button>                    
                </div>
                <div className="p-4">    
                    <div className='your-liquidity-header d-flex justify-content-between align-items-center mb-2'>
                        <div>
                            {this.props.langData[mode].yourLiquidity}
                        </div>
                        <Tooltip text='text'/> {/*this.props.langData.trade.tokenCard.tooltipText*/}
                    </div>
                    <div className='your-liquidity-field my-3'>
                        <LiquidityTokensZone changeBalance={this.changeBalance.bind(this)}/>
                    </div>
                    <div className='your-liquidity-header'>
                        {this.props.langData[mode].additionInfo}
                    </div>
                </div>
            </>
        );
    };

    showExchRate (firstToken) {
        let res = utils.countExchangeRate(this.activePair, firstToken, this.props.liquidity) + '';
        return res.substring(0, 6);
    };

    showPullShare () {
        let res =  utils.countPoolShare(this.activePair, this.props.liquidity) + '';
        if (res < 0.001 && res != '-')
            res = '< 0.001';
        if (res == Infinity)
            res = '-';
        return res.substring(0, 7) + ' %';
    };

    renderAddLiquidityCard() {
        let mode = this.getMode();
        let langData = this.props.langData;
        let langProp_Per_ = langData[mode].per;
        return (
            <div className="p-4">
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <span className='icon-Icon13 back-button hover-pointer' onClick={this.changeLiquidityCard.bind(this)}></span>
                    <h4 className='add-liquidity-header' id='swap-mode-header'>
                        {this.props.langData[mode].secondHeader}
                    </h4>
                    <Tooltip text={this.props.langData.liquidity.tooltipText} />
                </div>
                <div className='swap-input py-2 px-3' id='from'>
                    {this.getInputField({
                        fieldName: langData[mode].input0,
                        id : 2,
                        fieldData : this.props[mode].field0
                    })}
                </div>
                <span className='icon-Icon17 d-flex justify-content-center plus-liquidity my-4' />
                <div className='swap-input py-2 px-3' id='to'>
                    {this.getInputField({
                        fieldName: langData[mode].input1,
                        id : 3,
                        fieldData : this.props[mode].field1
                    })}
                </div>
                <div className='pool-prices my-3'>{this.props.langData[mode].priceAndPoolShare}</div>
                <div className='swap-input py-2 px-3 d-flex align-items-center justify-content-between mb-5'>
                    <div>
                        <div className='d-flex justify-content-center'>{this.showExchRate(false)}</div>
                        <div className='d-flex justify-content-center'>{this.getExchangeText(langProp_Per_, true)}</div>
                    </div>
                    <div>
                        <div className='d-flex justify-content-center'>{this.showExchRate(true)}</div>
                        <div className='d-flex justify-content-center'>{this.getExchangeText(langProp_Per_, false)}</div>
                    </div>
                    <div>
                        <div className='d-flex justify-content-center'>{this.showPullShare()}</div>
                        <div className='d-flex justify-content-center'>{langData[mode].shareOfPool}</div>
                    </div>
                </div>
                { this.getSubmitButton() }
            </div>
        );
    };

    countRemoveLiquidity (mode, cField) {
        let counted = testFormulas.ltDestruction(this.activePair, this.total_supply, {
            amount_1  : this.props.removeLiquidity.field0.value,
            amount_2  : this.props.removeLiquidity.field1.value,
            amount_lt : this.props.removeLiquidity.ltfield.value
        }, cField);
        this.props.assignCoinValue(mode, 'field0',  counted.amount_1);
        this.props.assignCoinValue(mode, 'field1',  counted.amount_2);
        this.props.assignCoinValue(mode, 'ltfield', counted.amount_lt);
    };

    updPooledAmount () {
        setInterval(() => {
            this.countPooledAmount(this.activePair);
        }, 1000);
    };

    countPooledAmount (pair) {
        let mode = this.getMode();
        swapApi.getTokenInfo(pair.lt)
        .then(res => {
            res.json()
            .then(total => {
                if (Array.isArray(total) && total.length) {
                    this.total_supply = total[0].total_supply;
                    this.countRemoveLiquidity(mode, 'ltfield');
                }
            })
        })
    };

    renderRemoveLiquidity() {
        let modeStruct  = this.props.removeLiquidity;
        let firstToken  = utils.getTokenObj(this.props.tokens, modeStruct.field0.token.hash);
        let secondToken = utils.getTokenObj(this.props.tokens, modeStruct.field1.token.hash);
        return (
            <div className="p-4">
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <span className='icon-Icon13 back-button hover-pointer' onClick={this.props.changeRemoveLiquidityVisibility.bind(this.props)}></span>
                    <h4 className='add-liquidity-header' id='swap-mode-header'>
                        {this.props.langData.removeLiquidity.header}
                    </h4>
                    <Tooltip text={this.props.langData.removeLiquidity.tooltipText} />
                </div>
                <div className="p-3 border-solid-2 c-border-radius2 border-color2">
                    <div className="d-flex justify-content-between">
                        <div>Amount</div>
                        <div onClick={this.toggleView.bind(this)} className="hover-pointer no-selectable hover-color3">{ this.props.removeLiquiditySimpleView ? this.props.langData.removeLiquidity.detailed : this.props.langData.removeLiquidity.simple }</div>
                    </div>
                    <div className="h1 font-weight-bold my-3">{this.rmPersents}%</div>
                    {this.props.removeLiquiditySimpleView &&
                        <div id="removeLiquidityRange" >
                            <Form className="mb-4">
                              <Form.Group controlId="formBasicRangeCustom">
                                <Form.Control type="range"
                                    value= {this.rmPersents}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    onChange = {e => this.setRemoveLiquidityValue(e.target.value)} />
                              </Form.Group>
                            </Form>
                            <div className="d-flex align-items-center justify-content-between">
                                {this.removeLiquidity.ranges.map((item, index) => (
                                    <button className="btn btn-secondary px-3 py-1" onClick={this.setRemoveLiquidityValue.bind(this, item.value)}>{item.alias}</button>
                                ))}
                            </div>
                        </div>
                    }                       
                </div>
                { this.props.removeLiquiditySimpleView &&
                    <>
                        <div className="text-center my-3">
                            <span className="icon-Icon13" style={{color: "var(--color4)"}}></span>
                        </div>
                        <div className="swap-input py-2 px-3">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>{modeStruct.field0.value}</div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <LogoToken data = {{url : img1, value : firstToken.ticker}}/>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>{modeStruct.field1.value}</div>
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
                    <div className="mt-2">
                        <div className='swap-input py-2 px-3'>
                            {this.getInputField({
                                fieldName: this.props.langData.removeLiquidity.input,
                                id : 6,
                                fieldData : modeStruct.ltfield
                            })}
                        </div>

                        <span className="icon-Icon13 d-flex justify-content-center my-3 text-color4" />

                        <div className='swap-input py-2 px-3'>
                            {this.getInputField({
                                fieldName: this.props.langData.removeLiquidity.input,
                                id : 4,
                                fieldData : modeStruct.field0
                            })}
                        </div>

                        <span className='icon-Icon17 d-flex justify-content-center plus-liquidity my-3 text-color4' />

                        <div className='swap-input py-2 px-3'>
                            {this.getInputField({
                                fieldName: this.props.langData.removeLiquidity.input,
                                id : 5,
                                fieldData :  modeStruct.field1
                            })}
                        </div>                      
                    </div>
                }
                <div className="d-flex align-items-start justify-content-between mb-3 mt-4">
                    <div>Price</div>
                    <div>
                        <div>1 {firstToken.ticker} = {utils.countExchangeRate(this.activePair, false, this.props.removeLiquidity)} {secondToken.ticker}</div>
                        <div>1 {secondToken.ticker} = {utils.countExchangeRate(this.activePair, true, this.props.removeLiquidity)} {firstToken.ticker}</div>
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                    <button className="btn btn-secondary flex-fill mr-2">Approve</button>
                    <button className="btn btn-secondary flex-fill ml-2">Enter an amount</button>
                </div>
            </div>
        );    
    }

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

    changeLiquidityCard() {
        this.props.changeLiquidityMode();
    };

    renderLiquidityCard() {
        if (this.props.liquidityRemove)
            return this.renderRemoveLiquidity();
        else
            return (this.props.liquidityMain) ? this.renderMainLiquidityCard() : this.renderAddLiquidityCard();
    };

    openConfirmCard() {
        if (this.props.connectionStatus && this.isReadyToSubmit())
            this.props.openConfirmCard();
    };

    toggleView() {
        this.props.toggleRemoveLiquidityView();
    }

    setRemoveLiquidityValue(value) {
        this.rmPersents = value;
        this.props.assignCoinValue('removeLiquidity', 'ltfield', utils.countPortion(this.props.removeLiquidity.ltfield.balance.amount, value));
    }

    render() {
        this.establishReadiness();
        this.establishPairExistence();
        return (
            <div>
                { (this.props.menuItem == 'exchange') ? this.renderExchangeCard() : this.renderLiquidityCard()}
                { this.renderTokenCard() }
                <ConfirmSupply useSuspense={false}/>
            </div>
        );
    };
};

const WSwapCard = connect(mapStoreToProps(components.SWAP_CARD), mapDispatchToProps(components.SWAP_CARD))(withTranslation()(SwapCard));

export default WSwapCard;