import React, { Suspense } from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import _ from "lodash"

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
import lsdp from '../utils/localStorageDataProcessor'
import networkApi from '../requests/networkApi'
import swapApi from '../requests/swapApi'
import {settings} from "../utils/tokensSettings"

const valueProcessor = new ValueProcessor()
const JUST_TOKEN_PRICE = true

class SwapCard extends React.Component {
    constructor(props) {
        super(props)
        this.pairExists = false
        this.readyToSubmit = {dataValid : false}
        this.enoughMoney = []
        this.insufficientFunds = false
        this.activePair = {}
        this.rmPercents = 50
        this.routePromises = []
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
            notEnoughLiquidity : false
        }
        this.swapCardValidationRules = new SwapCardValidationRules(this.props.t)
        this.resolveURLHash = this.setSwapTokensFromRequest.bind(this)
        this.initByGetRequestParams = true
        this.handBack = false
        this.validator = new Validator
        this.lastTotalSupplyUpdate = new Date().getTime()
        this.lastActiveLT = {}
    };

    componentDidUpdate (prevProps) {
        const hasAChanged = ((this.props.tokens !== prevProps.tokens));
        if (hasAChanged && this.props.connectionStatus === true && this.initByGetRequestParams) {
            this.setSwapTokensFromRequest();
            this.initByGetRequestParams = false;
        }

        let newRoutingSwitch = lsdp.simple.get(settings.routingSwitch, true)
        let forceUpdateFlag = false
        forceUpdateFlag += newRoutingSwitch !== this.settings.routingSwitch
        
        if (forceUpdateFlag) {
            this.settings = {
                routingSwitch : newRoutingSwitch
            }
            this.clearSwap()
        }

        // if (lsdp.simple.get())
        // if (this.props.connectionStatus && ENQWeb.Enq.provider !== this.oldNet) {
        //     this.oldNet = ENQWeb.Enq.provider
        //     // this.setState({
        //     //     routingVisibility : false,
        //     //     route: []
        //     // })
        // }
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.resolveURLHash)
        this.routingWorker = workerProcessor.spawn("/js/enex.routingWorker.js")

        let mode = this.getMode();
        let token0 = this.props[mode].field0.token
        let token1 = this.props[mode].field1.token
        if (token0.hash !== presets.swapTokens.emptyToken.hash && token1.hash !== presets.swapTokens.emptyToken.hash) {
            this.changeField(this.props[mode].field0.id, {value: _.cloneDeep(this.props[mode].field0.value.text)})
        }
        this.updRemoveLiquidity()
        this.recalculateSwap(mode, undefined)

        this.settings = {
            routingSwitch : lsdp.simple.get(settings.routingSwitch, true)
        }
    }

    componentWillUnmount() {
        clearInterval(this.descriptor)
        window.removeEventListener('hashchange', this.resolveURLHash)
        if (this.routingWorker) {
            try {
                this.routingWorker.close()
            } catch (e) {}
        }
    }

    changeLiquidityMode () {
        let dec0, dec1
        try {
            dec0 = this.props.liquidity.field0.token.decimals
        } catch (e) {
            dec0 = 0
        }
        try {
            dec1 = this.props.liquidity.field1.token.decimals
        } catch (e) {
            dec1 = 0
        }
        this.props.assignCoinValue("liquidity", "field0", {
            value : 0n,
            decimals : dec0,
            text : ""
        })
        this.props.assignCoinValue("liquidity", "field1", {
            value : 0n,
            decimals : dec1,
            text : ""
        })
        this.props.changeLiquidityMode()
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
                    this.changeLiquidityMode();
                }
                this.handBack = false;
            }
            this.props.assignTokenValue(mode, 'field0', utils.getTokenObj(this.props.tokens, paramsObj.from));
            this.props.assignTokenValue(mode, 'field1', utils.getTokenObj(this.props.tokens, paramsObj.to));
            this.setTickersFromURLsHash(paramsObj);
        } else if ((paramsObj.action === 'swap' || paramsObj.action === 'pool') && this.props[mode].field0.token.hash !== undefined && this.props[mode].field1.token.hash !== undefined) {            
            window.location.hash = '#!action='+ paramsObj.action +'&pair=' + this.props[mode].field0.token.ticker + '-' + this.props[mode].field1.token.ticker + '&from=' + this.props[mode].field0.token.hash + '&to=' +  this.props[mode].field1.token.hash;
        } else {
            this.props.assignTokenValue(mode, 'field0', utils.getTokenObj(this.props.tokens, this.props.mainToken));
        }
    }

    requestPairIsExist(paramsObj) {
        let myPairs = [];
        for (let pool of this.props.pairs)
            for (let balance of this.props.balances) {
                let farm = this.props.farmsList.find(farm => farm.stake_token_hash === pool.lt && farm.stake)
                if (balance.token === pool.lt || (farm !== undefined && myPairs.find(el => el.lt === pool.lt) === undefined)) {
                    let filteredPair = _.cloneDeep(pool)
                    if (farm !== undefined) {
                        filteredPair.stake = farm.stake
                    }
                    myPairs.push(filteredPair)
                }
            }
        let pairIsExist = myPairs.find(elem => (elem.token_0.hash === paramsObj.from) && (elem.token_1.hash === paramsObj.to));

        return pairIsExist !== undefined
    }

    updRemoveLiquidity () {
        // this.descriptor = setInterval(() => {
        //     try {
        //         this.countRemoveLiquidity("removeLiquidity", 'ltfield', this.props.removeLiquidity.ltfield.value)
        //     } catch (e) {}
        // }, 2000)
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
        this.recalculationStart = false
        setTimeout(this.recalculateSwap.bind(this), 100, mode, oldHash)
    }

    clearSwap() {
        try {
            this.changeField(this.props.exchange.field0.id, {value : "0"})
            this.changeField(this.props.exchange.field1.id, {value : "0"})
        } catch (e) {}
    }

    recalculateSwap (mode, oldHash, activeField="field0") {
        if (this.props[mode][activeField].token.hash !== oldHash) {
            if (this.recalculationStart)
                return
            this.recalculationStart = true
            if (!this.props[mode][activeField].value.text)
                this.changeField(this.props[mode][activeField].id, {value : "0"})
            else
                this.changeField(this.props[mode][activeField].id, {value : _.cloneDeep(this.props[mode][activeField].value.text)})
        } else
            setTimeout(this.recalculateSwap.bind(this), 100, mode, oldHash, activeField)
    }

    recalculateSwapForNewToken (mode, oldHash, activeField) {
        this.recalculationStart = false
        if (this.props[mode][activeField].token.hash !== oldHash)
            this.changeField(this.props[mode][activeField].id, {value : _.cloneDeep(this.props[mode][activeField].value.text)})
        else
            setTimeout(this.recalculateSwap.bind(this), 100, mode, oldHash, activeField)
    }

    changeBalance(field, hash) {
        this.props.assignBalanceObj(this.getMode(), field, utils.getBalanceObj(this.props.balances, hash));
    };

    setRmPercent (val) {
        this.rmPercents = val
    }

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

    routeImmitation (asset1, asset2) {
        let pair = swapUtils.searchSwap(this.props.pairs, [{hash: asset1}, {hash: asset2}])
        return [
            {}, {
                source : asset1,
                vertex : asset2,
                volume1 : pair.token_0.volume,
                volume2 : pair.token_1.volume
            }
        ]
    }

    /* ================================ cards rendering functions ================================== */

    renderSwapCard () {
        const t = this.props.t;
        let dp = 'trade.swapCard'; // default place (in translation file)
        let mode        = this.getMode();
        let modeStruct  = _.cloneDeep(this.props[mode]);

        let firstToken  = utils.getTokenObj(this.props.tokens, modeStruct.field0.token.hash);
        let secondToken = utils.getTokenObj(this.props.tokens, modeStruct.field1.token.hash);

        return (
            <div>
                {this.props.coinName === "---" ? <div className={"swap-card-cap"}>
                    <div className="swap-card-loading icon-Icon15" />
                </div> : <></>}
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
                <div className="p-4 swap-card-body">
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
                                    <div className='pt-2 swap-price d-flex justify-content-between align-items-center'>
                                        <div className='pr-4'>{t("price")}</div>
                                        <div className='pl-4'>{this.showExchangeRate(this.props.route, false)} {firstToken.ticker} {t(dp + `.liquidity.per`)} {secondToken.ticker}</div>
                                    </div>
                                    <small className="pb-2 mr-2 usd-price d-flex justify-content-end">
                                        {
                                            (secondToken.hash !== undefined && firstToken.hash !== undefined)
                                            &&
                                            "1 " + secondToken.ticker + " = " + swapUtils.countUSDPrice(null, secondToken, JUST_TOKEN_PRICE) + "$"
                                            ||
                                            <></>
                                        }
                                    </small>
                                    <Routing route={this.state.route}
                                             net={this.props.net}
                                             tokens={this.props.tokens}
                                             pairs={this.props.pairs}
                                             routingWaiting={this.state.routingWaiting}
                                             routingVisibility={this.state.routingVisibility && lsdp.simple.get(settings.routingSwitch, true) !== "false"}
                                    />
                                </div>
                            }
                            {/* ---------------------------------------- add-liquidity: exchange rate ---------------------------------------- */}
                            { !this.props.liquidityMain && mode === 'liquidity' &&
                                <>
                                    <div className='pool-prices my-3'>{t(dp + `.${mode}.priceAndPoolShare`)}</div>
                                    <div className='swap-input py-2 px-3 d-flex align-items-center justify-content-between mb-5'>
                                        <div>
                                            <div className='d-flex justify-content-center'>{this.showExchangeRate(this.routeImmitation(modeStruct.field0.token.hash, modeStruct.field1.token.hash), false)}</div>
                                            <div className='d-flex justify-content-center'>{this.getExchangeText(t(dp + `.${mode}.per`), true)}</div>
                                        </div>
                                        <div>
                                            <div className='d-flex justify-content-center'>{this.showExchangeRate(this.routeImmitation(modeStruct.field0.token.hash, modeStruct.field1.token.hash), true)}</div>
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
                                <LiquidityTokensZone changeBalance={this.changeBalance.bind(this)} setRmPercent={this.setRmPercent.bind(this)}/>
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
                                    <div>{t("amount")}</div>
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
                                <div>{t("price")}</div>
                                <div>
                                    <div className={"d-flex justify-content-end"}>1 {firstToken.ticker} = {this.showExchangeRate(this.routeImmitation(modeStruct.field0.token.hash, modeStruct.field1.token.hash), true)} {secondToken.ticker}</div>
                                    {this.renderExchangeRateUsdPrice(secondToken, firstToken)}
                                    <div className={"d-flex justify-content-end"}>1 {secondToken.ticker} = {this.showExchangeRate(this.routeImmitation(modeStruct.field0.token.hash, modeStruct.field1.token.hash), false)} {firstToken.ticker}</div>
                                    {this.renderExchangeRateUsdPrice(firstToken, secondToken)}
                                </div>
                            </div>
                        </>
                    }
                    {(!this.props.liquidityMain || mode !== 'liquidity') &&
                        <div className="d-flex align-items-center justify-content-center">
                            {<Suspense fallback={<div>---</div>}>
                                <ConfirmSupply
                                    getSubmitButton={this.getSubmitButton.bind(this)}
                                    assignCoinValueWithText={this.assignCoinValueWithText.bind(this)}
                                    changeLiquidityMode={this.changeLiquidityMode.bind(this)}
                                    modeStruct={modeStruct}
                                    route={this.state.route}
                                />
                            </Suspense>}
                        </div>
                    }
                </div>
            </div>
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

    renderExchangeRateUsdPrice (firstToken, secondToken) {
        return (
            <>
                <small className="pb-2 usd-price d-flex justify-content-end">
                    {
                        (secondToken.hash !== undefined && firstToken.hash !== undefined)
                        &&
                        "1 " + secondToken.ticker + " = " + swapUtils.countUSDPrice(null, secondToken, JUST_TOKEN_PRICE) + "$"
                        ||
                        <></>
                    }
                </small>
            </>
        )
    }

    renderRemoveLiquidity(modeStruct, firstToken, secondToken) {
        const t = this.props.t
        let dp = 'trade.swapCard'

        let firstTokenUsd = swapUtils.countUSDPrice(modeStruct.field0.value, firstToken)
        let secondTokenUsd = swapUtils.countUSDPrice(modeStruct.field1.value, secondToken)

        return (
            <>
                { this.props.removeLiquiditySimpleView &&
                    <>
                        <div className="text-center my-3">
                            <span className="icon-Icon13" style={{color: "var(--color4)"}}/>
                        </div>
                        <div className="swap-input py-2 px-3">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <div className={"d-flex justify-content-start"}>
                                        {swapUtils.removeEndZeros(this.showInputValue(modeStruct.field0.value))}
                                    </div>
                                    <small className={"d-flex justify-content-start usd-price"}>
                                        {swapUtils.showUSDPrice(firstTokenUsd)}
                                    </small>
                                </div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <LogoToken data = {{
                                        url : firstToken.logo,
                                        value : firstToken.ticker,
                                        net : this.props.net
                                    }}/>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <div className={"d-flex justify-content-start"}>
                                        {swapUtils.removeEndZeros(this.showInputValue(modeStruct.field1.value))}
                                    </div>
                                    <small className={"d-flex justify-content-start usd-price"}>
                                        {swapUtils.showUSDPrice(secondTokenUsd)}
                                    </small>
                                </div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <LogoToken data = {{
                                        url : secondToken.logo,
                                        value : secondToken.ticker,
                                        net : this.props.net
                                    }}/>
                                </div>
                            </div>
                            <div className="text-right">
                                {t("trade.swapCard.removeLiquidity.receive")}
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
            case 'field0': {
                if (errObj.field0.msg === "lackOfSecondVolume")
                    return this.makeErrMsg(t(dp + "field1"), errObj.field0)
                return this.makeErrMsg(t(dp + "field0"), errObj.field0)
            }
            case 'field1':
                return this.makeErrMsg(t(dp + "field1"), errObj.field1)
            case 'ltfield':
                return this.makeErrMsg(t(dp + "ltfield"), errObj.ltfield)
            case 'fullField0Value':
                return this.makeErrMsg(t(dp + "fullField0Value"), errObj.fullField0Value)
            case 'nativeToken':
                return this.makeErrMsg(t(dp + "nativeToken"), errObj.nativeToken)
            case 'route':
                return this.makeErrMsg(t(dp + "route"), errObj.route)
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
            if (this.props.menuItem === 'exchange') {
                if (modeStruct.field0.value.value == 0 || modeStruct.field1.value.value == 0)
                    buttonName = this.getSwapCardButtonName('noLiquidityForSwap')
                else
                    buttonName = this.getSwapCardButtonName('swap')
            } else if (this.props.menuItem === 'liquidity' && !this.props.liquidityRemove)
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
            
            if (this.pairExists === false && this.state.route.length === 0 && !this.insufficientFunds || this.props.menuItem === 'liquidity' && this.pairExists === false) {
                let validationResult = {dataValid : false}
                let modeField = _.cloneDeep(this.props[this.getMode()])
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
                        {this.getMode() !== 'removeLiquidity' && this.renderSwapCardButton(buttonName, openConfirmCard, validationResult.dataValid) || <></> }
                    </div>
                )
            }
        }
        return this.renderSwapCardButton(buttonName, openConfirmCard, this.readyToSubmit.dataValid, {
            backgroundColor : (this.props.connectionStatus) ? undefined : 'var(--color5)'
        })
    }

    getBalanceColor (id) {
        let c_color = { danger : '#61c2d077', simple : '#61c2d0', alert: '#e03266' };
        let danger = { color : c_color.danger },
            simple = { color : c_color.simple },
            withoutLiquidity = {color: c_color.alert};

        if (id === 1 && this.state.notEnoughLiquidity)
            return withoutLiquidity;
        if (id === 4 || id === 5)
            return simple;
        if (this.enoughMoney.indexOf(id) === -1)
            return simple;
        else
            return danger;
    };

    getInputField(props) {
        let ticker = props.fieldData.token.ticker, tokenBalance = {value: 0, decimals: 0}
        if (ticker === undefined)
            ticker = this.props.t('trade.swapCard.inputField.selectToken');
        let balanceInUsd = swapUtils.countUSDPrice(props.fieldData.balance, props.fieldData.token)
        let inputValueInUsd = swapUtils.countUSDPrice(props.fieldData.value, props.fieldData.token)
        return (
            <div className={"pb-2"}>
                <div className="d-flex align-items-center justify-content-between">
                    <div className='input-name'>
                        {props.fieldName}
                    </div>
                    <div className='my-token-amount d-flex justify-content-end'>
                        {this.showBalance(valueProcessor.usCommasBigIntDecimals(props.fieldData.balance.amount, props.fieldData.balance.decimals, props.fieldData.balance.decimals))}
                    </div>
                </div>
                <small className="usd-price d-flex justify-content-end">
                    {swapUtils.showUSDPrice(balanceInUsd)}
                </small>
                <div className="d-flex align-items-center justify-content-between mt-3">
                    <div>
                        <input id={props.id}
                               onChange={e => this.changeField(props.id, e.target)}
                               className='c-input-field mr-2'
                               type='text'
                               value={this.showInputValue(props.fieldData.value)}
                               placeholder='0.0'
                               autoComplete='off'
                               style={this.getBalanceColor(props.id)}>
                        </input>
                        <small className="input-field-usd d-flex">
                            {swapUtils.showUSDPrice(inputValueInUsd)}
                        </small>
                    </div>
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
                        recalculateSwapForNewToken={this.recalculateSwapForNewToken.bind(this)}
                        swapPair={this.swapPair.bind(this)}
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
        if (valueObj.value < 0n) {
            valueObj.value = 0n
            res = ''
        }
        return res
    }

    showPoolShare () {
        let res = swapUtils.poolShareWithStaked(this.props.tokens, this.props.balances, this.props.farmsList, this.activePair, this.props.liquidity)
        if (res === undefined)
            return '-';
        if (res < 0.001)
            res = '< 0.001';
        return res.substring(0, 7) + ' %';
    };

    showBalance (balance) {
        return (balance === '-') ? balance : `${this.props.t('trade.swapCard.inputField.balance')}: ${balance}`;
    };

    showExchangeRate (route, firstToken) {
        return utils.removeEndZeros(utils.countExchangeRate(route, firstToken, this.props.tokens))
    };

    toFixedPercent (num, fixedLength) {
        if (num > 100)
            return "> 100"
        num = num.toString().split(".")
        if (num.length === 2)
            return num[0] + "." + num[1].substring(0, fixedLength)
        return num[0]
    }

    showPercents (fixedLength=1) {
        let percents = this.rmPercents
        if (typeof percents === "string")
            percents = percents.replace(/,/g, "")
        let result = '-';
        if (!Number.isNaN(percents))
            result = this.toFixedPercent(percents, fixedLength);
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
        let mode = this.getMode()
        let field = this.getFieldName(fieldProps.id)
        if (mode === "removeLiquidity") {
            field = "ltfield"
        }
        if (mode === "exchange") {
            field = "field0"
            if (fieldProps.id === 0)
                lsdp.simple.write("ENEXSwapCalcDirection", "down", true)
            else
                lsdp.simple.write("ENEXSwapCalcDirection", "up", true)

        }

        let decimals = this.props[mode][field].token.decimals
        let value, activeHash
        if (mode === "exchange" || mode === "removeLiquidity") {
            activeHash = this.props[mode][field].token.hash
            value = BigInt(this.props[mode][field].balance.amount)
        } else {
            activeHash = fieldProps.fieldData.token.hash
            value = BigInt(fieldProps.fieldData.balance.amount)
        }

        if (activeHash === this.props.mainToken && mode !== "removeLiquidity") {
            value -= BigInt(this.props.mainTokenFee !== undefined ? this.props.mainTokenFee : presets.network.nativeToken.fee)
            if (value < 0) {
                value = 0n
            }
        }

        let newValObj = {
            value    : value,
            decimals : decimals,
            text     : valueProcessor.usCommasBigIntDecimals (value, decimals, decimals).replace(',','')
        }
        this.props.assignCoinValue(mode, field, newValObj)
        let fieldObj = _.cloneDeep(this.props[mode][field])
        fieldObj.value = newValObj

        if (mode === "exchange")
            this.changeField(0, {value: _.cloneDeep(newValObj.text)})
        else if (mode === "removeLiquidity") 
            this.changeField(6, {value: _.cloneDeep(newValObj.text)})
        else 
            this.changeField(fieldProps.id, {value: _.cloneDeep(newValObj.text)})

        let modeData = _.cloneDeep(this.props[mode])
        modeData[field] = fieldObj

        this.establishReadiness(this.validateSwapCard(modeData))
    }

    changeField (fieldId, target) {
        try {
            this.routingWorker.close()
        } catch (e) {console.log(e)}
        this.routingWorker = workerProcessor.spawn("/js/enex.routingWorker.js")
        if (target.value === undefined)
            return
        let mode = this.getMode(), field = this.getFieldName(fieldId), 
        
        newValue = target.value.toString()
        if (newValue === "." || newValue === ",")
            newValue = "0."
        newValue = newValue.replace(/[^0-9|\.]+/g, '')
        
        
        let modeData = _.cloneDeep(this.props[mode]), fieldData = _.cloneDeep(modeData[field])
        let oldValObj = _.cloneDeep(fieldData.value)

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
            // if (!this.validator.batchValidate(this.activePair, rules).dataValid) {
            //     if (this.activePair.token_1.hash === fieldData.token.hash) {
            //         newValObj.value = this.activePair.token_1.volume - 1
            //         newValObj.text = this.numWithoutCommas(this.activePair.token_1.volume - 1, newValObj.decimals)
            //     } else {
            //         newValObj.value = this.activePair.token_0.volume - 1
            //         newValObj.text = this.numWithoutCommas(this.activePair.token_0.volume - 1, newValObj.decimals)
            //     }
            // }
            this.props.assignCoinValue(mode, field, newValObj)

            let cField = this.getFieldName(fieldId, true)
            if (mode === "exchange") {
                // this.props.assignCoinValue(this.getMode(), cField, {
                //     value : 0n,
                //     decimals : 10,
                //     text : "0"
                // })

                if (this.routingWorker) {
                    this.setState({
                        routingWaiting: true,
                        routingVisibility: true,
                        route: []
                    })
                    let promise
                    // if (this.abortController)
                    //     this.abortController.abort()
                    // this.abortController = new AbortController()
                    if (fieldData.token.hash === this.props[mode].field0.token.hash) {
                        lsdp.simple.write("ENEXSwapCalcDirection", "down", true)
                        promise = this.countRoute(fieldData, _.cloneDeep(this.props[mode][cField]), "sell")
                    } else {
                        lsdp.simple.write("ENEXSwapCalcDirection", "up", true)
                        promise = this.countRoute(fieldData, _.cloneDeep(this.props[mode][cField]), "buy")
                    }
                    this.handleRoutePromise(promise, cField)
                }
            } else {
                let activePairRules = this.swapCardValidationRules.getActivePairValidationRules(this.activePair)
                checkResult = this.validator.batchValidate(this.activePair, activePairRules)
                if (checkResult.dataValid) {
                    this.setState({
                        routingVisibility: false
                    })
                    this.countOppositeField(fieldData, cField, field)
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

    countAddLiquidityPrice(activeField, oppositeField, pair) {
        let decimals = [activeField.token.decimals, oppositeField.token.decimals]
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

    countRoute (activeField, oppositeField, mode="sell") {
        const defLimit = 4, minLimit = 2
        let data = {
            token0 : activeField.token,
            token1 : oppositeField.token,
            amount : activeField.value,
            pairs  : this.props.pairs,
            tokens : this.props.tokens,
            slippage : lsdp.simple.get("ENEXUserSlippage"),
            limit : lsdp.simple.get(settings.routingSwitch, true) === "false" ? minLimit : defLimit,
            mode : mode
        }
        return this.routingWorker.postMessage(data)
    }

    handleRoutePromise (routingExec, cField) {
        routingExec.then(res => {
            this.pairExists = true
            this.props.changeCreatePoolState(false)
            if (res.length) {
                let finalValue = res[(lsdp.simple.get("ENEXSwapCalcDirection", true) === "down") ? res.length - 1 : 0].outcome
                let text
                if (finalValue.value < 0n)
                    text = "-" + this.bigIntToString(-finalValue.value, finalValue.decimals)
                else
                    text = this.bigIntToString(finalValue.value, finalValue.decimals)

                // if (finalValue.value >= 0n)
                this.props.assignCoinValue(this.getMode(), cField, {
                    value : finalValue.value,
                    decimals : finalValue.decimals,
                    text : text
                })
            } else {
                this.props.setRoute(res)
                this.setState({
                    routingVisibility : false,
                    route: res
                })
                this.pairExists = false
                this.props.changeCreatePoolState(true)
            }
            if (res.find(node => node.notEnoughLiquidity)) {
                this.props.setRoute([])
                this.setState({
                    notEnoughLiquidity : true,
                    routingWaiting : false,
                    routingVisibility : false,
                    route: []
                })
                this.insufficientFunds = true
            } else {
                this.props.setRoute(res)
                this.setState({
                    notEnoughLiquidity : false,
                    routingWaiting : false,
                    route: res
                })
                this.insufficientFunds = false
            }
        })
        .catch(() => {
            try {
                this.routingWorker.close()
            } catch (e) {console.log(e)}
            this.routingWorker = workerProcessor.spawn("/js/enex.routingWorker.js")
        })
    }

    countOppositeField(fieldObj, cField, aField) {
        let mode = this.getMode()
        let oppositeField = _.cloneDeep(this.props[mode][cField])

        if (fieldObj.value.value === undefined)
            return

        if (fieldObj.token.ticker !== presets.swapTokens.emptyToken.ticker && oppositeField.token.ticker !== presets.swapTokens.emptyToken.ticker) {
            if (this.activePair === undefined) {
                return
            }
            if (mode === "removeLiquidity") {
                this.countRemoveLiquidity(mode, aField, fieldObj.value)
            } else {
                if (this.activePair.token_0.volume == 0 || this.activePair.token_1.volume == 0) {
                    //console.log("Ok")
                    return
                }
                let oppositeFieldPrice = this.countAddLiquidityPrice(fieldObj, oppositeField, this.activePair)
                if (oppositeFieldPrice)
                    this.props.assignCoinValue(mode, cField, {
                        value : oppositeFieldPrice.value,
                        decimals : oppositeFieldPrice.decimals,
                        text : this.bigIntToString(oppositeFieldPrice.value, oppositeFieldPrice.decimals)
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

    countRemoveLiquidity (mode, cField, fieldValue) {
        if (new Date().getTime() - this.lastTotalSupplyUpdate > 5000 || this.lastActiveLT && this.props.removeLiquidity.ltfield.token.hash !== this.lastActiveLT.hash) {
            this.lastTotalSupplyUpdate = new Date().getTime()
            swapApi.getTokenInfo(this.props.removeLiquidity.ltfield.token.hash).then(res => {
                res.json().then(info => {
                    this.lastActiveLT = info[0]
                    if (this.lastActiveLT)
                        this.countFullRemoveLiquidity(mode, cField, fieldValue, undefined, this.lastActiveLT.total_supply)
                })
            })
        } else {
            if (this.lastActiveLT)
                this.countFullRemoveLiquidity(mode, cField, fieldValue, undefined, this.lastActiveLT.total_supply)
        }
    }

    countFullRemoveLiquidity (mode, cField, fieldValue, forcedLt, total_supply) {
       
        let trio = {
            t0 : this.props.removeLiquidity.field0.value,
            t1 : this.props.removeLiquidity.field1.value,
            lt : {
                value : this.props.removeLiquidity.ltfield.value.value,
                decimals : this.props.removeLiquidity.ltfield.value.decimals,
                total_supply : {
                    value : total_supply,
                    decimals : this.props.removeLiquidity.ltfield.token.decimals
                }
            }
        }

        if (cField === "field0") {
            trio.t0 = fieldValue
        } else if (cField === "field1") {
            trio.t1 = fieldValue
        } else if (cField === "ltfield") {
            trio.lt.value = fieldValue.value
            trio.lt.decimals = fieldValue.decimals
        }

        let counted = testFormulas.ltDestruction(this.props.tokens, this.activePair, trio, cField);
        if (!Object.keys(counted.t0).length || !Object.keys(counted.t1).length) { // invalid ltDestruction
            let zeroValue = {value: 0, decimals: 0, text: '0'};
            this.assignCoinValueWithText(mode, 'field0',  zeroValue);
            this.assignCoinValueWithText(mode, 'field1',  zeroValue);
            this.assignCoinValueWithText(mode, 'ltfield', zeroValue);
            return;
        }
        let balanceObj = {value : this.props.removeLiquidity.ltfield.balance.amount, decimals : this.props.removeLiquidity.ltfield.balance.decimals};
        let rmPercent = utils.countPercentsByPortion(balanceObj, counted.lt);
        this.rmPercents = rmPercent;
        if (cField !== 'field0')
            this.assignCoinValueWithText(mode, 'field0',  counted.t0);
        if (cField !== 'field1')
            this.assignCoinValueWithText(mode, 'field1',  counted.t1);
        if (cField !== 'ltfield')
            this.assignCoinValueWithText(mode, 'ltfield', counted.lt);
        // if (!this.isValidPercent(rmPercent) && forcedLt === undefined) {
        //     let full = this.props.removeLiquidity.ltfield.balance.amount;
        //     this.rmPercents = 100;
        //     this.props.assignCoinValue(mode, 'ltfield', {
        //         value : full,
        //         decimals : fieldValue.decimals,
        //         text : this.bigIntToString(full, fieldValue.decimals)
        //     });
        //     this.countFullRemoveLiquidity(mode, 'ltfield', fieldValue, full, total_supply);
        // } else {
        //     this.rmPercents = rmPercent;
        //     if (cField !== 'field0')
        //         this.assignCoinValueWithText(mode, 'field0',  counted.t0);
        //     if (cField !== 'field1')
        //         this.assignCoinValueWithText(mode, 'field1',  counted.t1);
        //     if (cField !== 'ltfield')
        //         this.assignCoinValueWithText(mode, 'ltfield', counted.lt);
        // }
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
                value : this.props.mainTokenFee,
                decimals : swapUtils.getTokenObj(this.props.tokens, this.props.mainToken).decimals
            }, modeData.field0.value)
        } else {
            modeData.fullField0Value = undefined
        }
        if (modeData.field0.value.text && modeData.field1.value.text) {
            modeData.route = this.state.route
            let rules = this.swapCardValidationRules.getSwapCardValidationRules(modeData, this.getMode())
            return this.validator.batchValidate(modeData, rules)
        } else {
            return {dataValid : false}
        }
    }

    closeTokenList(tokenObj, activeField) {
        this.props.closeTokenList()
        let mode = this.getMode(), modeData = _.cloneDeep(this.props[mode])
        if (tokenObj) {
            modeData[activeField].token = tokenObj
            this.establishReadiness(this.validateSwapCard(modeData))
        }
    }

    changeAddRemoveCards(mode) {
        if (mode === 'liquidity') {
            this.handBack = true;
            this.changeLiquidityMode();
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
        let token0 = _.cloneDeep(this.props[mode].field0.token);
        let token1 = _.cloneDeep(this.props[mode].field1.token);
        this.activePair = utils.searchSwap(this.props.pairs, [token0, token1], (mode === 'removeLiquidity') ? this.props[mode].ltfield.token.hash : undefined);
        this.pairExists = utils.pairExists(this.activePair)
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
        let f0 = _.cloneDeep(this.props[mode].field0);
        let f1 = _.cloneDeep(this.props[mode].field1);
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
        if (subtraction1.value < 0 && (this.props.menuItem !== 'exchange' || !this.state.route.length))
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
        this.establishReadiness(this.validateSwapCard(_.cloneDeep(this.props[this.getMode()])))
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