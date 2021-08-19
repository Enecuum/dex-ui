import React from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import AccountShortInfo from "./AccountShortInfo";

import extRequests from '../requests/extRequests';
import swapApi from '../requests/swapApi';
import utils from '../utils/swapUtils';
import ValueProcessor from '../utils/ValueProcessor';

const valueProcessor = new ValueProcessor();

class IndicatorPanel extends React.Component {
    constructor (props) {
        super(props);
        this.updData();
        this.intervalDescriptor = this.circleUpd();
        this.state = {
            accountInfoVisibility : false
        };
    };

    componentWillUnmount() {
        clearInterval(this.intervalDescriptor)
    }

    renderPendingIndicator () {
        if (this.props.pendingIndicator)
            return(
                <div id="pendingIndicator" className="d-flex align-items-center justify-content-end px-3 mr-3">
                    <span className="mr-2">Pending</span>
                    <span className="spinner icon-Icon3"/>
                </div>
            );
        else
            return(
                <></>
            );
    };

    changeNet (name, url) {
        swapApi.updUrl(url);
        this.props.changeNetwork(name, url);
    };

    renderWalletInfo () {
        return (
            <div className='wallet-info-wrapper d-flex align-items-center justify-content-end'>
                {this.renderPendingIndicator()}
                <div className='net wallet-info-boxes d-flex align-items-center justify-content-center mr-3'>
                    <span className='text-uppercase mx-2'>{this.props.net.name}</span>
                </div>
                <div className='enx-amount wallet-info-boxes d-flex align-items-center justify-content-center px-3 border-0 mr-0 mr-sm-3'>
                    {this.props.enx} ENX
                </div>
                <div className='wallet-info-boxes d-none d-sm-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center justify-content-center px-3'>{this.props.coinAmount} {this.props.coinName}</div>
                    <div className='addr wallet-info-boxes d-none d-md-flex align-items-center justify-content-center open-in-explorer hover-pointer'
                         onClick={this.openCloseAccountInfo.bind(this)}>{utils.packAddressString(this.props.pubkey)}</div>
                </div>
            </div>
        );
    };

    openCloseAccountInfo () {
        this.props.changeAccountInfoVisibility();
    };

    updData () {
        this.updNetwork();
        let tokenObj = utils.getBalanceObj(this.props.balances, this.props.nativeToken);
        this.props.updCoinAmount(valueProcessor.usCommasBigIntDecimals(tokenObj.amount, tokenObj.decimals));
    };

    circleUpd () {
        return setInterval(() => {
            this.updData();
        }, 2000);
    };

    updNetwork () {

        extRequests.getProvider(true)
        .then(res => {
            if (!res.lock) {
                this.changeNet(res.net.replace(/https?:\/\//, '').replace(/.enecuum.com/, ''), res.net + '/');
                ENQWeb.Enq.provider = res.net; 
                this.props.assignMainToken(ENQWeb.Enq.ticker)
            }    
        },
        err => console.log('cannot make getProvider request'));
    };

    render () {
        return (
            <>
                {this.renderWalletInfo()}
            </>
        );
    };
}

const WIndicatorPanel = connect(mapStoreToProps(components.INDICATOR_PANEL), mapDispatchToProps(components.INDICATOR_PANEL))(IndicatorPanel);

export default WIndicatorPanel;