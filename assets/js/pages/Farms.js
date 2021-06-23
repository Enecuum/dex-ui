import React from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import ValueProcessor from '../utils/ValueProcessor';
import swapUtils from '../utils/swapUtils';
import testFormulas from '../utils/testFormulas';
import '../../css/drop-farms.css';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

const valueProcessor = new ValueProcessor();

class Farms extends React.Component {
    constructor(props) {
        super(props);
        // this.pairsArr = '';
        this.farms = [
        	{        		
        		id        : 'a',
        		title     : 'CAKE-BNBa',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'b',
        		title     : 'CAKE-BNBb',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'c',
        		title     : 'CAKE-BNBc',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'd',
        		title     : 'CAKE-BNBd',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'e',
        		title     : 'CAKE-BNBe',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'f',
        		title     : 'CAKE-BNBf',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'g',
        		title     : 'CAKE-BNBg',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	}
        ]
    };

    populateTable() {
    	let balances = this.props.balances;
		let pairs = this.props.pairs;
		let tokens = this.props.tokens;
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
                    let ltDestructionResult = testFormulas.ltDestruction(tokens, pair, {
                        lt : {
                            value : amountLT,
							decimals : decimalsLT,
							total_supply : {
								value : ltObj.total_supply,
								decimals : ltObj.decimals
							}
                        }
                    }, 'ltfield');

					// !!! DEPRECATED !!! let ltDestructionResult = testFormulas.ltDestruction(pair, uniquePairsTokensList[pair.lt].total_supply, {amount_lt : amountLT}, 'ltfield'); !!! DEPRECATED !!!

					result.push({
						token_0 : {
							hash : pair.token_0.hash,
							ticker : uniquePairsTokensList[pair.token_0.hash].ticker,
							volume : pair.token_0.volume,
							decimals : uniquePairsTokensList[pair.token_0.hash].decimals
							
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
                        }, balances)
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

    getPairsTable() {/////////////////////////////////////////////////////////pairs-table-wrapper
    	const t = this.props.t;
    	return (
    		<>
				<div className="d-flex align-items-center justify-content-between py-4">
					<div className="d-flex align-items-center justify-content-start">
						<i className="fas fa-grip-horizontal mr-2"></i>
						<i class="fas fa-table mr-3"></i>
						<Dropdown>
						  <Dropdown.Toggle variant="success" id="dropdown-basic">
						    Sort by
						  </Dropdown.Toggle>

						  <Dropdown.Menu>
						    <Dropdown.Item >APY</Dropdown.Item>
						    <Dropdown.Item >Reward</Dropdown.Item>
						    <Dropdown.Item >Earned</Dropdown.Item>
						    <Dropdown.Item >Liquidity</Dropdown.Item>
						  </Dropdown.Menu>
						</Dropdown>
					</div>
					<div className="">
                        <input  id='farms-filter-field'
                                // onChange={}
                                className='text-input-1 form-control'
                                type='text'
                                placeholder='Search' />
                    </div>
				</div>    		
		    	<div className="drop-farms-table-wrapper">
			    	<SimpleBar style={{paddingBottom: '25px', paddingTop : '10px'}} autoHide={false}>	
						<Table hover variant="dark" style={{tableLayout : 'auto'}}>
							<tbody>
						        {this.farms.map(( farm, index ) => {
						          return (
						            <tr key={index}>
										<td className="text-nowrap">
											<div className="cell-wrapper d-flex align-items-center justify-content-center">
												{farm.title}
											</div>
										</td>
										<td>
											<div className="cell-wrapper">
												<div className="text-color4">Earned</div>
												<div>{valueProcessor.usCommasBigIntDecimals((farm.earned !== undefined ? farm.earned : '---'), 10, 10)}</div>
											</div>	
										</td>
										<td>
											<div className="cell-wrapper">
												<div className="text-color4">APY</div>
												<div>{valueProcessor.usCommasBigIntDecimals((farm.apy !== undefined ? farm.apy : '---'), 2, 2)}%</div>
											</div>	
										</td>
										<td>
											<div className="cell-wrapper">
												<div className="text-color4">Liquidity</div>
												<div>{valueProcessor.usCommasBigIntDecimals((farm.liquidity !== undefined ? farm.liquidity : '---'), 10, 10)}</div>
											</div>	
										</td>
										<td>
											<div className="cell-wrapper">
												<div className="text-color4">Reward</div>
												<div>{valueProcessor.usCommasBigIntDecimals((farm.reward !== undefined ? farm.reward : '---'), 10, 10)}</div>
											</div>	
										</td>

										<td>
											<div className="cell-wrapper d-flex align-items-center justify-content-center text-color4 details-control">
												<div className="mr-2">Details</div>
												<span class="icon-Icon26 d-flex align-items-center chevron-down"></span>
											</div>	
										</td>
						            </tr>
						          );
						        })}
						  	</tbody>
						</Table>
					</SimpleBar>
				</div>
			</>					
    	)
    }

    render() {///////////////////////////////////////////topPairsCard
		const t = this.props.t;
		this.pairsArr = this.populateTable();
    	return (
    		<div className="row">
    			<div className={!this.props.connectionStatus ? 'swap-card-wrapper px-2 pt-0 mt-0' : 'col-12 col-lg-10 offset-lg-1 col-xl-10 offset-xl-1'}>    			
					<Card className="c-card-1" id="farmsCard">
					  <Card.Body>
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

const WFarms = connect(mapStoreToProps(components.FARMS), mapDispatchToProps(components.FARMS))(withTranslation()(Farms));

export default WFarms;    