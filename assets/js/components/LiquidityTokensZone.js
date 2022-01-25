import React from 'react';
import { Card, Accordion, Button } from 'react-bootstrap';
import { connect, connectAdvanced } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import ValueProcessor from '../utils/ValueProcessor';
import utils from '../utils/swapUtils';
import testFormulas from '../utils/testFormulas';
import swapApi from '../requests/swapApi';
import '../../css/accordion.css';

const valueProcessor = new ValueProcessor();

class LiquidityTokensZone extends React.Component {
    constructor (props) {
        super(props);
        this.userPoolToken = {amount : '-'};
        this.changeBalance = this.props.changeBalance;
        this.pooled = {};
        this.state = {activeId: ''};
        this.initByGetRequestParams = true;
        this.resolveURLHash = this.setActiveKey.bind(this);
    };

    componentDidMount() {
      window.addEventListener('hashchange', this.resolveURLHash);
    }

    componentWillUnmount() {
       window.removeEventListener('hashchange', this.resolveURLHash);
    }    

    componentDidUpdate(prevProps, prevState){
        const hasAChanged = ((this.props.tokens !== prevProps.tokens));
        if (hasAChanged && this.props.connectionStatus === true && this.initByGetRequestParams) {
            this.setActiveKey();
            this.initByGetRequestParams = false;
        }

        if (this.state.activeId !== prevState.activeId) {
            let activeId = this.state.activeId;
            let ltList = this.getLtData();

            if (ltList[activeId] !== undefined && this.state.activeId !== undefined) {
                let ticker0 = this.props.tokens.find(elem => (elem.hash === ltList[activeId].token_0.hash)).ticker;
                let ticker1 = this.props.tokens.find(elem => (elem.hash === ltList[activeId].token_1.hash)).ticker;
                window.location.hash = '#!action=pool&pair=' + ticker0 + '-' + ticker1 + '&from=' + ltList[activeId].token_0.hash + '&to=' +  ltList[activeId].token_1.hash;
            }
        }
    }

    setActiveKey() {
        let activeKey = '';
        let paramsObj = this.parseFromToTokensRequest(); 
        let ltList = this.getLtData();
        if (paramsObj.action === 'pool' && paramsObj.from !== undefined && paramsObj.to !== undefined && ltList.length > 0) {
            let index = ltList.findIndex(elem => (elem.token_0.hash === paramsObj.from) && (elem.token_1.hash === paramsObj.to));
            if (index !== -1)
                activeKey = index;
        }
        this.setState({ activeId: activeKey.toString()});
    }

    parseFromToTokensRequest() {        
        let requestParamsObj = {
            action : undefined,
            pair   : undefined,
            from   : undefined,
            to     : undefined
        };

        window.location.hash
        .split('&')
        .map(elem => {
            elem = elem.replace('#!', '');
            let tmpArr = elem.split('=');
            if (requestParamsObj.hasOwnProperty(tmpArr[0]))
                requestParamsObj[tmpArr[0]] = tmpArr[1];
        });
        return requestParamsObj;
    }

    getTokenByHash (hash) {
        let empty = { ticker : '-', hash : undefined };
        if (this.props.tList.length == 0)
            return empty;
        else {
            let found = this.props.tList.find(el => {
                if (el.hash == hash)
                    return true;
            });
            return (found) ? found : empty;
        }
    };

    getLtData () { // returns [{t1, t2, v1, v2, lt}] - only pairs that contain user's liquidity tokens
        let filtered = [];
        for (let pool of this.props.pairs)
            for (let balance of this.props.balances)
                if (balance.token === pool.lt)
                    filtered.push(pool);
        return filtered;
    };

    assignDataForRemoveLiquidity (field, data) {
        let mode = 'removeLiquidity';
        data.coinValue.text = valueProcessor.usCommasBigIntDecimals(data.coinValue.value, data.coinValue.decimals).replace(/,/g, '');
        this.props.assignTokenValue(mode, field, data.token);
        this.props.assignCoinValue(mode, field, data.coinValue);
    };

    openRmLiquidityCard (pool) {
        this.fillRmLiquidityFields(pool);
        this.props.changeRemoveLiquidityVisibility();        
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
        window.location.hash = '#!action=pool&pair=' + fToken.ticker + '-' + sToken.ticker + '&from=' + fToken.hash + '&to=' +  sToken.hash;
    };

    countPooledAmount (pair, index) {
        if (!this.pooled[index])
            this.pooled[index] = {
                t0 : 0,
                t1 : 0
            };
        let balanceObj = utils.getBalanceObj(this.props.balances, pair.lt);
        let ltObj = utils.getTokenObj(this.props.tokens, pair.lt);
        this.pooled[index] = testFormulas.ltDestruction(this.props.tokens, pair, {
            lt : {
                value : balanceObj.amount,
                decimals : balanceObj.decimals,
                total_supply : {
                    value : ltObj.total_supply,
                    decimals : ltObj.decimals
                }
            }
        }, 'ltfield');
    };

    fillRmLiquidityFields (pool) {
        let ltData = utils.getBalanceObj(this.props.balances, pool.lt);
        let coinValue = utils.countPortion({
            value : ltData.amount,
            decimals : ltData.decimals
        }, 50);

        this.assignDataForRemoveLiquidity('ltfield', {
            token : this.getTokenByHash(pool.lt),
            coinValue : coinValue
        });
        let counted = testFormulas.ltDestruction(this.props.tokens, pool, {
            lt : {
                value : coinValue.value,
                decimals : coinValue.decimals,
                total_supply : {
                    value : utils.getTokenObj(this.props.tokens, pool.lt).total_supply,
                    decimals : ltData.decimals
                }
            }
        }, 'ltfield');
        let t0 = this.getTokenByHash(pool.token_0.hash);
        let t1 = this.getTokenByHash(pool.token_1.hash);
        this.assignDataForRemoveLiquidity('field0', {
            token : t0,
            coinValue : counted.t0
        });
        this.assignDataForRemoveLiquidity('field1', {
            token : t1,
            coinValue : counted.t1
        });
        window.location.hash = '#!action=pool&pair=' + t0.ticker + '-' + t1.ticker + '&from=' + t0.hash + '&to=' +  t1.hash;
    };

    renderLtList () {
        let ltList = this.getLtData();
        if (ltList.length === 0)
            return (
                <div className="liquidity-tokens-empty-zone"/>
            );
        else {
            return ltList.map((el, index) => {
                this.countPooledAmount(el, index);
                let fToken  = this.getTokenByHash(el.token_0.hash);
                let sToken  = this.getTokenByHash(el.token_1.hash);
                let balance = utils.getBalanceObj(this.props.balances, el.lt)
                this.userPoolToken = this.getYourPoolToken(el.lt);

                return (
                    <Card className="liquidity-tokens-zone" key={index}>
                        <Card.Header>
                            <Accordion.Toggle
                                eventKey={index+''}
                                as="div"
                                className="d-flex align-items-center justify-content-between hover-pointer py-2"
                                onClick={() => this.setState({ activeId: this.state.activeId.toString() !== index.toString() ? index.toString() : '' })}
                                data-active-accordion-elem = {(index+'' === this.state.activeId).toString()} >
                                    <span className="mr-2">{fToken.ticker}/{sToken.ticker}</span>
                                    <i className="fas fa-chevron-down accordion-chevron"/>
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey={index+''}>
                            <Card.Body>
                                <div className="mb-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Pooled {fToken.ticker}:</span>
                                        {valueProcessor.usCommasBigIntDecimals(this.pooled[index].t0.value, this.pooled[index].t0.decimals)}
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Pooled {sToken.ticker}:</span>
                                        {valueProcessor.usCommasBigIntDecimals(this.pooled[index].t1.value, this.pooled[index].t1.decimals)}
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Your pool tokens:</span>
                                        {valueProcessor.usCommasBigIntDecimals(balance.amount, balance.decimals)}
                                    </div>  
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="mr-2">Pool share:</span>
                                        {utils.removeEndZeros(utils.countPoolShare(el, {
                                            value0 : this.pooled[index].t0,
                                            value1 : this.pooled[index].t1
                                        }, this.props.balances))}%
                                    </div>
                                </div>

                                {/* Your pool share is absent because of lack of data. */}
                                <div className="d-flex align-items-center justify-content-between">
                                    <Button className="mr-2 btn liquidity-btn flex-grow-1 w-50 py-2" variant="secondary" onClick={this.openAddLiquidityCard.bind(this, fToken, sToken)}>Add</Button>
                                    <Button className="ml-2 btn liquidity-btn flex-grow-1 w-50 py-2" variant="secondary" onClick={this.openRmLiquidityCard.bind(this, el)}>Remove</Button>
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
                <Accordion activeKey={this.state.activeId}>
                    { this.renderLtList() }
                </Accordion>
            </>
        );
    };
};

let WLiquidityTokensZone = connect(mapStoreToProps(components.LIQUIDITY_TOKEN_ZONE), mapDispatchToProps(components.LIQUIDITY_TOKEN_ZONE))(LiquidityTokensZone);

export default WLiquidityTokensZone;