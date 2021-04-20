import React from 'react';
import { Card, Accordion, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import extRequests from '../requests/extRequests';
import swapApi from '../requests/swapApi';


class LiquidityTokensZone extends React.Component {
    constructor (props) {
        super(props);
        this.poolAmount = '-';
        this.changeBalance = this.props.changeBalance;
        this.updltList();
    };

    updltList () {
        setInterval(() => {
            swapApi.getltData(this.props.pubkey)
            .then(async res => {
                res = await res.json();
                this.props.updltList(res.data ? res.data : [])
            },
            err => console.log(err));
        }, 1000);
    };

    getTokenByHash (hash) {
        if (this.props.tList.length == 0) {
            return {
                ticker : '-' // just for test
            }
        }
        return this.props.tList.find(el => {
            if (el.hash == hash)
                return true;
        });
    };

    getPoolAmount (ltHash) {
        extRequests.getBalance(this.props.pubkey, ltHash)
        .then(res => {
            this.poolAmount = (res.amount !== undefined) ? res.amount : '-';
        },
        () => {
            this.poolAmount = '-';
        });
    };

    openAddLiquidityCard (fToken, sToken) {
        this.props.changeLiquidityMode();
        this.props.assignTokenValue(this.props.menuItem, 'field0', fToken);
        this.changeBalance('field0', fToken.hash);
        this.props.assignTokenValue(this.props.menuItem, 'field1', sToken);
        this.changeBalance('field1', sToken.hash);
    };

    openRemoveLiquidityCard () {
        this.props.changeRemoveLiquidityVisibility();
    };

    renderltList () {
        if (this.props.ltList.length == 0)
            return (
                <div className="liquidity-tokens-empty-zone"> 
                    <div className="d-flex justify-content-center">empty</div>
                </div>
            );
        else 
            return this.props.ltList.map((el, index) => {
                this.getPoolAmount(el.lt);
                let fToken = this.getTokenByHash(el.t1);
                let sToken = this.getTokenByHash(el.t2);
                return (
                    <Card className="liquidity-tokens-zone" key={index}>
                        <Card.Header>
                            <Accordion.Toggle eventKey={index+''} as="div">
                                {fToken.ticker}/{sToken.ticker}
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey={index+''}>
                            <Card.Body>
                                <div className="mb-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Pooled {fToken.ticker}:</span>{el.v1}
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Pooled {sToken.ticker}:</span>
                                        {el.v2}
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Your pool tokens:</span>
                                        {this.poolAmount}
                                    </div>                                
                                </div>

                                {/* Your pool share is absent because of lack of data. */}
                                <div className="d-flex align-items-center justify-content-between">
                                    <Button className="mr-2 btn liquidity-btn" variant="secondary" onClick={this.openAddLiquidityCard.bind(this, fToken, sToken)}>Add</Button>
                                    <Button className="ml-2 btn liquidity-btn" variant="secondary" onClick={this.openRemoveLiquidityCard.bind(this)}>Remove</Button>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                );
            }); 
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