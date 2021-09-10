import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps'
import { withTranslation } from "react-i18next"

import CommonModal from "../elements/CommonModal"
import PairLogos from '../components/PairLogos'
import LogoToken from '../elements/LogoToken'

import utils from '../utils/swapUtils.js'
import testFormulas from '../utils/testFormulas'
import extRequests from '../requests/extRequests'
import ValueProcessor from '../utils/ValueProcessor'
import lsdp from "../utils/localStorageDataProcessor"

import img1 from '../../img/logo.png'
import img2 from '../../img/bry-logo.png'
import '../../css/confirm-supply.css'
import {WaitingConfirmation} from "./entry";

const valueProcessor = new ValueProcessor();


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
        let ltValue = testFormulas.countLTValue(pair, modeStruct, this.props.menuItem, this.props.tokens)
        if (utils.pairExists(pair) && this.props.menuItem === 'exchange')
            this.sendTransaction(pair)
        return (
            <>
                <div className="h3 font-weight-bold">
                    { valueProcessor.usCommasBigIntDecimals(ltValue.value, ltValue.decimals) }
                </div>
                <PairLogos logos={{logo1 : img1, logo2 : img2, logoSize : 'sm'}} />
                <div className='h5 mb-4'>
                    {t('pairPoolTokens', {token0 : (firstToken.ticker) ? firstToken.ticker : '', token1 : (secondToken.ticker) ? secondToken.ticker : ''})}
                </div>
                <div className='confirm-supply-description'>
                    {t('trade.confirmCard.description')}
                </div>
                <div className="my-5">
                    <div className='d-flex align-items-center justify-content-between mb-2'>
                        <div>
                            {firstToken.ticker} {t('trade.confirmCard.deposited')}
                        </div>
                        <LogoToken data={{url : img1, value : modeStruct.field0.value.text}} />
                    </div>
                    <div className='d-flex align-items-center justify-content-between mb-2'>
                        <div>
                            {secondToken.ticker} {t('trade.confirmCard.deposited')}
                        </div>
                        <LogoToken data={{url : img2, value : modeStruct.field1.value.text}} />
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
                            {t('trade.confirmCard.shareOfPool')}
                        </div>
                        <div>
                            {utils.countPoolShare(pair, {
                                value0 : modeStruct.field0.value,
                                value1 : modeStruct.field1.value
                            }, this.props.balances, true)}%
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

    getDescription () {
        if (this.props[this.props.menuItem] !== undefined) {
            let descriptionPhrase = ''
            let v0 = this.props[this.props.menuItem].field0.value.text
            let v1 = this.props[this.props.menuItem].field1.value.text
            let t0 = this.props[this.props.menuItem].field0.token.ticker
            let t1 = this.props[this.props.menuItem].field1.token.ticker
            let interpolateParams = {
                value0  : (v0 === undefined) ? '' : v0,
                ticker0 : (t0 === undefined) ? '' : t0,
                value1  : (v1 === undefined) ? '' : v1,
                ticker1 : (t1 === undefined) ? '' : t1,
            }

            if (!this.props.createPool) {
                if (this.props.menuItem === 'exchange') {
                    descriptionPhrase = 'trade.confirmCard.waitingForConfirmationInternals.swap.completePhrase'
                } else if (this.props.menuItem === 'liquidity' && !this.props.liquidityRemove) {
                    descriptionPhrase = 'trade.confirmCard.waitingForConfirmationInternals.addLiquidity.completePhrase'
                } else if (this.props.menuItem === 'liquidity') {
                    descriptionPhrase = 'trade.confirmCard.waitingForConfirmationInternals.removeLiquidity.completePhrase'
                }
            } else {
                descriptionPhrase = 'trade.confirmCard.waitingForConfirmationInternals.createPool.completePhrase'
            }

            return this.props.t(descriptionPhrase, interpolateParams)
        }
    }

    sendTransaction (pair) {
        new Promise((resolve, reject) => {
            let txPromise, description = this.getDescription()
            if (utils.pairExists(pair)) {
                if (this.props.menuItem === 'exchange') {
                    txPromise = extRequests.swap(this.props.pubkey, this.props.exchange)
                } else if (this.props.menuItem === 'liquidity') {
                    txPromise = extRequests.addLiquidity(this.props.pubkey, this.props.liquidity)
                }
            } else {
                txPromise = extRequests.createPool(this.props.pubkey, this.props[this.props.menuItem])
            }
            txPromise.then(result => {
                this.setState({currentTxHash : result.hash})
                this.setState({txStatus : 'submitted'})
                lsdp.write(result.hash, 0, description)
                resolve()
            },
            () => {
                this.setState({txStatus : 'rejected'})
                reject()
            })
            this.openWaitingCard()
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
    }

    renderWaitingConfirmation () {
        if (this.state.waitingCardVisibility)
            return (
                <WaitingConfirmation
                    closeWaitingCard={this.closeWaitingCard.bind(this)}
                    closeConfirmCard={this.closeConfirmCard.bind(this)}
                    txStateType={this.state.txStatus}
                    currentTxHash={this.state.currentTxHash}
                    confirmSupplyVisibility={this.state.confirmSupplyVisibility}
                    getDescription={this.getDescription.bind(this)}
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