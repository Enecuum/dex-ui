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

import extRequests from '../requests/extRequests';
import swapApi from '../requests/swapApi';

import img1 from '../../img/logo.png';
import img2 from '../../img/bry-logo.png';
import '../../css/swap-card.css';
import '../../css/font-style.css';


class SwapCard extends React.Component {
    constructor(props) {
        super(props);
        this.pairExists = false;
        this.readyToSubmit = false;
        this.activePair = {};

        this.removeLiquidity= {
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
        }
    };

    swapPair() {
        this.props.swapFields(this.props.menuItem);
    };

    changeBalance(field, hash) {
        this.props.assignWalletValue(this.props.menuItem, field, `Balance: ${utils.getBalance(this.props.balances, hash).amount} `);
    }; 

    getInputField(props) {
        return (
            <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className='input-name'>
                        {props.fieldName}
                    </div>
                    <div className='my-token-amount d-flex justify-content-end'>
                        {this.props[this.props.menuItem][this.getFieldName(props.id)].walletValue}
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-between">
                    <input id={props.id}
                        onChange={this.changeField.bind(this, props.id)}
                        className='c-input-field'
                        type='text'
                        value={props.value}
                        placeholder='0.0'
                        autoComplete='off'>
                    </input>
                    <div className={`token-button hover-pointer d-flex align-items-center justify-content-end`} onClick={this.openTokenList.bind(this, props.id)}>
                        <div className='d-flex align-items-center mr-2'>{props.tokenName}</div>
                        <span className='icon-Icon26 d-flex align-items-center chevron-down'></span>
                    </div>                
                </div>
            </div>
        );
    };

    getFieldName(fieldId, counter) {
        if (fieldId == 0 || fieldId == 2)
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
        let field = this.getFieldName(fieldId);
        let value = this.props[this.props.menuItem][field].value;
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
        let fieldObj = this.props[this.props.menuItem][field];
        fieldObj.value = value;
        this.props.assignCoinValue(this.props.menuItem, field, value);
        this.establishReadiness();
        this.countCounterField(fieldObj, this.getFieldName(fieldId, true));
    };

    establishReadiness() {
        if (this.isReadyToSubmit())
            this.readyToSubmit = true;
        else
            this.readyToSubmit = false;
    };

    isReadyToSubmit() {
        if (this.props[this.props.menuItem].field0.value != 0 &&
            this.props[this.props.menuItem].field1.value != 0 &&
            this.props[this.props.menuItem].field0.token.hash != undefined &&
            this.props[this.props.menuItem].field1.token.hash != undefined) {
            return true;
        }
        return false;
    };

    countPrice(activeField, pair) {
        let volume0 = Number(pair.token_0.volume);
        let volume1 = Number(pair.token_1.volume);
        let amountIn = Number(activeField.value);
        if (this.props.menuItem == 'exchange') {
            if (activeField.token.hash == pair.token_0.hash) {
                return testFormulas.getSwapPrice(volume0, volume1, amountIn);
            } else {
                return testFormulas.getSwapPrice(volume1, volume0, amountIn);
            }
        } else {
            if (activeField.token.hash == pair.token_0.hash)
                return testFormulas.getAddLiquidityPrice(volume0, volume1, amountIn);
            else
                return testFormulas.getAddLiquidityPrice(volume1, volume0, amountIn);
        }
    };

    countCounterField(activeField, cField) {
        if (!this.pairExists)
            return;
        let counterField = this.props[this.props.menuItem][cField];

        if (activeField.token.ticker !== presets.swapTokens.emptyToken.ticker && counterField.token.ticker !== presets.swapTokens.emptyToken.ticker) {
            if (this.activePair === undefined) {
                return;
            }
            let counterFieldPrice = this.countPrice(activeField, this.activePair);
            if (!counterFieldPrice)
                counterFieldPrice = '';
                this.props.assignCoinValue(this.props.menuItem, cField, counterFieldPrice);
        }
    };

    renderTokenCard() {
        if (this.props.tokenListStatus)
            return (
                <>
                    <Suspense fallback={<div>---</div>}>
                        <TokenCard
                            changeBalance={this.changeBalance.bind(this)}/>
                    </Suspense>        
                </>
            );
    };

    renderExchangeCard() {
        return (
            <>
                <div className="p-4 bottom-line-1">
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className="mr-3">
                            <div className='h4' id='swap-mode-header'>
                                {this.props.langData[this.props.menuItem].header}
                            </div>
                            <div id='under-header'>
                                {this.props.langData[this.props.menuItem].description}
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
                            fieldName: this.props.langData[this.props.menuItem].input0,
                            id : 0,
                            tokenName: this.props[this.props.menuItem].field0.token.ticker,
                            value: this.props[this.props.menuItem].field0.value
                        })}
                    </div>
                    <div id='exch' className="d-flex justify-content-center align-items-center mx-auto my-3" onClick={this.swapPair.bind(this)}>
                        <span className='icon-Icon13 exch-button hover-pointer' />
                    </div>
                    <div className='swap-input py-2 px-3' id='to'>
                        {this.getInputField({
                            fieldName: this.props.langData[this.props.menuItem].input1,
                            id : 1,
                            tokenName: this.props[this.props.menuItem].field1.token.ticker,
                            value: this.props[this.props.menuItem].field1.value
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
        return (
            <>
                <div className="p-4 bottom-line-1">
                    <div className='d-flex justify-content-between align-items-center mb-4'>
                        <div className="mr-3">
                            <div className='h4' id='swap-mode-header'>
                                {this.props.langData[this.props.menuItem].header}
                            </div>
                            <div id='under-header'>
                                {this.props.langData[this.props.menuItem].description}
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
                        {this.props.langData[this.props.menuItem].addButton}
                    </button>                    
                </div>
                <div className="p-4">    
                    <div className='your-liquidity-header d-flex justify-content-between align-items-center mb-2'>
                        <div>
                            {this.props.langData[this.props.menuItem].yourLiquidity}
                        </div>
                        <Tooltip text='text'/> {/*this.props.langData.trade.tokenCard.tooltipText*/}
                    </div>
                    <div className='your-liquidity-field my-3'>
                        <LiquidityTokensZone changeBalance={this.changeBalance.bind(this)}/>
                    </div>
                    <div className='your-liquidity-header'>
                        {this.props.langData[this.props.menuItem].additionInfo}
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
        let langData = this.props.langData;
        let langProp_Per_ = langData[this.props.menuItem].per;
        return (
            <div className="p-4">
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <span className='icon-Icon13 back-button hover-pointer' onClick={this.changeLiquidityCard.bind(this)}></span>
                    <h4 className='add-liquidity-header' id='swap-mode-header'>
                        {this.props.langData[this.props.menuItem].secondHeader}
                    </h4>
                    <Tooltip text={this.props.langData.liquidity.tooltipText} />
                </div>
                <div className='swap-input py-2 px-3' id='from'>
                    {this.getInputField({
                        fieldName: langData[this.props.menuItem].input0,
                        id : 2,
                        tokenName: this.props[this.props.menuItem].field0.token.ticker,
                        value: this.props[this.props.menuItem].field0.value
                    })}
                </div>
                <span className='icon-Icon17 d-flex justify-content-center plus-liquidity my-4' />
                <div className='swap-input py-2 px-3' id='to'>
                    {this.getInputField({
                        fieldName: langData[this.props.menuItem].input1,
                        id : 3,
                        tokenName: this.props[this.props.menuItem].field1.token.ticker,
                        value: this.props[this.props.menuItem].field1.value
                    })}
                </div>
                <div className='pool-prices my-3'>{this.props.langData[this.props.menuItem].priceAndPoolShare}</div>
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
                        <div className='d-flex justify-content-center'>{langData[this.props.menuItem].shareOfPool}</div>
                    </div>
                </div>
                { this.getSubmitButton() }
            </div>
        );
    };

    renderRemoveLiquidity() {
        return (
            <div className="p-4">
                <div className="p-3 border-solid-2 c-border-radius2 border-color2">
                    <div className="d-flex justify-content-between">
                        <div>Amount</div>
                        <div onClick={this.toggleView.bind(this)} className="hover-pointer no-selectable hover-color3">{ this.props.removeLiquiditySimpleView ? this.props.langData.removeLiquidity.detailed : this.props.langData.removeLiquidity.simple }</div>
                    </div>
                    <div className="h1 font-weight-bold my-3">{this.props.removeLiquidityAmount}%</div>
                    {this.props.removeLiquiditySimpleView &&
                        <div id="removeLiquidityRange" >
                            <Form className="mb-4">
                              <Form.Group controlId="formBasicRangeCustom">
                                <Form.Control type="range"
                                    value= {this.props.removeLiquidityAmount}
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
                {this.props.removeLiquiditySimpleView &&
                    <>
                        <div className="text-center my-3">
                            <span className="icon-Icon13" style={{color: "var(--color4)"}}></span>
                        </div>
                        <div className="swap-input py-2 px-3">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>-</div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <LogoToken data = {{url : img1, value : 'ENQ'}}/>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>-</div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <LogoToken data = {{url : img2, value : 'BRY'}}/>
                                </div>
                            </div>
                            <div className="text-right">
                                Receive WBNB
                            </div>
                        </div>
                    </>
                }
                { !this.props.removeLiquiditySimpleView &&
                    <div className="mt-2">
                        <div className='swap-input py-2 px-3' id='idididid1'>
                            {this.getInputField({
                                fieldName: 'eee',
                                id : 5,
                                tokenName: 'dsf',
                                value: 'dfsdf'
                            })}
                        </div>

                        <span className="icon-Icon13 d-flex justify-content-center my-3 text-color4" />

                        <div className='swap-input py-2 px-3' id='idididid1'>
                            {this.getInputField({
                                fieldName: 'eee',
                                id : 5,
                                tokenName: 'dsf',
                                value: 'dfsdf'
                            })}
                        </div>

                        <span className='icon-Icon17 d-flex justify-content-center plus-liquidity my-3 text-color4' />

                        <div className='swap-input py-2 px-3' id='idididid1'>
                            {this.getInputField({
                                fieldName: 'eee',
                                id : 5,
                                tokenName: 'dsf',
                                value: 'dfsdf'
                            })}
                        </div>                      
                    </div>
                }
                <div className="d-flex align-items-start justify-content-between mb-3 mt-4">
                    <div>Price</div>
                    <div>
                        <div>1 ENQ = 0.00486145 BRY</div>
                        <div>1 ENQ = 0.00486145 BRY</div>
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
        let token0 = this.props[this.props.menuItem].field0.token;
        let token1 = this.props[this.props.menuItem].field1.token;
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
                buttonName = names.createPair;
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
        this.props.setRemoveLiquidityValue(value);
    }

    render() {
        this.establishReadiness();
        this.establishPairExistence();
        return (
            <div>
                { (this.props.menuItem == 'exchange') ? this.renderExchangeCard() : this.renderLiquidityCard()}
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