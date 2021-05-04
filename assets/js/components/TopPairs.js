import React from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import ValueProcessor from '../utils/ValueProcessor';
import '../../css/top-pairs.css';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

const valueProcessor = new ValueProcessor();

class TopPairs extends React.Component {
    constructor(props) {
        super(props);
        this.pairsArr = '';        
    };

    populateTable() {
		let pairs = this.props.pairs;
		let tokens = this.props.tokens;
    	let result = [];
    	let uniquePairsTokensList = {};
    	if (pairs !== undefined && Array.isArray(pairs) && pairs.length > 0 && tokens !== undefined && Array.isArray(tokens) && tokens.length > 0) {
			pairs.forEach(function(pair, i, pairsArr) {
				[0,1].forEach(function(tokenIndex, i, tokenIndexArr) {
					if (!uniquePairsTokensList.hasOwnProperty(pair['token_' + tokenIndex].hash))
						uniquePairsTokensList[pair['token_' + tokenIndex].hash] = {
							ticker : '',
							inWhiteList : false
						}
				});
			});
			tokens.forEach(function(tokenInNetwork, i, tokensInNetworkArr) {
				if (uniquePairsTokensList.hasOwnProperty(tokenInNetwork.hash)) {
					uniquePairsTokensList[tokenInNetwork.hash].ticker = tokenInNetwork.ticker;
					uniquePairsTokensList[tokenInNetwork.hash].inWhiteList = true;
				}
			});

			pairs.forEach(function(pair, i, pairsArr) {
				if ((uniquePairsTokensList[pair.token_0.hash].inWhiteList === true) && (uniquePairsTokensList[pair.token_1.hash].inWhiteList === true)) {
					result.push({
						token_0 : {
							hash : pair.token_0.hash,
							ticker : uniquePairsTokensList[pair.token_0.hash].ticker,
							volume : pair.token_0.volume
							
						},
						token_1 : {
							hash : pair.token_1.hash,
							ticker : uniquePairsTokensList[pair.token_1.hash].ticker,
							volume : pair.token_1.volume
						},
						pool_fee : pair.pool_fee,
						liquidity : BigInt(pair.token_0.volume) * BigInt(pair.token_1.volume)
					})
				}
			})	
    	} else {
    		return result;
    	}
    	return result;    	
    }

    getTmpErrorElement() {
    	return (
	    	<div>
	    		No data
	    	</div>
	    )	
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
					      <th>{t('liquidity')}</th>
					      <th>{t('volume')}</th>
					      <th>{t('fee')}</th>
					    </tr>
					  </thead>
					  <tbody>
				        {this.pairsArr.map(( pair, index ) => {
				          return (
				            <tr key={index}>
				              <td>{index}</td>
				              <td className="text-nowrap">{pair.token_0.ticker}-{pair.token_1.ticker}</td>
				              <td>{valueProcessor.usCommasBigIntDecimals(pair.liquidity)}</td>
				              <td>volume</td>
				              <td>{valueProcessor.usCommasBigIntDecimals(pair.pool_fee)}</td>
				            </tr>
				          );
				        })}
					  </tbody>
					</Table>
					</SimpleBar>
				</div>
				
    	)
    }

    render() {
		const t = this.props.t;
		this.pairsArr = this.populateTable();
    	return (
    		<div className="row">
    			<div className="col-12 col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">    			
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