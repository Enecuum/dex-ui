import React from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import ValueProcessor from '../utils/ValueProcessor';
import swapUtils from '../utils/swapUtils';
import testFormulas from '../utils/testFormulas';
import '../../css/top-pairs.css';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import PairLogos from './PairLogos'
import utils from '../utils/swapUtils'

const valueProcessor = new ValueProcessor();

class TopPairs extends React.Component {
    constructor(props) {
        super(props);
        this.pairsArr = '';        
    };

    populateTable() {
    	let balances = this.props.balances;
		let pairs = this.props.pairs;
		let tokens = this.props.tokens;
		let farmsList = this.props.farmsList;
    	let result = [];
    	let uniquePairsTokensList = {};
    	if (pairs !== undefined && Array.isArray(pairs) && pairs.length > 0 && tokens !== undefined && Array.isArray(tokens) && tokens.length > 0) {
			pairs.forEach(function(pair, i, pairsArr) {
				['token_0','token_1','lt'].forEach(function(tokenAlias, i, tokenIndexArr) {
					let hash = undefined;
					if (tokenAlias === 'token_0' || tokenAlias === 'token_1')
						hash = pair[tokenAlias].hash
					else if (tokenAlias === 'lt')
						hash = pair[tokenAlias]

					if (!uniquePairsTokensList.hasOwnProperty(pair[tokenAlias].hash))
						uniquePairsTokensList[hash] = {
							ticker : undefined,
							inWhiteList : false,
							decimals : undefined,
							total_supply : undefined
						}
				});
			});
	
			tokens.forEach(function(tokenInNetwork, i, tokensInNetworkArr) {
				if (uniquePairsTokensList.hasOwnProperty(tokenInNetwork.hash)) {
					// console.log(tokenInNetwork.ticker, tokenInNetwork.hash, tokenInNetwork.total_supply);
					uniquePairsTokensList[tokenInNetwork.hash] = {
						ticker : tokenInNetwork.ticker,
						inWhiteList : true,
						decimals : tokenInNetwork.decimals,
						total_supply : tokenInNetwork.total_supply
					}
				}
			});
			// console.log('_____________________________________________________________________')

			pairs.forEach(function(pair, i, pairsArr) {
				if ((uniquePairsTokensList[pair.token_0.hash].inWhiteList === true) && (uniquePairsTokensList[pair.token_1.hash].inWhiteList === true) && (uniquePairsTokensList[pair.lt].inWhiteList === true)) {
					let ltInBalance = balances.find(tokenBalance => tokenBalance.token === pair.lt);
					let amountLT = 0, decimalsLT = 0;

					if (ltInBalance !== undefined) {				
						amountLT = ltInBalance.amount;
						decimalsLT = ltInBalance.decimals;
					}

					let ltObj = swapUtils.getTokenObj(tokens, pair.lt);
					let ltBalance = utils.getBalanceObj(balances, pair.lt);
					ltBalance.value = ltBalance.amount
					let farm
					if (farmsList) {
						farm = farmsList.find(farm => farm.stake_token_hash === pair.lt && farm.stake)
						if (farm)
							ltBalance = valueProcessor.add(ltBalance, {value: farm.stake, decimals: 10})
					}
                    let ltDestructionResult = testFormulas.ltDestruction(tokens, pair, {
                        lt : {
							...ltBalance,
							total_supply : {
								value : ltObj.total_supply,
								decimals : ltObj.decimals
							}
                        }
                    }, 'ltfield');

					result.push({
						token_0 : {
							hash : pair.token_0.hash,
							ticker : uniquePairsTokensList[pair.token_0.hash].ticker,
							volume : pair.token_0.volume,
							decimals : uniquePairsTokensList[pair.token_0.hash].decimals,
						},
						token_1 : {
							hash : pair.token_1.hash,
							ticker : uniquePairsTokensList[pair.token_1.hash].ticker,
							volume : pair.token_1.volume,
							decimals : uniquePairsTokensList[pair.token_1.hash].decimals
						},
						lt : {
							hash : pair.lt,
							ticker : uniquePairsTokensList[pair.lt].ticker,
							decimals : uniquePairsTokensList[pair.lt].decimals,
							total_supply : uniquePairsTokensList[pair.lt].total_supply
						},
						your_lp_tokens : ltDestructionResult,
						your_pool_share : swapUtils.countPoolShare(pair, {
                            value0 : ltDestructionResult.t0, 
                            value1 : ltDestructionResult.t1
                        }, tokens)
					})
				} else {
					console.log('Чёрный список!!!')
				}
			})	
    	} else {
    		return result;
    	}
    	return result;    	
    }

    getTmpErrorElement() {
    	const t = this.props.t;
    	return (
	    	<div>
	    		{!this.props.connectionStatus &&
	    			<>
	    				<div className="mb-3 h5">{t('noConnection')}</div>
	    				<div className="mb-3 h6">{t('clickConnect')}</div>
	    			</>
	    		}
				{this.props.connectionStatus &&
					<div className="mb-3">{t('noData')}</div>
	    		}	    		 
	    	</div>
	    )	
    }

    switchToSwap() {
      this.props.changeMenuItem('exchange');
    }

    getPairsTable() {
    	const t = this.props.t;
    	return (    		
	    	<div className="pairs-table-wrapper">
		    	<SimpleBar style={{paddingBottom: '25px', paddingTop : '10px'}} autoHide={false}>	
					<Table hover variant="dark" style={{tableLayout : 'auto'}}>
					  	<thead>
					    	<tr>
								<th>{t('numberSign')}</th>
								<th>{t('name')}</th>
								<th>{t('topPairs.ltTotalSupply')}</th>
								<th>{t('topPairs.volumeInPair', {indexInPair : 1})}</th>
								<th>{t('topPairs.volumeInPair', {indexInPair : 2})}</th>
								<th>{t('topPairs.yourTokensInPair', {indexInPair : 1})}</th>
								<th>{t('topPairs.yourTokensInPair', {indexInPair : 2})}</th>
								<th>{t('topPairs.yourPoolShare')}</th>								
					    	</tr>
					  	</thead>
						<tbody>
					        {this.pairsArr.map(( pair, index ) => {
					          return (
					            <tr key={index}>
									<td>{index + 1}</td>
									<td className="text-nowrap d-flex">
										<PairLogos
											logos={{
												logo1 : swapUtils.getTokenObj(this.props.tokens, pair.token_0.hash).logo,
												logo2 : swapUtils.getTokenObj(this.props.tokens, pair.token_1.hash).logo,
												net : this.props.net,
												size : 'xs'
											}}
										/>
										<a
											href = {"/#!action=swap&pair=" + pair.token_0.ticker + "-" + pair.token_1.ticker + '&from=' + pair.token_0.hash + "&to=" + pair.token_1.hash}
											onClick={this.switchToSwap.bind(this)}
											className="text-color4-link hover-pointer ml-2">
											{pair.token_0.ticker}-{pair.token_1.ticker}
										</a>
									</td>
									<td>
										{
											swapUtils.removeEndZeros(
												valueProcessor.usCommasBigIntDecimals((pair.lt.total_supply !== undefined ? pair.lt.total_supply : '---'), pair.lt.decimals, pair.lt.decimals)
											)
										} {pair.lt.ticker}
									</td>
									<td>
										{
											swapUtils.removeEndZeros(
												valueProcessor.usCommasBigIntDecimals((pair.token_0.volume !== undefined ? pair.token_0.volume : '---'), pair.token_0.decimals, pair.token_0.decimals)
											)
										} {pair.token_0.ticker}
									</td>
									<td>
										{
											swapUtils.removeEndZeros(
												valueProcessor.usCommasBigIntDecimals((pair.token_1.volume !== undefined ? pair.token_1.volume : '---'), pair.token_1.decimals, pair.token_1.decimals)
											)
										} {pair.token_1.ticker}
									</td>
									<td>
										{
											swapUtils.removeEndZeros(
												valueProcessor.usCommasBigIntDecimals((pair.your_lp_tokens.t0.value !== undefined ? pair.your_lp_tokens.t0.value : '---'), pair.your_lp_tokens.t0.decimals)
											)
										} {pair.token_0.ticker}
									</td>
									<td>
										{
											swapUtils.removeEndZeros(
												valueProcessor.usCommasBigIntDecimals((pair.your_lp_tokens.t1.value !== undefined ? pair.your_lp_tokens.t1.value : '---'), pair.your_lp_tokens.t1.decimals)
											)
										} {pair.token_1.ticker}
									</td>
									<td>{swapUtils.removeEndZeros(pair.your_pool_share)}%</td>
					            </tr>
					          );
					        })}
					  	</tbody>
					</Table>
				</SimpleBar>
			</div>				
    	)
    }

    sortTable(pairsArr) {
        // return pairsArr.sort((pair1, pair2) => {



        // })
        return pairsArr
    }

    render() {
		const t = this.props.t;
		this.pairsArr = this.populateTable();
        this.pairsArr = this.sortTable(this.pairsArr);
    	return (
    		<div className="row">
    			<div className={!this.props.connectionStatus ? 'swap-card-wrapper px-2 pt-0 mt-0' : 'col-12 col-lg-10 offset-lg-1 col-xl-10 offset-xl-1'}>    			
					<Card className="c-card-1" id="topPairsCard">
					  <Card.Body>
					    <Card.Title>
					    	<div className="h4 py-3">{t('topPairs.title')}</div>
					    </Card.Title>
					    <Card.Text as="div">
						    {this.pairsArr.length > 0 ? this.getPairsTable() : this.getTmpErrorElement()}						    
					    </Card.Text>
					  </Card.Body>
					</Card>    			
    			</div>
    		</div>
        )
    }        
};

const WTopPairs = connect(mapStoreToProps(components.TOP_PAIRS), mapDispatchToProps(components.TOP_PAIRS))(withTranslation()(TopPairs));

export default WTopPairs;    