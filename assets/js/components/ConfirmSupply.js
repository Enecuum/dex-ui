import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps'
import { withTranslation } from "react-i18next"

import CommonModal from "../elements/CommonModal"
import PairLogos from '../components/PairLogos'
import {LogoToken} from '../elements/LogoToken'
import {WaitingConfirmation} from "./entry"

import utils from '../utils/swapUtils.js'
import testFormulas from '../utils/testFormulas'
import extRequests from '../requests/extRequests'
import ValueProcessor from '../utils/ValueProcessor'
import lsdp from "../utils/localStorageDataProcessor"
import generateTxText from "../utils/txTextGenerator"
import pageDataPresets from "../../store/pageDataPresets"

import img1 from '../../img/logo.png'
import img2 from '../../img/bry-logo.png'
import '../../css/confirm-supply.css'
import swapUtils from "../utils/swapUtils.js";

const valueProcessor = new ValueProcessor()


class ConfirmSupply extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            currentTxHash : '',
            txStatus : 'waiting',
            confirmSupplyVisibility : false,
            waitingCardVisibility : false
        }
    }

    getBigIntValue (num) { 
        if (num && num !== Infinity) 
            return valueProcessor.valueToBigInt(num.toFixed(10)).value;
    };

    renderModalHeader () {
        return (
            <Modal.Title id="example-custom-modal-styling-title">
                <div className="d-flex align-items-center justify-content-start">
                    <span>
                        {this.props.t('trade.confirmCard.header')}
                    </span>
                </div>
            </Modal.Title>
        )
    }

    renderModalBody () {
        const t = this.props.t
        let modeStruct = this.props.menuItem === 'exchange' || this.props.menuItem === 'liquidity' ? this.props[this.props.menuItem] : this.props.exchange
        let firstToken = modeStruct.field0.token
        let secondToken = modeStruct.field1.token
        let pair = utils.searchSwap(this.props.pairs, [modeStruct.field0.token, modeStruct.field1.token])
        let ltValue
        if (this.props.menuItem === 'liquidity') {
            try {
                ltValue = testFormulas.countLTValue(pair, modeStruct, this.props.menuItem, this.props.tokens)
            } catch (e) {
                ltValue = 0
            }
        } else
            ltValue = 0

        if (this.props.menuItem === 'liquidity' && this.props.liquidityRemove && !this.state.waitingCardVisibility) {
            let field0 = this.props.removeLiquidity.field0
            let field1 = this.props.removeLiquidity.field1
            return (
                <>
                    <div className="m-2 mb-4">
                        <div className="d-flex justify-content-between mb-2">
                            {valueProcessor.usCommasBigIntDecimals(field0.value.value, field0.value.decimals)}
                            <LogoToken data={{
                                url : field0.token.logo,
                                value : field0.token.ticker,
                                net : this.props.net
                            }} />
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            {valueProcessor.usCommasBigIntDecimals(field1.value.value, field1.value.decimals)}
                            <LogoToken data={{
                                url : field1.token.logo,
                                value : field1.token.ticker,
                                net : this.props.net
                            }} />
                        </div>
                    </div>
                    <Button
                        className='btn-secondary confirm-supply-button w-100'
                        onClick={this.sendTransaction.bind(this, pair)}
                    >
                        {this.props.t('trade.swapCard.submitButton.removeLiquidity')}
                    </Button>
                </>
            )
        }

        return (
            <>
                <div className="h3 font-weight-bold">
                    { valueProcessor.usCommasBigIntDecimals(ltValue.value, ltValue.decimals) }
                </div>
                <PairLogos logos={{
                        logo1 : firstToken.logo,
                        logo2 : secondToken.logo,
                        net : this.props.net,
                        size : 'sm'
                    }}
                />
                <div className='h5 mb-4'>
                    {
                        (this.props.menuItem === 'liquidity')
                        &&
                        t('pairPoolTokens', {
                            token0: (firstToken.ticker) ? firstToken.ticker : '',
                            token1: (secondToken.ticker) ? secondToken.ticker : ''
                        })
                        ||
                        t('receiveToken', {
                            token0: (secondToken.ticker) ? secondToken.ticker : ''
                        })
                    }
                </div>
                <div className='confirm-supply-description'>
                    {(this.props.menuItem === 'liquidity') && t('trade.confirmCard.description')}
                </div>
                <div className="my-5">
                    <div className='d-flex align-items-center justify-content-between mb-2'>
                        <div>
                            {firstToken.ticker} {t('trade.confirmCard.deposited')}
                        </div>
                        <LogoToken data={{
                            url : modeStruct.field0.token.logo,
                            value : modeStruct.field0.value.text,
                            net : this.props.net
                        }} />
                    </div>
                    <div className='d-flex align-items-center justify-content-between mb-2'>
                        <div>
                            {secondToken.ticker}
                            {
                                (this.props.menuItem === 'liquidity')
                                &&
                                ' ' + t('trade.confirmCard.deposited')
                                ||
                                ' ' + t('trade.confirmCard.toBeReceived')
                            }
                        </div>
                        <LogoToken data={{
                            url : modeStruct.field1.token.logo,
                            value : modeStruct.field1.value.text,
                            net : this.props.net
                        }} />
                    </div>
                    <div className='d-flex align-items-start justify-content-between mb-2'>
                        <div>
                            {t('trade.confirmCard.rates')}
                        </div>
                        <div className='text-right'>
                            <div>1 {firstToken.ticker} = {utils.countExchangeRate(pair, true, modeStruct)} {secondToken.ticker}</div>
                            <div>1 {secondToken.ticker} = {utils.countExchangeRate(pair, false, modeStruct)} {firstToken.ticker}</div>
                        </div>
                    </div>
                    <div className='d-flex align-items-start justify-content-between'>
                        <div>
                            {t('trade.confirmCard.feeData')}
                        </div>
                        <div>
                            {valueProcessor.usCommasBigIntDecimals(this.props.nativeToken.fee_value, this.props.nativeToken.decimals)} {this.props.nativeToken.ticker}
                        </div>
                    </div>
                    <div className='d-flex align-items-start justify-content-between'>
                        <div>
                            {t('trade.confirmCard.shareOfPool')}
                        </div>
                        <div>
                            {utils.poolShareWithStaked(this.props.tokens, this.props.balances, this.props.farmsList, pair, modeStruct)}%
                        </div>
                    </div>
                </div>
                <Button
                    className='btn-secondary confirm-supply-button w-100'
                    onClick={this.sendTransaction.bind(this, pair)}
                >
                    {this.props.t('trade.confirmCard.confirm')}
                </Button>
            </>
        )
    }

    sendTransaction (pair) {
        new Promise((resolve, reject) => {
            let txTypes = pageDataPresets.pending.allowedTxTypes
            let interpolateParams = {
                value0  : this.props[this.props.menuItem].field0.value.text,
                ticker0 : this.props[this.props.menuItem].field0.token.ticker,
                value1  : this.props[this.props.menuItem].field1.value.text,
                ticker1 : this.props[this.props.menuItem].field1.token.ticker,
            }
            let txPromise, txType
            if (utils.pairExists(pair) || this.props.route.length) {
                if (this.props.menuItem === 'exchange') {
                    let percent = valueProcessor.valueToBigInt(lsdp.simple.get("ENEXUserSlippage"), 8)
                    percent.decimals += 2

                    let slippageCalc
                    if (this.props.swapCalculationsDirection === "down") {
                        percent = valueProcessor.sub(valueProcessor.valueToBigInt(1), percent)
                        slippageCalc = valueProcessor.mul(this.props.exchange.field1.value, percent)
                        if (this.props.route.length === 2) {
                            txType = txTypes.pool_sell_exact
                            txPromise = extRequests.sellExact(this.props.pubkey, this.props.exchange, slippageCalc)
                        } else {
                            txType = txTypes.pool_sell_exact_routed
                            txPromise = extRequests.sellExactRouted(this.props.pubkey, this.props.exchange, this.props.route)
                        }
                    } else {
                        slippageCalc = valueProcessor.mul(this.props.exchange.field0.value, percent)
                        slippageCalc = valueProcessor.add(this.props.exchange.field0.value, slippageCalc)
                        if (this.props.route.length === 2) {
                            txType = txTypes.pool_buy_exact
                            txPromise = extRequests.buyExact(this.props.pubkey, this.props.exchange, slippageCalc)
                        } else {
                            txType = txTypes.pool_buy_exact_routed
                            txPromise = extRequests.buyExactRouted(this.props.pubkey, this.props.exchange, this.props.route)
                        }
                    }
                } else if (this.props.menuItem === 'liquidity' && !this.props.liquidityRemove) {
                    txType = txTypes.pool_add_liquidity
                    txPromise = extRequests.addLiquidity(this.props.pubkey, this.props.liquidity)
                } else if (this.props.menuItem === 'liquidity') {
                    interpolateParams = {
                        value0  : this.props.removeLiquidity.field0.value.text,
                        ticker0 : this.props.removeLiquidity.field0.token.ticker,
                        value1  : this.props.removeLiquidity.field1.value.text,
                        ticker1 : this.props.removeLiquidity.field1.token.ticker,
                        value2  : this.props.removeLiquidity.ltfield.value.text,
                        ticker2 : this.props.removeLiquidity.ltfield.token.ticker
                    }
                    txType = txTypes.pool_remove_liquidity
                    txPromise = extRequests.removeLiquidity(this.props.pubkey, this.props.removeLiquidity.ltfield.token.hash, this.props.removeLiquidity.ltfield)
                }
            } else {
                txType = txTypes.pool_create
                txPromise = extRequests.createPool(this.props.pubkey, this.props[this.props.menuItem])
            }
            this.openWaitingCard()
            txPromise.then(result => {
                this.setState({currentTxHash : result.hash}, () => {
                    this.setState({txStatus : 'submitted'})
                    lsdp.write(result.hash, 0, txType, interpolateParams)
                    resolve()
                })
            }, () => {
                this.setState({txStatus : 'rejected'}, () => {
                    reject()
                })
            })
        })
    }

    openConfirmCard () {
        this.setState({confirmSupplyVisibility: true})
    }

    closeConfirmCard () {
        this.setState({confirmSupplyVisibility : false})
    }

    openWaitingCard () {
        this.setState({waitingCardVisibility: true})
    }

    closeWaitingCard () {
        this.setState({waitingCardVisibility: false})
        this.setState({txStatus : 'waiting'})
    }

    renderWaitingConfirmation () {
        if (this.state.waitingCardVisibility)
            return (
                <WaitingConfirmation closeWaitingCard={this.closeWaitingCard.bind(this)}
                                     closeConfirmCard={this.closeConfirmCard.bind(this)}
                                     txStateType={this.state.txStatus}
                                     currentTxHash={this.state.currentTxHash}
                                     confirmSupplyVisibility={this.state.confirmSupplyVisibility}
                />
            )
    }

    render() {
        return (
            <>
                {this.props.getSubmitButton(this.props.modeStruct, this.openConfirmCard.bind(this))}
                {this.state.confirmSupplyVisibility && <CommonModal
                    renderHeader={this.renderModalHeader.bind(this)}
                    renderBody={this.renderModalBody.bind(this)}
                    closeAction={this.closeConfirmCard.bind(this)}
                />}
                {this.renderWaitingConfirmation()}
            </>
        )
    }
}

const WConfirmSupply = connect(
    mapStoreToProps(components.CONFIRM_SUPPLY),
    mapDispatchToProps(components.CONFIRM_SUPPLY)
)(withTranslation()(ConfirmSupply))

export default WConfirmSupply