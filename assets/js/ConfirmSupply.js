import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../css/confirm-supply.css';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps';
import img1 from '../img/logo.png';
import img2 from '../img/bry-logo.png';

class ConfirmSupply extends React.Component {
    closeCard () {
        this.props.closeConfirmCard();
    };

    render() {
        let langData = this.props.langData;
        return (
            <>
                <Modal
                    show={this.props.confirmCardOpened}
                    aria-labelledby="example-custom-modal-styling-title"
                    onHide={this.closeCard.bind(this)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    {langData.header}
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="h3 font-weight-bold">
                            0.96478
                        </div>
                        <div className="d-flex align-items-center justify-content-center token-pair-logo-wrapper mb-3">
                            <div
                                className="logo-wrapper-sm"
                                style = {{ 
                                    backgroundImage: `url(${img1})`
                                }} />   
                            <div
                                className="logo-wrapper-sm"
                                style = {{
                                    backgroundImage: `url(${img2})`
                                }} /> 
                        </div>
                        <div className='h5 mb-4'>
                            ENQ/BRY Pool Tokens
                        </div>                        
                        <div className='confirm-supply-description'>
                            {langData.description}
                        </div>
                        <div className="my-5">
                            <div className='d-flex align-items-center justify-content-between mb-2'>
                                <div>
                                    ENQ {langData.deposited}
                                </div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <div
                                        className="logo-wrapper-xs mr-2"
                                        style = {{
                                            backgroundImage: `url(${img1})`
                                        }} /> 
                                    <span>0.0699313</span>
                                </div>
                            </div>
                            <div className='d-flex align-items-center justify-content-between mb-2'>
                                <div>
                                    BRY {langData.deposited}
                                </div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <div
                                        className="logo-wrapper-xs mr-2"
                                        style = {{
                                            backgroundImage: `url(${img2})`
                                        }} /> 
                                    <span>14.3588</span>
                                </div>
                            </div>
                            <div className='d-flex align-items-start justify-content-between mb-2'>
                                <div>
                                    {langData.rates}
                                </div>
                                <div className='text-right'>
                                    <div>1 ENQ = 206.3 BRY</div>
                                    <div>1 BRY = 0.00487 ENQ</div>
                                </div>
                            </div>
                            <div className='d-flex align-items-start justify-content-between'>
                                <div>
                                    {langData.shareOfPool}
                                </div>
                                <div>
                                    0.0001204%
                                </div>
                            </div>                            
                        </div>
                        <Button className='btn-secondary confirm-supply-button w-100'>{langData.submit}</Button>
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

const WConfirmSupply = connect(mapStoreToProps(components.CONFIRM_SUPPLY), mapDispatchToProps(components.CONFIRM_SUPPLY))(ConfirmSupply);

export default WConfirmSupply;
