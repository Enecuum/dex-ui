import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import '../../css/confirm-supply.css';

class WaitingIssueTokenConfirmation extends React.Component {
    constructor(props) {
        super(props);
        this.explorer_href = this.props.net.url;
        this.explorer_tx_href = undefined;
        this.explorer_href_alias = this.props.net.url.replace(/https?:\/\//, '').replace(/\/*$/, '');
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
        let descriptionPhrase = 'etm.issueToken';
        let interpolateParams = {

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
                                href = { this.explorer_tx_href }
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
        this.props.resetStore();        
        setTimeout(() => {
            this.props.changeWaitingStateType('waiting')
        }, 1000);
    };

    render() {
        this.explorer_tx_href = this.explorer_href + '#!/tx/' + this.props.currentTxHash;
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

const WWaitingIssueTokenConfirmation = connect(mapStoreToProps(components.WAITING_ISSUE_TOKEN_CONFIRMATION), mapDispatchToProps(components.WAITING_ISSUE_TOKEN_CONFIRMATION))(withTranslation()(WaitingIssueTokenConfirmation));

export default WWaitingIssueTokenConfirmation;