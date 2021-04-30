import React from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import ValueProcessor from '../utils/ValueProcessor';
import PairLogos from '../components/PairLogos';
import utils from '../utils/swapUtils';
import swapApi from '../requests/swapApi';
import testFormulas from '../utils/testFormulas';

const valueProcessor = new ValueProcessor();

class LPTokensWalletInfo extends React.Component {
    constructor(props) {
        super(props);
        this.pair = {};
        this.pooled = {
            amount_1 : 0,
            amount_2 : 0
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
        swapApi.getTokenInfo(this.pair.lt)
        .then(res => {
            res.json()
            .then(total => {
                if (Array.isArray(total) && total.length)
                    this.pooled = testFormulas.ltDestruction(this.pair, utils.getBalanceObj(this.props.balances, this.pair.lt).amount, total[0].total_supply);
            })
        })
    };

    render () {
        if (this.mustBeVisible()) {
            this.countPooledAmount();
            let firstToken = utils.getTokenObj(this.props.tokens, this.pair.token_0.hash);
            let secondToken = utils.getTokenObj(this.props.tokens, this.pair.token_1.hash);
            return (
                <div className="general-card p-4">
                    <div id='under-header'>LP tokens in your wallet</div>
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
                            {valueProcessor.usCommasBigIntDecimals(this.pooled.amount_1)}
                        </div>
                    </div>
                    <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                        <div className="mr-3 d-flex align-items-center">
                            {secondToken.ticker}:
                        </div>
                        <div>
                            {valueProcessor.usCommasBigIntDecimals(this.pooled.amount_2)}
                        </div>
                    </div>                                
                </div>
            );
        } else 
            return (
                <></>
            );
    }
};

const WLPTokensWalletInfo = connect(mapStoreToProps(components.LP_WALLET_INFO), mapDispatchToProps(components.LP_WALLET_INFO))(LPTokensWalletInfo);

export default WLPTokensWalletInfo;