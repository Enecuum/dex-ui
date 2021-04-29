import React from 'react';
import { Card, Accordion, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import ValueProcessor from '../utils/ValueProcessor';
import utils from '../utils/swapUtils';
import testFormulas from '../utils/testFormulas';
import swapApi from '../requests/swapApi';

const valueProcessor = new ValueProcessor();

class LiquidityTokensZone extends React.Component {
    constructor (props) {
        super(props);
        this.userPoolToken = {amount : '-'};
        this.changeBalance = this.props.changeBalance;
        this.pooled = {};
        this.updltList();
    };

    getltData () { // returns [{t1, t2, v1, v2, lt}] - only pairs that contain user's liquidity tokens 
        let filtered = [];
        for (let pool of this.props.pairs)
            if (this.props.balances.find(el => el.token == pool.lt))
                filtered.push(pool);
        return filtered;
    };

    assignDataForRemoveLiquidity (field, data) {
        let mode = 'removeLiquidity';
        this.props.assignTokenValue(mode, field, data.token);
        this.props.assignCoinValue(mode, field, data.coinValue);
    };

    openRmLiquidityCard (pool, fToken, sToken) {
        let ltData = utils.getBalanceObj(this.balances, pool.lt);
        this.assignDataForRemoveLiquidity('ltfield', {
            token : this.getTokenByHash(pool.lt),
            coinValue : utils.getByPercents(ltData.amount, 50)
        });
        let fTData = utils.getBalanceObj(this.balances, fToken.hash);
        let amounts = testFormulas.ltDestruction(pool, utils.getByPercents(ltData.amount, 50), 'insert here'); // TODO bind total token emission
        this.assignDataForRemoveLiquidity('field0', {
            token : fToken,
            coinValue : amounts.amount_1
        });
        let sTData = utils.getBalanceObj(this.balances, sToken.hash);
        this.assignDataForRemoveLiquidity('field0', {
            token : sToken,
            coinValue : amounts.amount_2
        });
        this.props.changeRemoveLiquidityVisibility();
    };

    updltList () {
        setInterval(() => {
            this.props.updltList(this.getltData());
        }, 1000);
    };

    getTokenByHash (hash) {
        if (this.props.tList.length == 0)
            return { ticker : '-', hash : undefined };
        else
            return this.props.tList.find(el => {
                if (el.hash == hash)
                    return true;
            });
    };
    
    getYourPoolToken (ltHash) {
        return utils.getBalanceObj(this.props.balances, ltHash);
    };

    openAddLiquidityCard (fToken, sToken) {
        this.props.changeLiquidityMode();
        this.props.assignTokenValue(this.props.menuItem, 'field0', fToken);
        this.changeBalance('field0', fToken.hash);
        this.props.assignTokenValue(this.props.menuItem, 'field1', sToken);
        this.changeBalance('field1', sToken.hash);
    };

    countPooledAmount (pair, index) {
        if (!this.pooled[index])
            this.pooled[index] = {
                amount_1 : 0,
                amount_2 : 0
            };
        swapApi.getTokenInfo(pair.lt)
        .then(res => {
            res.json()
            .then(total => {
                this.total = total[0].total_supply;
                this.pooled[index] = testFormulas.ltDestruction(pair, utils.getBalanceObj(this.props.balances, pair.lt).amount, total[0].total_supply);
            })
        })
    };

    renderltList () {
        if (this.props.ltList.length == 0)
            return (
                <div className="liquidity-tokens-empty-zone"> 
                    <div className="d-flex justify-content-center">empty</div>
                </div>
            );
        else {
            return this.props.ltList.map((el, index) => {
                this.countPooledAmount(el, index);
                let fToken = this.getTokenByHash(el.token_0.hash);
                let sToken = this.getTokenByHash(el.token_1.hash);
                this.userPoolToken = this.getYourPoolToken(el.lt);
                return (
                    <Card className="liquidity-tokens-zone" key={index}>
                        <Card.Header>
                            <Accordion.Toggle eventKey={index+''} as="div" className="d-flex align-items-center justify-content-between hover-pointer">
                                <span className="mr-2">{fToken.ticker}/{sToken.ticker}</span>
                                <i class="fas fa-chevron-down"></i>
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey={index+''}>
                            <Card.Body>
                                <div className="mb-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Pooled {fToken.ticker}:</span>
                                        {valueProcessor.usCommasBigIntDecimals(this.pooled[index].amount_1)}
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Pooled {sToken.ticker}:</span>
                                        {valueProcessor.usCommasBigIntDecimals(this.pooled[index].amount_2)}
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Your pool tokens:</span>
                                        {valueProcessor.usCommasBigIntDecimals(utils.getBalanceObj(this.props.balances, el.lt).amount)}
                                    </div>  
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Pool share:</span>
                                        {utils.countPoolShare(el, {
                                            field0 : { value : this.pooled[index].amount_1 },
                                            field1 : { value : this.pooled[index].amount_2 }
                                        })}%
                                    </div>      
                                </div>

                                {/* Your pool share is absent because of lack of data. */}
                                <div className="d-flex align-items-center justify-content-between">
                                    <Button className="mr-2 btn liquidity-btn flex-grow-1 w-50" variant="secondary" onClick={this.openAddLiquidityCard.bind(this, fToken, sToken)}>Add</Button>
                                    <Button className="ml-2 btn liquidity-btn flex-grow-1 w-50" variant="secondary" onClick={this.openRmLiquidityCard.bind(this, el)}>Remove</Button>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                );
            });
        }
    };

    render () {
        return(
            <>
                <Accordion>
                    { this.renderltList() }
                </Accordion>
            </>
        );
    };
};

let WLiquidityTokensZone = connect(mapStoreToProps(components.LIQUIDITY_TOKEN_ZONE), mapDispatchToProps(components.LIQUIDITY_TOKEN_ZONE))(LiquidityTokensZone);

export default WLiquidityTokensZone;