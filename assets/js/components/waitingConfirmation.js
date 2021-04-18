import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import '../../css/confirm-supply.css';

class WaitingConfirmation extends React.Component {
    constructor(props) {
        super(props);
        this.explorer_href = '#BLANK-LINK-TO-EXPLORER'; //ссылка для View on pulse.enecuum.com
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
        let lang = this.props.langData.trade.confirmCard.waitingForConfirmationInternals;
        let mode, middleWord;
        if (!this.props.createPool) {
            if (this.props.menuItem == 'exchange') {
                mode = lang.swap.header;
                middleWord = lang.swap.to;
            } else if (this.props.menuItem == 'liquidity') {
                mode = lang.addLiquidity.header;
                middleWord = lang.addLiquidity.plus;
            }
        } else {
            mode = lang.createPool.header;
            middleWord = lang.createPool.and;
        }
        let field0 = this.props[this.props.menuItem].field0;
        let field1 = this.props[this.props.menuItem].field1;
        return `${mode} ${field0.value} ${field0.token.ticker} ${middleWord} ${field1.value} ${field1.token.ticker}`;
    };

    getContentByType() {

        // TODO Использовать интерполируемые параметры в i18 для Swapping 20.6172 BRY for 0.100203 ENQ после добавления соответствующего функционала
        // TODO Использовать интерполируемые параметры в i18 для View on pulse.enecuum.com после добавления соответствующего функционала

        if (this.props.txStateType === 'submitted') {
            return  (
                        <>
                            <div className="tx-state-icon-wrapper bordered d-flex align-items-center justify-content-center mx-auto">
                                <span className="tx-state-icon icon-Icon13"/>                                
                            </div>
                            <a className="View-in-explorer d-block hover-pointer mt-4"
                                href = { this.explorer_href }
                                target = "_blank" >
                                <span className="mr-3">View on pulse.enecuum.com</span>
                                <span className="icon-Icon11"></span>
                            </a>
                            <Button className='btn-secondary mx-auto mt-3'
                                    onClick={this.closeWaitingConfirmation.bind(this)}
                                >{ this.props.langData.close }</Button>

                        </>
                    );    
        } else if (this.props.txStateType === 'waiting') {       
            return  (
                        <>
                            <div className="tx-state-icon-waiting spinner d-flex align-items-center justify-content-center mx-auto" />
                            <div>                                
                                <div className="mt-4">{ this.getDescription() }</div>
                                <div className="small mt-2">{ this.props.langData.trade.confirmCard.confirmInWallet }</div>
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
                                    { this.props.langData[this.getHeaderPropNameByType()] }
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

const WWaitingConfirmation = connect(mapStoreToProps(components.WAITING_CONFIRMATION), mapDispatchToProps(components.WAITING_CONFIRMATION))(WaitingConfirmation);

export default WWaitingConfirmation;