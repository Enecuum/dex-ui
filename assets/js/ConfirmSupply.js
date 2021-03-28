import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../css/confirm-supply.css';

class ConfirmSupply extends React.Component {
    constructor(props) {
        super(props);
        this.root = props.root;
        this.lang = props.lang;
    };

    closeCard () {
        this.setState({ confirmCard : false });
    };

    render() {
        console.log(this.lang.trade.confirmCard);
        let langData = this.lang.trade.confirmCard;
        return (
            <>
                <Modal
                    show={this.root.state.confirmCard}
                    aria-labelledby="example-custom-modal-styling-title"
                    onHide={this.closeCard.bind(this.root)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span className="mr-3">
                                    {langData.header}
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h1 className='mt-3'>
                            0.96478
                        </h1>
                        <h5 className='mt-4'>
                            ENQ/BRY Pool Tokens
                        </h5>
                        <div class='confirm-supply-description mt-4'>
                            {langData.description}
                        </div>
                        <div className='mt-5'>
                            <div className='row'>
                                <div className='col'>
                                    ENQ {langData.deposited}
                                </div>
                                <div className='col d-flex justify-content-end'>
                                    0.0699313
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col'>
                                    BRY {langData.deposited}
                                </div>
                                <div className='col d-flex justify-content-end'>
                                    14.3588
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col'>
                                    {langData.rates}
                                </div>
                                <div className='col-4'>
                                    <div className='row d-flex justify-content-center'>1 ENQ = 206.3 BRY</div>
                                    <div className='row'>1 BRY = 0.00487 ENQ</div>
                                </div>
                            </div>
                            <div className='row mb-5'>
                                <div className='col'>
                                    {langData.shareOfPool}
                                </div>
                                <div className='col d-flex justify-content-end'>
                                    0.0001204%
                                </div>
                            </div>
                            <Button className='confirm-supply-button'>{langData.submit}</Button>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

export default ConfirmSupply;