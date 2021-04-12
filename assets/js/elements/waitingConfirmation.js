import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import '../../css/confirm-supply.css';

class WaitingConfirmation extends React.Component {
    constructor(props) {
        super(props);
        this.explorer_href = '#BLANK-LINK-TO-EXPLORER'; //ссылка для View on pulse.enecuum.com
    };

    getHeaderPropNameByType() {
        let modalHeaderPropName = ""
        if (this.props.txStateType === 'submitted')
            modalHeaderPropName = "transactionSubmitted";
        else if (this.props.txStateType === 'waiting')
            modalHeaderPropName = "waitingForConfirmation"; 
        return modalHeaderPropName;
    }

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
                                    onClick={this.props.closeWaitingConfirmation.bind(this.props)}
                                >{ this.props.langData.close }</Button>

                        </>
                    );    
        } else if (this.props.txStateType === 'waiting') {          
            return  (
                        <>
                            <div className="tx-state-icon-waiting spinner d-flex align-items-center justify-content-center mx-auto" />
                            <div>                                
                                <div className="mt-4">Swapping 20.6172 BRY for 0.100203 ENQ</div>
                                <div className="small mt-2">{ this.props.langData.trade.confirmCard.confirmInWallet }</div>
                            </div>                            
                        </>
                    );    
        }
    }

    render() {
        return (
            <>
                <Modal
                    show={this.props.visibility}
                    aria-labelledby="example-custom-modal-styling-title"
                    className={'tx-state-' +  this.props.txStateType}
                    onHide={this.props.closeWaitingConfirmation.bind(this.props)}
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