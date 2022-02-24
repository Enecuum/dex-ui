import React, { Suspense } from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import presets from '../../store/pageDataPresets';
import ConfirmSupply from './ConfirmSupply';
import {LogoToken} from '../elements/LogoToken';
import Tooltip from '../elements/Tooltip';
import TokenCard from './TokenCard';
import testFormulas from '../utils/testFormulas';
import utils from '../utils/swapUtils';
import LiquidityTokensZone from './LiquidityTokensZone';
import ValueProcessor from '../utils/ValueProcessor';
import SwapCardValidationRules from '../utils/swapCardValidationRules';
import Validator from  '../utils/Validator';
import WalletList from "./WalletList";
import Routing from "./Routing";
import workerProcessor from "../utils/WorkerProcessor"

const History = React.lazy(() => import('./History'))
const Settings = React.lazy(() => import('./Settings'))

import '../../css/swap-card.css'
import '../../css/font-style.css'
import swapUtils from "../utils/swapUtils"

const valueProcessor = new ValueProcessor()


class SwapCard extends React.Component {
    constructor(props) {
        super(props)
        this.pairExists = false
        this.readyToSubmit = {dataValid : false}
        this.enoughMoney = []
        this.insufficientFunds = false
        this.activePair = {}
        this.rmPercents = 50
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
        this.state = {
            walletListVisibility : false,
            swapIconStatus : false,
            route : [],
            routingWaiting: false,
            routingVisibility: false,
        }
        this.swapCardValidationRules = new SwapCardValidationRules(this.props.t)
        this.resolveURLHash = this.setSwapTokensFromRequest.bind(this)
        this.initByGetRequestParams = true
        this.handBack = false
        this.validator = new Validator
    };


    componentDidUpdate(prevProps){
      const hasAChanged = ((this.props.tokens !== prevProps.tokens));

      if (hasAChanged && this.props.connectionStatus === true && this.initByGetRequestParams) {
          this.setSwapTokensFromRequest();
          this.initByGetRequestParams = false;
        }
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.resolveURLHash)
        this.routingWorker = workerProcessor.spawn("/js/enex.routingWorker.js")
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.resolveURLHash)
        if (this.routingWorker)
            this.routingWorker.close()
    }

    setSwapTokensFromRequest() {
        let paramsObj = this.parseFromToTokensRequest();
        let mode;
        if (paramsObj.action === 'swap')
            mode = 'exchange';
        else if (paramsObj.action === 'pool')
            mode = 'liquidity';
        if ((paramsObj.action === 'swap' || paramsObj.action === 'pool') && paramsObj.from !== undefined && paramsObj.to !== undefined) {
            if (paramsObj.action === 'pool') {
                if (this.props.liquidityMain === true && this.handBack === false && !this.requestPairIsExist(paramsObj)) {
                    this.props.changeLiquidityMode();
                }
                this.handBack = false;
            }
            this.props.assignTokenValue(mode, 'field0', utils.getTokenObj(this.props.tokens, paramsObj.from));
            this.props.assignTokenValue(mode, 'field1', utils.getTokenObj(this.props.tokens, paramsObj.to));
            this.setTickersFromURLsHash(paramsObj);
        } else if ((paramsObj.action === 'swap' || paramsObj.action === 'pool') && this.props[mode].field0.token.hash !== undefined && this.props[mode].field1.token.hash !== undefined) {            
            window.location.hash = '#!action='+ paramsObj.action +'&pair=' + this.props[mode].field0.token.ticker + '-' + this.props[mode].field1.token.ticker + '&from=' + this.props[mode].field0.token.hash + '&to=' +  this.props[mode].field1.token.hash;
        } else {
            this.props.assignTokenValue(this.getMode(), 'field0', utils.getTokenObj(this.props.tokens, this.props.mainToken));
        }      
    }

    requestPairIsExist(paramsObj) {
        let myPairs = [];
        for (let pool of this.props.pairs)
            for (let balance of this.props.balances)
                if (balance.token === pool.lt)
                    myPairs.push(pool);
        let pairIsExist = myPairs.find(elem => (elem.token_0.hash === paramsObj.from) && (elem.token_1.hash === paramsObj.to));

        return pairIsExist !== undefined
    }

    setTickersFromURLsHash(paramsObj) {
        let fromToken = this.props.tokens.find(token => token.hash === paramsObj.from);
        let toToken = this.props.tokens.find(token => token.hash === paramsObj.to);
        if (fromToken !== undefined && toToken !== undefined) {
            let windowLocationStr = window.location.hash;
            let re = /\&pair\=[A-Z]{1,6}\-[A-Z]{1,6}\&from/;
            let newStr = '&pair=' + fromToken.ticker + '-' + toToken.ticker + '&from';
            window.location.hash = windowLocationStr.replace(re, newStr);
        }
    }

    parseFromToTokensRequest() {
        let requestParamsObj = {
            action : undefined,
            pair   : undefined,
            from   : undefined,
            to     : undefined
        };

        window.location.hash
        .split('&')
        .map(elem => {
            elem = elem.replace('#!', '');
            let tmpArr = elem.split('=');
            if (requestParamsObj.hasOwnProperty(tmpArr[0]))
                requestParamsObj[tmpArr[0]] = tmpArr[1];
        });
        return requestParamsObj;
    }

    swapPair() {
        let mode = this.getMode();
        if (this.props[mode].field0.token.hash !== undefined && this.props[mode].field1.token.hash !== undefined) {
            window.location.hash = '#!action=' + presets.paths[mode] + '&pair=' + this.props[mode].field1.token.ticker + '-' + this.props[mode].field0.token.ticker + '&from=' + this.props[mode].field1.token.hash + '&to=' +  this.props[mode].field0.token.hash;
        }
        let oldHash = this.props[mode].field0.token.hash
        this.props.swapFields(this.props.menuItem)
        setTimeout(this.recalculateSwap.bind(this), 100, mode, oldHash)
    };

    recalculateSwap (mode, oldHash) {
        if (this.props[mode].field0.token.hash !== oldHash)
            this.changeField(this.props[mode].field0.id, {value : this.props[mode].field0.value.text})
        else
            setTimeout(this.recalculateSwap.bind(this), 100, mode, oldHash)
    }

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

    changeSwapIconStatus (value) {
        this.setState({swapIconStatus : value})
    }

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
                                <div id='exch'
                                     className="d-flex justify-content-center align-items-center mx-auto my-3"
                                     onClick={this.swapPair.bind(this)}
                                     onMouseOver={() => this.changeSwapIconStatus(true)}
                                     onMouseOut={() => this.changeSwapIconStatus(false)}
                                >
                                    <span className={`icon-Icon${this.state.swapIconStatus ? "14" : "13"} exch-button hover-pointer`} />
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
                            { mode === 'exchange' && this.activePair !== undefined &&
                                <div className="my-2">
                                    <div className='py-2 swap-price d-flex justify-content-between align-items-center'>
                                        <div className='pr-4'>Price</div>
                                        <div className='pl-4'>{this.showExchangeRate(false)} {firstToken.ticker} {t(dp + `.liquidity.per`)} {secondToken.ticker}</div>
                                    </div>
                                    <Routing route={this.state.route}
                                             net={this.props.net}
                                             tokens={this.props.tokens}
                                             pairs={this.props.pairs}
                                             routingWaiting={this.state.routingWaiting}
                                             routingVisibility={this.state.routingVisibility}
                                    />
                                </div>
                            }
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
                        </>
                    }

                    {/* ---------------------------------------- liquidity-main: body ---------------------------------------- */}
                    { this.props.liquidityMain && mode === 'liquidity' &&
                        <>
                            <div className='your-liquidity-header d-flex justify-content-between align-items-center mb-2'>
                                <div>
                                    {t(dp + `.${mode}.yourLiquidity`)}
                                </div>
                                <Tooltip text={t('trade.swapCard.liquidity.yourLiquidityTooltip')}/>
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
                    
                    {/* -------------------------------------- remove-liquidity: bottom info  ---------------------------------- */}
                    { this.props.liquidityRemove && mode !== 'exchange' &&
                        <>
                            <div className="d-flex align-items-start justify-content-between mb-3 mt-4">
                                <div>Price</div>
                                <div>
                                    <div>1 {firstToken.ticker} = {this.showExchangeRate(true)} {secondToken.ticker}</div>
                                    <div>1 {secondToken.ticker} = {this.showExchangeRate(false)} {firstToken.ticker}</div>
                                </div>
                            </div>
                        </>
                    }
                    {(!this.props.liquidityMain || mode !== 'liquidity') &&
                        <div className="d-flex align-items-center justify-content-center">
                            {<Suspense fallback={<div>---</div>}>
                                <ConfirmSupply
                                    getSubmitButton={this.getSubmitButton.bind(this)}
                                    modeStruct={modeStruct}
                                    swapCalculationsDirection={this.props.swapCalculationsDirection}
                                    route={this.state.route}
                                />
                            </Suspense>}
                        </div>
                    }
                </div>
            </>
        );
    };

    // getRemoveLiquidityButton (t) {
    //     let buttonName = 'removeLiquidity';
    //     if (!this.pairExists)
    //         buttonName = 'invalidPool';
    //     return (
    //         <button
    //             className='btn btn-secondary w-100 py-2'
    //             type='submit'
    //             id='submit'
    //             onClick={this.removeRequest.bind(this)}
    //             style={{backgroundColor : (this.props.connectionStatus) ? undefined : 'var(--color5)'}}>
    //             { t(`trade.swapCard.submitButton.${buttonName}`) }
    //         </button>
    //     );
    // };

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
                                    <LogoToken data = {{
                                        url : firstToken.logo,
                                        value : firstToken.ticker,
                                        net : this.props.net
                                    }}/>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>{this.showInputValue(modeStruct.field1.value)}</div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <LogoToken data = {{
                                        url : secondToken.logo,
                                        value : secondToken.ticker,
                                        net : this.props.net
                                    }}/>
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
        )
    }

    validateDataForConfirmation (openConfirmCard, dataValid) {
        if (this.props.connectionStatus && this.getReadinessState() && !this.insufficientFunds && dataValid)
            openConfirmCard()
        if (!this.props.connectionStatus)
            this.openConList()
    }

    makeErrMsg (errField, err) {
        let errTitle = this.getSwapCardButtonName(err.msg)
        return {
            title: errTitle,
            error: errField
        }
    }

    handleErrorsForSwapCard (errObj) {
        let errProp = Object.keys(errObj)[0], t = this.props.t, dp = "trade.swapCard.errorDescription."
        switch (errProp) {
            case 'field0':
                return this.makeErrMsg(t(dp + "field0"), errObj.field0)
            case 'field1':
                return this.makeErrMsg(t(dp + "field1"), errObj.field1)
            case 'ltfield':
                return this.makeErrMsg(t(dp + "ltfield"), errObj.ltfield)
            case 'fullField0Value':
                return this.makeErrMsg(t(dp + "fullField0Value"), errObj.fullField0Value)
            case 'nativeToken':
                return this.makeErrMsg(t(dp + "nativeToken"), errObj.nativeToken)
            default:
                return undefined
        }
    }

    getSwapCardButtonName(buttonName) {
        return this.props.t(`trade.swapCard.submitButton.${buttonName}`)
    }

    renderSwapCardButton (buttonName, openConfirmCard, dataValid, style) {
        return (
            <div className="w-100">
                <button className='btn btn-secondary alt-submit w-100 pt-2'
                        onClick={this.validateDataForConfirmation.bind(this, openConfirmCard, dataValid)}
                        type='submit'
                        id='submit'
                        style={style}
                >
                    { (typeof buttonName === "object") ? buttonName.title : buttonName }
                </button>
                { buttonName.error &&
                    <small className="row err-msg d-flex justify-content-center form-text mx-0 pt-2">
                        { buttonName.error }
                    </small>
                }
            </div>
        )
    }

    getSubmitButton(modeStruct, openConfirmCard) {
        let buttonName
        if (this.props.connectionStatus === false)
            buttonName = this.getSwapCardButtonName('beforeConnection')
        else {
            // ----------------- establish mode buttons -----------------
            if (this.props.menuItem === 'exchange')
                buttonName = this.getSwapCardButtonName('swap')
            else if (this.props.menuItem === 'liquidity' && !this.props.liquidityRemove)
                buttonName = this.getSwapCardButtonName('addLiquidity')
            else if (this.props.menuItem === 'liquidity')
                buttonName = this.getSwapCardButtonName('removeLiquidity')

            // -------------------- establish errors --------------------
            if (this.readyToSubmit) {
                if (this.readyToSubmit.propsArr) {
                    let err = this.handleErrorsForSwapCard(this.readyToSubmit.propsArr)
                    if (err)
                        buttonName = err
                } else 
                    buttonName = this.getSwapCardButtonName('fillAllFields')
            }
            
            if (this.pairExists === false) {
                let validationResult = {dataValid : false}
                let modeField = this.props[this.getMode()]
                if (modeField.field0.value.text && modeField.field1.value.text) {
                    let nativeBalance = utils.getBalanceObj(this.props.balances, this.props.mainToken)
                    let rules = this.swapCardValidationRules.getCreatePairValidationRules({
                        ...modeField,
                        nativeToken : {
                            balance: nativeBalance,
                            value: {value: this.props.mainTokenFee, decimals: nativeBalance.decimals}
                        }
                    })
                    validationResult = this.validator.batchValidate(modeField, rules)
                    let err = this.handleErrorsForSwapCard(validationResult.propsArr)
                    if (err)
                        buttonName = err
                    else
                        buttonName = this.getSwapCardButtonName('createPair')
                }
                return (
                    <div className="w-100">
                        <div className='about-button-info d-flex justify-content-center align-items-center w-100'>
                            { this.props.t('trade.swapCard.aboutButtonInfo.withoutPair') }
                        </div>
                        { this.renderSwapCardButton(buttonName, openConfirmCard, validationResult.dataValid) }
                    </div>
                )
            }
        }
        return this.renderSwapCardButton(buttonName, openConfirmCard, this.readyToSubmit.dataValid, {
            backgroundColor : (this.props.connectionStatus) ? undefined : 'var(--color5)'
        })
    }

    getBalanceColor (id) {
        let c_color = { danger : '#61c2d077', simple : '#61c2d0' };
        let danger = { color : c_color.danger }, simple = { color : c_color.simple };
        if (id === 4 || id === 5)
            return simple;
        if (this.enoughMoney.indexOf(id) === -1)
            return simple;
        else
            return danger;
    };

    getInputField(props) {
        let ticker = props.fieldData.token.ticker
        if (ticker === undefined)
            ticker = this.props.t('trade.swapCard.inputField.selectToken');
        return (
            <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className='input-name'>
                        {props.fieldName}
                    </div>
                    <div className='my-token-amount d-flex justify-content-end'>
                        {this.showBalance(valueProcessor.usCommasBigIntDecimals(props.fieldData.balance.amount, props.fieldData.balance.decimals, props.fieldData.balance.decimals))}
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">                    
                    <input id={props.id}
                        onChange={e => this.changeField(props.id, e.target)}
                        className='c-input-field mr-2'
                        type='text'
                        value={this.showInputValue(props.fieldData.value)}
                        placeholder='0.0'
                        autoComplete='off'
                        style={this.getBalanceColor(props.id)}>
                    </input>
                    <div className="d-flex align-items-center justify-content-end">
                        {props.fieldData.balance.amount > 0 &&
                            <div
                                className="text-color3 mr-2 hover-pointer hover-color4"
                                onClick={this.setMax.bind(this, props)}
                            >MAX</div>
                        }    
                        <div className={`token-button hover-pointer d-flex align-items-center justify-content-end`} onClick={this.openTokenList.bind(this, props.id)}>
                            <div className='d-flex align-items-center mr-2 flex-shrink-0'>
                                <LogoToken data = {{
                                    url : props.fieldData.token.logo,
                                    value : ticker,
                                    net : this.props.net
                                }}/>
                            </div>
                            <span className='icon-Icon26 d-flex align-items-center chevron-down'/>
                        </div>                     
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
        // make rules for showing numbers according to national standards
        let res;
        if (valueObj.text !== undefined)
            if (valueObj.text !== '') {
                res = valueObj.text //res = utils.removeEndZeros(valueObj.text);
            } else {
                res = ''
            }
        else
            res = ''
        return res
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
        return utils.removeEndZeros(utils.countExchangeRate(this.activePair, firstToken, this.props[this.getMode()]))
    };

    showPercents (fixedLength=1) {
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

    setMax(fieldProps) {
        let mode = this.getMode();
        let field = this.getFieldName(fieldProps.id);
        let decimals = this.props[mode][field].token.decimals;
        let value = BigInt(fieldProps.fieldData.balance.amount)

        if (fieldProps.fieldData.token.hash === this.props.mainToken) {
          value -= BigInt(this.props.mainTokenFee !== undefined ? this.props.mainTokenFee : presets.network.nativeToken.fee);
          if (value < 0) {
            value = 0n
          }
        }

        let newValObj = {
            value    : value,
            decimals : decimals,
            text     : valueProcessor.usCommasBigIntDecimals (value, decimals, decimals).replace(',','')
        };
        this.props.assignCoinValue(mode, field, newValObj);
        let fieldObj = this.props[mode][field];
        fieldObj.value = newValObj;
        this.countCounterField(fieldObj, this.getFieldName(fieldProps.id, true), field)

        let modeData = this.props[mode]
        modeData[field] = fieldObj

        this.establishReadiness(this.validateSwapCard(modeData))
    }

    changeField (fieldId, target) {
        let mode = this.getMode(), field = this.getFieldName(fieldId), newValue = target.value.toString()
        let modeData = this.props[mode], fieldData = modeData[field]
        let oldValObj = {...fieldData.value}

        let decimals = fieldData.token.decimals
        let newValObj = (fieldData.token.amount !== '---') ? {
            value : valueProcessor.valueToBigInt(newValue, decimals).value,
            decimals : decimals,
            text : newValue
        } : {}
        fieldData.value = newValObj

        let rules = this.swapCardValidationRules.getSwapFieldValidationRules(fieldData)
        let checkResult = this.validator.batchValidate(fieldData, rules)

        // if (mode === "exchange" && field === "field1") {
        //     checkResult.dataValid = this.checkExchangeOutValue(modeData)
        // }

        if (checkResult.dataValid) {
            rules = this.swapCardValidationRules.getPoolVolumesValidationRules(this.activePair, modeData, mode, this.pairExists)
            if (!this.validator.batchValidate(this.activePair, rules).dataValid) {
                if (this.activePair.token_1.hash === fieldData.token.hash) {
                    newValObj.value = this.activePair.token_1.volume - 1
                    newValObj.text = this.numWithoutCommas(this.activePair.token_1.volume - 1, newValObj.decimals)
                } else {
                    newValObj.value = this.activePair.token_0.volume - 1
                    newValObj.text = this.numWithoutCommas(this.activePair.token_0.volume - 1, newValObj.decimals)
                }
            }
            this.props.assignCoinValue(mode, field, newValObj)

            let cField = this.getFieldName(fieldId, true)
            if (mode === "exchange") {
                this.props.assignCoinValue(this.getMode(), cField, {
                    value : 0n,
                    decimals : 10,
                    text : "0"
                })

                if (this.routingWorker) {
                    this.setState({
                        routingWaiting: true,
                        routingVisibility: true,
                        route: []
                    })

                    let promise
                    if (fieldData.token.hash === this.props[mode].field0.token.hash) {
                        this.props.changeSwapCalcDirection("down")
                        promise = this.countRouteSellExact()
                    } else {
                        this.props.changeSwapCalcDirection("up")
                        promise = this.countRouteBuyExact()
                    }
                    this.countRoute(promise, cField)
                }
            } else {
                let activePairRules = this.swapCardValidationRules.getActivePairValidationRules(this.activePair)
                checkResult = this.validator.batchValidate(this.activePair, activePairRules)
                if (checkResult.dataValid) {
                    this.setState({
                        routingVisibility: false
                    })
                    this.countCounterField(fieldData, cField, field)
                }
            }

            modeData[field] = fieldData
            this.establishReadiness(this.validateSwapCard(modeData))
        } else {
            this.props.assignCoinValue(mode, field, oldValObj)
        }
    }

    numWithoutCommas (value, decimals) {
        return valueProcessor.usCommasBigIntDecimals(value, decimals).replace(',','')
    }

    checkExchangeOutValue (modeData) {
        let decimalsDiff = modeData.field1.value.decimals - modeData.field1.token.decimals, testVal
        if (decimalsDiff >= 0)
            testVal = BigInt(modeData.field1.value.value) * BigInt('1' + '0'.repeat(decimalsDiff))
        else
            testVal = BigInt(modeData.field1.value.value) / BigInt('1' + '0'.repeat(-decimalsDiff))
        let borderValue = (this.activePair.token_1.hash === modeData.field1.token.hash) ? this.activePair.token_1.volume : this.activePair.token_0.volume
        return testVal < borderValue
    }

    isValidPercent (rmPercent) {
        return Number(rmPercent) <= 100
    }

    countAddLiquidityPrice(activeField, counterField, pair) {
        let decimals = [activeField.token.decimals, counterField.token.decimals]
        if (activeField.token.hash !== pair.token_0.hash)
            [decimals[0], decimals[1]] = [decimals[1], decimals[0]]
        let volume0  = {
            value : BigInt(pair.token_0.volume),
            decimals : decimals[0]
        }
        let volume1  = {
            value : BigInt(pair.token_1.volume),
            decimals : decimals[1]
        }
        let activeAmount = activeField.value

        if (activeField.token.hash === pair.token_0.hash)
            return testFormulas.getAddLiquidityPrice(volume1, volume0, activeAmount)
        else
            return testFormulas.getAddLiquidityPrice(volume0, volume1, activeAmount)
    }

    countRouteSellExact () {
        let data = {
            token0 : this.props.exchange.field0.token,
            token1 : this.props.exchange.field1.token,
            amount : this.props.exchange.field0.value,
            pairs  : this.props.pairs,
            tokens : this.props.tokens,
            limit : 4,
            mode : "sell"
        }

        // console.log(testFormulas.sellRoute(data.token0.hash, data.token1.hash, data.amount, data.pairs, data.tokens, data.limit))
        return this.routingWorker.postMessage(data)
    }

    countRouteBuyExact () {
        let data = {
            token0 : this.props.exchange.field1.token,
            token1 : this.props.exchange.field0.token,
            amount : this.props.exchange.field1.value,
            pairs  : this.props.pairs,
            tokens : this.props.tokens,
            limit : 4,
            mode : "buy"
        }

        // console.log(testFormulas.sellRouteRev(data.token0.hash, data.token1.hash, data.amount, data.pairs, data.tokens, data.limit))
        return this.routingWorker.postMessage(data)
    }

    countRoute (routingExec, cField) {
        routingExec.then(res => {
            console.log(res)
            this.pairExists = true
            this.props.changeCreatePoolState(false)
            if (res.length) {
                let finalValue = res[(this.props.swapCalculationsDirection === "down") ? res.length - 1 : 0].outcome
                this.props.assignCoinValue(this.getMode(), cField, {
                    value : finalValue.value,
                    decimals : finalValue.decimals,
                    text : this.bigIntToString(finalValue.value, finalValue.decimals)
                })
            } else {
                this.setState({
                    routingVisibility : false,
                    route: res
                })
                this.pairExists = false
                this.props.changeCreatePoolState(true)
            }
            this.setState({
                routingWaiting : false,
                route: res
            })
        })
        .catch(() => {
            this.routingWorker.close()
            this.routingWorker = workerProcessor.spawn("/js/enex.routingWorker.js")
        })
    }

    countCounterField(fieldObj, cField, aField) {
        let mode = this.getMode()
        let counterField = this.props[mode][cField]

        if (fieldObj.value.value === undefined)
            return

        if (fieldObj.token.ticker !== presets.swapTokens.emptyToken.ticker && counterField.token.ticker !== presets.swapTokens.emptyToken.ticker) {
            if (this.activePair === undefined) {
                return
            }
            if (mode === "removeLiquidity") {
                this.countRemoveLiquidity(mode, aField, fieldObj.value)
            } else {
                let counterFieldPrice = this.countAddLiquidityPrice(fieldObj, counterField, this.activePair)
                if (counterFieldPrice)
                    this.props.assignCoinValue(mode, cField, {
                        value : counterFieldPrice.value,
                        decimals : counterFieldPrice.decimals,
                        text : this.bigIntToString(counterFieldPrice.value, counterFieldPrice.decimals)
                    })
            }
        }
    }

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
        if (!Object.keys(counted.t0).length || !Object.keys(counted.t1).length) { // invalid ltDestruction
            let zeroValue = {value: 0, decimals: 0, text: '0'};
            this.assignCoinValueWithText(mode, 'field0',  zeroValue);
            this.assignCoinValueWithText(mode, 'field1',  zeroValue);
            this.assignCoinValueWithText(mode, 'ltfield', zeroValue);
            return;
        }
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

    validateSwapCard(modeData) {
        let nativeBalance = utils.getBalanceObj(this.props.balances, this.props.mainToken)
        modeData.nativeToken = {
            balance: nativeBalance,
            value: {value: this.props.mainTokenFee, decimals: nativeBalance.decimals}
        }
        if (this.getMode() === 'exchange' && modeData.field0.token.hash === this.props.mainToken) {
            modeData.fullField0Value = valueProcessor.add({
                value : presets.network.nativeToken.fee,
                decimals : modeData.field0.balance.decimals
            }, modeData.field0.value)
        } else {
            modeData.fullField0Value = undefined
        }
        if (modeData.field0.value.text && modeData.field1.value.text) {
            let rules = this.swapCardValidationRules.getSwapCardValidationRules(modeData, this.getMode())
            return this.validator.batchValidate(modeData, rules)
        } else {
            return {dataValid : false}
        }
    }

    closeTokenList(tokenObj, activeField) {
        this.props.closeTokenList()
        let mode = this.getMode(), modeData = this.props[mode]
        if (tokenObj) {
            modeData[activeField].token = tokenObj
            this.establishReadiness(this.validateSwapCard(modeData))
        }
    }

    changeAddRemoveCards(mode) {
        if (mode === 'liquidity') {
            this.handBack = true;
            this.props.changeLiquidityMode();
        }
        else if (mode === 'removeLiquidity')
            this.props.changeRemoveLiquidityVisibility();
        window.location.hash = '#!action=pool';
    };

    toggleView() {
        this.props.toggleRemoveLiquidityView();
    }

    /* =========================== rules checking for ConfirmCard opening ========================== */
    establishReadiness(checkResult) {
        this.countBadBalance()
        this.readyToSubmit = checkResult
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
        // if (this.activePair.pool_fee === undefined) {
        //     this.pairExists = false;
        //     this.props.changeCreatePoolState(true);
        // } else {
        //     this.pairExists = true;
        //     this.props.changeCreatePoolState(false);
        // }
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
        let subtraction0, subtraction1;
        try {
            subtraction0 = valueProcessor.sub(balance0, f0.value);
            subtraction1 = valueProcessor.sub(balance1, f1.value);
        } catch (e) {
            return;
        }
        if (subtraction0.value < 0)
            this.pushBadBalanceId(f0.id);
        else
            this.popBadBalanceId(f0.id);
        if (subtraction1.value < 0 && (this.props.menuItem !== 'exchange' || !this.pairExists))
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

    closeConList () {
        this.setState({walletListVisibility : false})
    }

    openConList () {
        this.setState({walletListVisibility : true})
    }

    renderWalletList () {
        return (
            <>
                {this.state.walletListVisibility &&
                <WalletList
                    closeConList = {this.closeConList.bind(this)}
                    updDexData = {this.props.updDexData.bind(this.props)}
                />}
            </>
        )
    }

    /* ================================== main rendering function ================================== */
    render() {
        this.establishReadiness(this.validateSwapCard(this.props[this.getMode()]))
        this.establishPairExistence();
        return (
            <div>
                { this.renderWalletList() }
                { this.renderSwapCard()   }
                { this.renderTokenCard()  }
            </div>
        );
    };
}

const WSwapCard = connect(
    mapStoreToProps(components.SWAP_CARD),
    mapDispatchToProps(components.SWAP_CARD)
)(withTranslation()(SwapCard))

export default WSwapCard