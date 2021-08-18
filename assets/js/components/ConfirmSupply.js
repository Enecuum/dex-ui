import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import PairLogos from '../components/PairLogos';
import LogoToken from '../elements/LogoToken';

import utils from '../utils/swapUtils.js'
import testFormulas from '../utils/testFormulas';
import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';
import {cookieProcessor as cp} from '../utils/cookieProcessor';

import img1 from '../../img/logo.png';
import img2 from '../../img/bry-logo.png';
import '../../css/confirm-supply.css';

const valueProcessor = new ValueProcessor();

class ConfirmSupply extends React.Component {
    constructor(props) {
        super(props);
    }

    closeCard () {
        this.props.closeConfirmCard();
    };

    sendTransaction (pair) {
        this.closeCard();
        this.props.openWaitingConfirmation();
        let tx;
        if (utils.pairExists(pair)) {
            if (this.props.menuItem === 'exchange') {
                tx = extRequests.swap(this.props.pubkey, this.props.exchange);
            } else if (this.props.menuItem === 'liquidity') {
                tx = extRequests.addLiquidity(this.props.pubkey, this.props.liquidity);
            }
        } else {
            tx = extRequests.createPool(this.props.pubkey, this.props[this.props.menuItem]);
        }
        tx.then(result => {
            this.props.updCurrentTxHash(result.hash);
            this.props.changeWaitingStateType('submitted');
            cp.set(result.hash, 0);
        },
        error => {
            this.props.changeWaitingStateType('rejected');
        });
    };

    getBigIntValue (num) { 
        if (num && num !== Infinity) 
            return valueProcessor.valueToBigInt(num.toFixed(10)).value;
    };

    render() {
        const t = this.props.t;        
        let modeStruct = this.props.menuItem === 'exchange' || this.props.menuItem === 'liquidity' ? this.props[this.props.menuItem] : this.props.exchange;
        let firstToken = modeStruct.field0.token;
        let secondToken = modeStruct.field1.token;
        let pair = utils.searchSwap(this.props.pairs, [modeStruct.field0.token, modeStruct.field1.token]);
        let ltValue = testFormulas.countLTValue(pair, modeStruct, this.props.menuItem, this.props.tokens)
        if (utils.pairExists(pair) && this.props.menuItem === 'exchange' && this.props.confirmCardOpened)
            this.sendTransaction(pair);
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
                                    {t('trade.confirmCard.header')}
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="h3 font-weight-bold">
                            { valueProcessor.usCommasBigIntDecimals(ltValue.value, ltValue.decimals) }
                        </div>
                        <PairLogos logos={{logo1 : img1, logo2 : img2, logoSize : 'sm'}} />
                        <div className='h5 mb-4'>
                            {t('pairPoolTokens', {token0 : (firstToken.ticker) ? firstToken.ticker : '', token1 : (secondToken.ticker) ? secondToken.ticker : ''})}
                        </div>                        
                        <div className='confirm-supply-description'>
                            {t('trade.confirmCard.description')}
                        </div>
                        <div className="my-5">
                            <div className='d-flex align-items-center justify-content-between mb-2'>
                                <div>
                                    {firstToken.ticker} {t('trade.confirmCard.deposited')}
                                </div>
                                <LogoToken data={{url : img1, value : modeStruct.field0.value.text}} />
                            </div>
                            <div className='d-flex align-items-center justify-content-between mb-2'>
                                <div>
                                    {secondToken.ticker} {t('trade.confirmCard.deposited')}
                                </div>
                                <LogoToken data={{url : img2, value : modeStruct.field1.value.text}} />
                            </div>
                            <div className='d-flex align-items-start justify-content-between mb-2'>
                                <div>
                                    {t('trade.confirmCard.rates')}
                                </div>
                                <div className='text-right'>
                                    <div>1 {firstToken.ticker} = {utils.countExchangeRate(pair, true, modeStruct)} {secondToken.ticker}</div>
                                    <div>1 {secondToken.ticker} = {utils.countExchangeRate(pair, false, modeStruct)} {firstToken.ticker}</div>
                                </div>
                            </div>
                            <div className='d-flex align-items-start justify-content-between'>
                                <div>
                                    {t('trade.confirmCard.shareOfPool')}
                                </div>
                                <div>
                                    {utils.countPoolShare(pair, {
                                        value0 : modeStruct.field0.value,
                                        value1 : modeStruct.field1.value
                                    }, this.props.balances, true)}%
                                </div>
                            </div>
                        </div>
                        <Button className='btn-secondary confirm-supply-button w-100'
                                onClick={this.sendTransaction.bind(this, pair)}>
                            {t('trade.confirmCard.confirm')}
                        </Button>
                    </Modal.Body>
                </Modal>
            </>
        );
    };
}

const WConfirmSupply = connect(mapStoreToProps(components.CONFIRM_SUPPLY), mapDispatchToProps(components.CONFIRM_SUPPLY))(withTranslation()(ConfirmSupply));

export default WConfirmSupply;