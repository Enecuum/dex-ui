import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';

import '../../css/confirm-supply.css';

const valueProcessor = new ValueProcessor();

class ConfirmIssueToken extends React.Component {
    closeCard () {
        this.props.closeConfirmCard();
    };

    sendIssueTokenTx() {
        console.log('отправка транзакции')
    }

    // sendTransaction (pair) {
    //     this.closeCard();
    //     this.props.openWaitingConfirmation();
    //     let tx;
    //     if (utils.pairExists(pair)) {
    //         if (this.props.menuItem == 'exchange') {
    //             tx = extRequests.swap(this.props.pubkey, this.props.exchange);
    //         } else if (this.props.menuItem == 'liquidity') {
    //             tx = extRequests.addLiquidity(this.props.pubkey, this.props.liquidity);
    //         }
    //     } else {
    //         tx = extRequests.createPool(this.props.pubkey, this.props[this.props.menuItem]);
    //     }
    //     tx.then(result => {
    //         console.log(result);
    //         this.props.updCurrentTxHash(result.hash);
    //         this.props.changeWaitingStateType('submitted');
    //     },
    //     error => {
    //         this.props.changeWaitingStateType('rejected');
    //     });
    // };

    getBigIntValue (num) { 
        if (num && num !== Infinity) 
            return valueProcessor.valueToBigInt(num.toFixed(10)).value;
    };

    render() {
        const t = this.props.t;        
        console.log(this.props.dataValid, this.props.possibleToIssueToken)
        return (

            <>
                <Modal
                    show={this.props.dataValid && this.props.possibleToIssueToken}////////////////////////////////////////////////////
                    aria-labelledby="example-custom-modal-styling-title"
                    onHide={this.closeCard.bind(this)}/////////////////////////////////////////////////////
                    centered >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    {t('trade.confirmCard.header')}
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="h3 font-weight-bold">
                            eeeeeeeeeeeeeee
                        </div>

                        <div className="my-5">
                  
                        </div>
                        <Button className='btn-secondary confirm-supply-button w-100'
                                onClick={this.sendIssueTokenTx.bind(this)}>
                            {t('trade.confirmCard.confirm')}
                        </Button>
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

const WConfirmIssueToken = connect(mapStoreToProps(components.CONFIRM_ISSUE_TOKEN), mapDispatchToProps(components.CONFIRM_ISSUE_TOKEN))(withTranslation()(ConfirmIssueToken));

export default WConfirmIssueToken;