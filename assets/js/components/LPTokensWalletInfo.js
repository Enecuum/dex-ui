import React from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import ValueProcessor from '../utils/ValueProcessor';
import PairLogos from '../components/PairLogos';
import utils from '../utils/swapUtils';
import testFormulas from '../utils/testFormulas';

const valueProcessor = new ValueProcessor();

class LPTokensWalletInfo extends React.Component {
    constructor(props) {
        super(props);
        this.pair = {};
        this.pooled = {
            t0 : 0,
            t1 : 0
        };
    };

    hasItPair () {
        let data = this.props[this.props.menuItem];
        this.pair = utils.searchSwap(this.props.pairs, [data.field0.token, data.field1.token]);
        if (utils.pairExists(this.pair))
            return true;
        return false;
    };

    mustBeVisible () {
        if (this.props.menuItem == 'exchange')
            return this.hasItPair();
        else if (this.props.menuItem == 'liquidity' && !this.props.liquidityRemove && !this.props.liquidityMain)
            return this.hasItPair();
        else
            return false;
    };

    countPooledAmount () {
        let ltBalance = utils.getBalanceObj(this.props.balances, this.pair.lt);
        let ltObj = utils.getTokenObj(this.props.tokens, this.pair.lt);
        this.pooled = testFormulas.ltDestruction(this.props.tokens, this.pair, {
            lt : { 
                value : ltBalance.amount,
                decimals : ltBalance.decimals,
                total_supply : {
                    value : ltObj.total_supply,
                    decimals : ltObj.decimals
                }
            }
        }, 'ltfield');
    };

    render () {
        if (this.mustBeVisible()) {
            this.countPooledAmount();
            let firstToken = utils.getTokenObj(this.props.tokens, this.pair.token_0.hash);
            let secondToken = utils.getTokenObj(this.props.tokens, this.pair.token_1.hash);
            return (
                <div className="general-card p-4">
                    <div id='under-header'>{this.props.t('trade.lpTokensWalletInfo.header')}</div>
                    <div className="d-flex align-items-center justify-content-between py-2">
                        {/* <PairLogos  logos={{logo1 : this.logo1, logo2 : this.logo2, logoSize : 'sm'}} /> */}
                        <div>
                            {firstToken.ticker}/{secondToken.ticker}
                        </div>
                        <div>
                            {valueProcessor.usCommasBigIntDecimals(utils.getBalanceObj(this.props.balances, this.pair.lt).amount)}
                        </div>
                    </div>
                    <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                        <div className="mr-3 d-flex align-items-center">
                            {firstToken.ticker}:
                        </div>
                        <div>
                            {valueProcessor.usCommasBigIntDecimals(this.pooled.t0.value, this.pooled.t0.decimals)}
                        </div>
                    </div>
                    <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                        <div className="mr-3 d-flex align-items-center">
                            {secondToken.ticker}:
                        </div>
                        <div>
                            {valueProcessor.usCommasBigIntDecimals(this.pooled.t1.value, this.pooled.t0.decimals)}
                        </div>
                    </div>                                
                </div>
            );
        } else 
            return (
                <></>
            );
    }
}

const WLPTokensWalletInfo = connect(
    mapStoreToProps(components.LP_WALLET_INFO),
    mapDispatchToProps(components.LP_WALLET_INFO)
)(withTranslation()(LPTokensWalletInfo))

export default WLPTokensWalletInfo