import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { withTranslation } from "react-i18next"

import CommonModal from "../elements/CommonModal"

import '../../css/confirm-supply.css'
import {connect} from "react-redux";
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps";
import pageDataPresets from "../../store/pageDataPresets";
import generateTxText from "../utils/txTextGenerator";

class WaitingConfirmation extends React.Component {
    constructor(props) {
        super(props)
        this.explorer_tx_href = undefined
        this.explorer_href = this.props.net.url
        this.explorer_href_alias = this.props.net.url.replace(/https?:\/\//, '').replace(/\/*$/, '')
    }

    getHeaderPropNameByType() {
        let modalHeaderPropName = "";
        if (this.props.txStateType === 'submitted')
            modalHeaderPropName = "transactionSubmitted";
        else if (this.props.txStateType === 'waiting')
            modalHeaderPropName = "waitingForConfirmation";
        else if (this.props.txStateType === 'rejected')
            modalHeaderPropName = "transactionRejected";
        return modalHeaderPropName;
    }

    getDescription () {
        let interpolateParams = {
            value0  : this.props[this.props.menuItem].field0.value.text,
            ticker0 : this.props[this.props.menuItem].field0.token.ticker,
            value1  : this.props[this.props.menuItem].field1.value.text,
            ticker1 : this.props[this.props.menuItem].field1.token.ticker
        }, t = this.props.t
        if (this.props[this.props.menuItem] !== undefined) {
            let textPlace = 'waitingConfirmation', txTypes = pageDataPresets.pending.allowedTxTypes
            if (!this.props.createPool) {
                if (this.props.menuItem === 'exchange') {
                    return generateTxText(t, textPlace, txTypes.pool_sell_exact, interpolateParams)
                } else if (this.props.menuItem === 'liquidity' && !this.props.liquidityRemove) {
                    return generateTxText(t, textPlace, txTypes.pool_add_liquidity, interpolateParams)
                } else if (this.props.menuItem === 'liquidity') {
                    interpolateParams = {
                        value0  : this.props.removeLiquidity.field0.value.text,
                        ticker0 : this.props.removeLiquidity.field0.token.ticker,
                        value1  : this.props.removeLiquidity.field1.value.text,
                        ticker1 : this.props.removeLiquidity.field1.token.ticker,
                        value2  : this.props.removeLiquidity.ltfield.value.text,
                        ticker2 : this.props.removeLiquidity.ltfield.token.ticker
                    }
                    return generateTxText(t, textPlace, txTypes.pool_remove_liquidity, interpolateParams)
                }
            } else {
                return generateTxText(t, textPlace, txTypes.pool_create, interpolateParams)
            }
        }
        return ''
    }

    getContentByType() {
        if (this.props.txStateType === 'submitted') {
            return (
                <>
                    <div className="tx-state-icon-wrapper bordered d-flex align-items-center justify-content-center mx-auto">
                        <span className="tx-state-icon icon-Icon13"/>
                    </div>
                    <a className="view-in-explorer d-block hover-pointer mt-4"
                        href = { this.explorer_tx_href }
                        target = "_blank"
                    >
                        <span className="mr-3">{ this.props.t('viewOnSite', {'site' : this.explorer_href_alias})}</span>
                        <span className="icon-Icon11"/>
                    </a>
                    <Button
                        className='btn-secondary mx-auto mt-3'
                        onClick={this.props.closeWaitingCard.bind(this)}
                    >
                        { this.props.t('close') }
                    </Button>
                </>
            )
        } else if (this.props.txStateType === 'waiting') {
            return  (
                <>
                    <div className="tx-state-icon-waiting spinner d-flex align-items-center justify-content-center mx-auto" />
                    <div>
                        <div className="mt-4">{ this.getDescription() }</div>
                        <div className="small mt-2">{ this.props.t('trade.confirmCard.confirmInWallet') }</div>
                    </div>
                </>
            )
        } else if (this.props.txStateType === 'rejected') {
            return  (
                <>
                    <div className="tx-state-icon-wrapper bordered d-flex align-items-center justify-content-center mx-auto">
                        <span className="tx-state-icon icon-Icon7"/>
                    </div>
                    <Button
                        className='btn-secondary mx-auto mt-5'
                        onClick={this.props.closeWaitingCard.bind(this)}
                    >
                        { this.props.t('close') }
                    </Button>
                </>
            )
        }
    }

    renderModalHeader () {
        return (
            <Modal.Title id="example-custom-modal-styling-title">
                <div className="d-flex align-items-center justify-content-start">
                    <span>
                        { this.props.t([this.getHeaderPropNameByType()]) }
                    </span>
                </div>
            </Modal.Title>
        )
    }

    renderModalBody () {
        return (
            <div className="text-center">
                { this.getContentByType() }
            </div>
        )
    }

    render () {
        if (this.props.confirmSupplyVisibility)
            this.props.closeConfirmCard()
        this.explorer_tx_href = this.explorer_href + '#!/tx/' + this.props.currentTxHash
        return (
            <>
                <CommonModal
                    modalClassName={'tx-state-' + this.props.txStateType}
                    renderHeader={this.renderModalHeader.bind(this)}
                    renderBody={this.renderModalBody.bind(this)}
                    closeAction={this.props.closeWaitingCard.bind(this)}
                />
            </>
        )
    }
}

const WWaitingConfirmation = connect(
    mapStoreToProps(components.WAITING_CONFIRMATION),
    mapDispatchToProps(components.WAITING_CONFIRMATION)
)(withTranslation()(WaitingConfirmation))

export default WWaitingConfirmation