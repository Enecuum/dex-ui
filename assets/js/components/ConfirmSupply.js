import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import PairLogos from '../components/PairLogos';
import LogoToken from '../elements/LogoToken';

import utils from '../utils/swapUtils.js'
import testFormulas from '../utils/testFormulas';
import extRequests from '../requests/extRequests';

import img1 from '../../img/logo.png';
import img2 from '../../img/bry-logo.png';
import '../../css/confirm-supply.css';

class ConfirmSupply extends React.Component {
    closeCard () {
        this.props.closeConfirmCard();
    };

    sendTransaction (pair) {
        this.closeCard();
        this.props.openWaitingConfirmation();
        this.props.showPendingIndicator();
        let tx;
        if (utils.pairExists(pair)) {
            if (this.props.menuItem == 'exchange') {
                tx = extRequests.swap(this.props.pubkey, this.props.exchange);
            } else if (this.props.menuItem == 'liquidity') {
                tx = extRequests.addLiquidity(this.props.pubkey, this.props.liquidity);
            }
        } else {
            tx = extRequests.createPool(this.props.pubkey, this.props[this.props.menuItem]);
        }
        tx.then(result => {
            console.log(result);
            this.props.hidePendingIndicator();
            this.props.changeWaitingStateType('submitted');
        },
        error => {
            this.props.hidePendingIndicator();
            this.props.changeWaitingStateType('rejected');
        });
    };

    render() {
        let langData = this.props.langData;
        let modeStruct = this.props[this.props.menuItem];
        let firstToken = modeStruct.field0.token;
        let secondToken = modeStruct.field1.token;
        let pair = utils.searchSwap(this.props.pairs, [modeStruct.field0.token, modeStruct.field1.token]);
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
                            { testFormulas.countEnxAmount(pair, modeStruct, this.props.menuItem) }
                        </div>
                        <PairLogos logos={{logo1 : img1, logo2 : img2, logoSize : 'sm'}} />
                        <div className='h5 mb-4'>
                            {firstToken.ticker}/{secondToken.ticker} Pool Tokens
                        </div>                        
                        <div className='confirm-supply-description'>
                            {langData.description}
                        </div>
                        <div className="my-5">
                            <div className='d-flex align-items-center justify-content-between mb-2'>
                                <div>
                                    {firstToken.ticker} {langData.deposited}
                                </div>
                                <LogoToken data={{url : img1, value : modeStruct.field0.value}} />
                            </div>
                            <div className='d-flex align-items-center justify-content-between mb-2'>
                                <div>
                                    {secondToken.ticker} {langData.deposited}
                                </div>
                                <LogoToken data={{url : img2, value : modeStruct.field1.value}} />
                            </div>
                            <div className='d-flex align-items-start justify-content-between mb-2'>
                                <div>
                                    {langData.rates}
                                </div>
                                <div className='text-right'>
                                    <div>1 {firstToken.ticker} = {utils.countExchangeRate(pair, true, modeStruct)} {secondToken.ticker}</div>
                                    <div>1 {secondToken.ticker} = {utils.countExchangeRate(pair, false, modeStruct)} {firstToken.ticker}</div>
                                </div>
                            </div>
                            <div className='d-flex align-items-start justify-content-between'>
                                <div>
                                    {langData.shareOfPool}
                                </div>
                                <div>
                                    {utils.countPoolShare(pair, modeStruct)}%
                                </div>
                            </div>                  
                        </div>
                        <Button className='btn-secondary confirm-supply-button w-100'
                                onClick={this.sendTransaction.bind(this, pair)}>
                            {langData.confirm}
                        </Button>
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

const WConfirmSupply = connect(mapStoreToProps(components.CONFIRM_SUPPLY), mapDispatchToProps(components.CONFIRM_SUPPLY))(ConfirmSupply);

export default WConfirmSupply;