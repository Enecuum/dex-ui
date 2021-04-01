import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../css/confirm-supply.css';
import img1 from '../img/logo.png';
import img2 from '../img/bry-logo.png';

class WaitingConfirmation extends React.Component {
    constructor(props) {
        super(props);
        this.root = props.root;
    };
    render() {
        let langData = this.root.state.langData;
        return (
            <>
                <Modal
                    show={false}
                    aria-labelledby="example-custom-modal-styling-title"
                    centered >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    {langData.trade.confirmCard.header}
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
                            {langData.trade.confirmCard.description}
                        </div>
                        <div className="my-5">
                            <div className='d-flex align-items-center justify-content-between mb-2'>
                                <div>
                                    ENQ {langData.trade.confirmCard.deposited}
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
                                    BRY {langData.trade.confirmCard.deposited}
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
                                    {langData.trade.confirmCard.rates}
                                </div>
                                <div className='text-right'>
                                    <div>1 ENQ = 206.3 BRY</div>
                                    <div>1 BRY = 0.00487 ENQ</div>
                                </div>
                            </div>
                            <div className='d-flex align-items-start justify-content-between'>
                                <div>
                                    {langData.trade.confirmCard.shareOfPool}
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

export default WaitingConfirmation;