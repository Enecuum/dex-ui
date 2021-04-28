import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import '../../css/confirm-supply.css';

class WaitingConfirmation extends React.Component {
    constructor(props) {
        super(props);
        this.explorer_href = '#BLANK-LINK-TO-EXPLORER'; //ссылка для View on pulse.enecuum.com - должно быть нечто вроде 'https://pulse.enecuum.com/линк_с_хэшем_транзакции_ИЛИ_аккаунта'
        this.explorer_href_alias = 'pulse.enecuum.com'; //"Красивая"ссылка для View on pulse.enecuum.com
    };

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
        let descriptionPhrase = '';
        let interpolateParams = {
            value0 : this.props[this.props.menuItem].field0.value,
            ticker0 : this.props[this.props.menuItem].field0.token.ticker,
            value1 : this.props[this.props.menuItem].field1.value,
            ticker1 : this.props[this.props.menuItem].field1.token.ticker
        }

        if (!this.props.createPool) {
            if (this.props.menuItem == 'exchange') {
                descriptionPhrase = 'trade.confirmCard.waitingForConfirmationInternals.swap.completePhrase';
            } else if (this.props.menuItem == 'liquidity') {
                descriptionPhrase = 'trade.confirmCard.waitingForConfirmationInternals.addLiquidity.completePhrase';
            }
        } else {
            descriptionPhrase = 'trade.confirmCard.waitingForConfirmationInternals.createPool.completePhrase';
        }

        return this.props.t(descriptionPhrase, interpolateParams);
    };

    getContentByType() {
        if (this.props.txStateType === 'submitted') {
            return  (
                        <>
                            <div className="tx-state-icon-wrapper bordered d-flex align-items-center justify-content-center mx-auto">
                                <span className="tx-state-icon icon-Icon13"/>                                
                            </div>
                            <a className="view-in-explorer d-block hover-pointer mt-4"
                                href = { this.explorer_href }
                                target = "_blank" >
                                <span className="mr-3">{ this.props.t('viewOnSite', {'site' : this.explorer_href_alias})}</span>
                                <span className="icon-Icon11"></span>
                            </a>
                            <Button
                                className='btn-secondary mx-auto mt-3'
                                onClick={this.closeWaitingConfirmation.bind(this)} >
                                    { this.props.t('close') }
                            </Button>

                        </>
                    );    
        } else if (this.props.txStateType === 'waiting') {       
            return  (
                        <>
                            <div className="tx-state-icon-waiting spinner d-flex align-items-center justify-content-center mx-auto" />
                            <div>                                
                                <div className="mt-4">{ this.getDescription() }</div>
                                <div className="small mt-2">{ this.props.t('trade.confirmCard.confirmInWallet') }</div>
                            </div>                     
                        </>
                    );    
        }
    }

    closeWaitingConfirmation () {
        this.props.closeWaitingConfirmation();
        setTimeout(() => {
            this.props.changeWaitingStateType('waiting')
        }, 1000);
    };

    render() {        
        return (
            <>
                <Modal
                    show={this.props.visibility}
                    aria-labelledby="example-custom-modal-styling-title"
                    className={'tx-state-' +  this.props.txStateType}
                    onHide={this.closeWaitingConfirmation.bind(this)}
                    centered >
                    <Modal.Header closeButton  className="pb-0">
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    { this.props.t([this.getHeaderPropNameByType()]) }
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center">
                            { this.getContentByType() }
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

const WWaitingConfirmation = connect(mapStoreToProps(components.WAITING_CONFIRMATION), mapDispatchToProps(components.WAITING_CONFIRMATION))(withTranslation()(WaitingConfirmation));

export default WWaitingConfirmation;