import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import networkApi from '../requests/networkApi';
import { withTranslation } from "react-i18next";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/etm.css';

import ValueProcessor from '../utils/ValueProcessor';
import TokenConstraints from '../utils/TokenConstraints';



class Etm extends React.Component {
    constructor (props) {
        super(props);

        this.valueProcessor = new ValueProcessor;
		this.MAX_SUPPLY_LIMIT = this.valueProcessor.getMaxValue(10);
		this.maxBigInt = this.valueProcessor.maxBigInt;
	    this.handleInputChange = this.handleInputChange.bind(this);
	    this.validateAndShowSubmit = this.validateAndShowSubmit.bind(this);
	    this.balanseIsEnough = false;
	    this.mainToken = {	    	
	    	ticker   : undefined,
	    	amount   : undefined,
	    	decimals : undefined
	    }
    };

	handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		// console.log(name)
		this.props.updateTokenProperty({
			field : name,
			value : target.value
		});
	};

	validateAndShowSubmit() {
		let dataValid = true;
		let possibleToIssueToken = true;
		this.props.updateDataValid({
			value : dataValid
		});
		this.props.updatePossibleToIssueToken({
			value : possibleToIssueToken
		});
		// if (this.props.dataValid === true && this.props.possibleToIssueToken === true) {
		// 	console.log(this.props.dataValid, this.props.possibleToIssueToken)
		// }		
	};

	watchIfEnoughMainTokenBalanceToIssueToken() {
		let contractPricelist = networkApi.getContractPricelist();
		contractPricelist.then(result => {
			if (!result.lock) {
				result.json().then(pricelist => {
					let contract_pricelistIssueToken = BigInt(pricelist.create_token);

					if (this.props.mainToken !== undefined && this.props.balances !== undefined) {
						let mainTokenInfo = this.props.balances.find(token => token.token === this.props.mainToken);
						if (mainTokenInfo !== undefined) {
							for (let prop in this.mainToken) {
								if (mainTokenInfo[prop] !== undefined)
									this.mainToken[prop] = mainTokenInfo[prop];
							}
							if (BigInt(this.mainToken.amount) >=  contract_pricelistIssueToken) {
								this.balanseIsEnough = true;
							}
						}		
					}									
				})
			}
        })
	}
    
    render () {
    	this.watchIfEnoughMainTokenBalanceToIssueToken();

    	if (!this.props.connectionStatus) {
    		return (
    			<div>
    				Подключитесь
    			</div>
    		)
    	} else if (!this.balanseIsEnough) {    		
    		return (
    			<div>
    				Нет денег. Пополните баланс главного токена
    			</div>
    		)
    	} else {
	        return (
	        	<div id="ETMWrapper" className="pb-5 px-5">
	        		<div className="h1 mb-5">Issue token</div>
					<Form onSubmit={e => { e.preventDefault(); }}>
						<Form.Group as={Row} controlId="setTokenTicker">
							<Form.Label column sm={2}>Ticker</Form.Label>
							<Col xl={7}>
								<Form.Control 
									type="text"
									placeholder={this.props.tokenData.ticker}
									name="ticker"
									autoComplete="off"
									value={this.props.tokenData.ticker}
									onChange={this.handleInputChange.bind(this)} />
								<Form.Text className="err-msg">
									ErrorMesssage
								</Form.Text>
							</Col>	
						</Form.Group>
						<Form.Group as={Row} controlId="setTokenName">
							<Form.Label column sm={2}>Name</Form.Label>
							<Col xl={7} >
								<Form.Control
									type="text"
									placeholder={this.props.tokenData.name}
									name="name"
									autoComplete="off"
									value={this.props.tokenData.name}
									onChange={this.handleInputChange.bind(this)} />
								<Form.Text className="err-msg">
									ErrorMesssage
								</Form.Text>
							</Col>	
						</Form.Group>
						<fieldset >
							<Form.Group as={Row} controlId="setTokenType">
								<Form.Label column sm={2}>Token type</Form.Label>
								<Col xl={7}>
									<Form.Check
										type="radio"
										label="Non-reissuable"
										name="token_type"
										value="0"
										checked={this.props.tokenData.token_type === "0"}
										id="tokenType0"
										onChange={this.handleInputChange.bind(this)}
									/>
									<Form.Check
										type="radio"
										label="Reissuable"
										name="token_type"
										value="1"
										checked={this.props.tokenData.token_type === "1"}
										id="tokenType1"
										onChange={this.handleInputChange.bind(this)}
									/>
									<Form.Check
										type="radio"
										label="Mineable"
										name="token_type"
										value="2"
										checked={this.props.tokenData.token_type === "2"}
										id="tokenType2"
										onChange={this.handleInputChange.bind(this)}
									/>
								</Col>	
							</Form.Group>
						</fieldset>
						<Form.Group as={Row} controlId="setTokenPremineEmission">
							<Form.Label column sm={2}>Premine or Emission</Form.Label>
							<Col xl={7}>
								<Form.Control
									type="text"
									placeholder={this.props.tokenData.total_supply}
									name="total_supply"
									autoComplete="off"
									value={this.props.tokenData.total_supply}
									onChange={this.handleInputChange.bind(this)} />
								<Form.Text className="err-msg">
									ErrorMesssage
								</Form.Text>
							</Col>	
						</Form.Group>

						{ (this.props.tokenData.token_type == "2") &&
							<div>
								<Form.Group as={Row} controlId="setTokenMaxSupply">
									<Form.Label column sm={2}>Max Supply</Form.Label>
									<Col xl={7}>
										<Form.Control
											type="text"
											placeholder={this.props.tokenData.max_supply}
											name="max_supply"
											autoComplete="off"
											value={this.props.tokenData.max_supply}
											onChange={this.handleInputChange.bind(this)} />
										<Form.Text className="err-msg">
											ErrorMesssage
										</Form.Text>
									</Col>	
								</Form.Group>

								<Form.Group as={Row} controlId="setTokenBlockReward">
									<Form.Label column sm={2}>Block Reward</Form.Label>
									<Col xl={7}>
										<Form.Control
											type="text"
											placeholder={this.props.tokenData.block_reward}
											name="block_reward"
											autoComplete="off"
											value={this.props.tokenData.block_reward}
											onChange={this.handleInputChange.bind(this)} />
										<Form.Text className="err-msg">
											ErrorMesssage
										</Form.Text>
									</Col>	
								</Form.Group>
								<Form.Group as={Row} controlId="setTokenMiningPeriod">
									<Form.Label column sm={2}>Mining Period</Form.Label>
									<Col xl={7}>
										<Form.Control
										type="text"
										placeholder={this.props.tokenData.mining_period}
										name="mining_period"
										autoComplete="off"
										value={this.props.tokenData.mining_period}
										onChange={this.handleInputChange.bind(this)} />
										<Form.Text className="err-msg">
											ErrorMesssage
										</Form.Text>
									</Col>	
								</Form.Group>
								<Form.Group as={Row} controlId="setTokenMinStake">
									<Form.Label column sm={2}>Min Stake</Form.Label>
									<Col xl={7}>
										<Form.Control
											type="text"
											placeholder={this.props.tokenData.min_stake}
											name="min_stake"
											autoComplete="off"
											value={this.props.tokenData.min_stake}
											onChange={this.handleInputChange.bind(this)} />
										<Form.Text className="err-msg">
											ErrorMesssage
										</Form.Text>
									</Col>	
								</Form.Group>
								<Form.Group as={Row} controlId="setTokenReferrerStake">
									<Form.Label column sm={2}>Referrer Stake</Form.Label>
									<Col xl={7}>
										<Form.Control
											type="text"
											placeholder={this.props.tokenData.referrer_stake}
											name="referrer_stake"
											autoComplete="off"
											value={this.props.tokenData.referrer_stake}
											onChange={this.handleInputChange.bind(this)} />
										<Form.Text className="err-msg">
											ErrorMesssage
										</Form.Text>
									</Col>	
								</Form.Group>
								<Form.Group as={Row} controlId="setTokenRefShare">
									<Form.Label column sm={2}>RefShare</Form.Label>
									<Col xl={7}>
										<Form.Control
											type="text"
											placeholder={this.props.tokenData.ref_share}
											name="ref_share"
											autoComplete="off"
											value={this.props.tokenData.ref_share}
											onChange={this.handleInputChange.bind(this)} />
										<Form.Text className="err-msg">
											ErrorMesssage
										</Form.Text>
									</Col>	
								</Form.Group>
							</div>
						}
						<Form.Group as={Row} controlId="setTokenDecimals">
							<Form.Label column sm={2}>Decimals</Form.Label>
							<Col xl={7}>
								<Form.Control
									type="text"
									placeholder={this.props.tokenData.decimals}
									name="decimals"
									autoComplete="off"
									value={this.props.tokenData.decimals}
									onChange={this.handleInputChange.bind(this)} />
								<Form.Text className="err-msg">
									ErrorMesssage
								</Form.Text>
							</Col>	
						</Form.Group>
						<fieldset>
							<Form.Group as={Row} controlId="setTokenFeeType">
								<Form.Label column sm={2}>Fee type</Form.Label>
								<Col xl={7}>
									<Form.Check
										type="radio"
										label="Flat"
										name="fee_type"
										value="0"
										checked={this.props.tokenData.fee_type === "0"}
										id="setFeeType1"
										onChange={this.handleInputChange.bind(this)} />
									<Form.Check
										type="radio"
										label="Percent"
										name="fee_type"
										value="1"
										checked={this.props.tokenData.fee_type === "1"}
										id="setFeeType2"
										onChange={this.handleInputChange.bind(this)} />
								</Col>	
							</Form.Group>
						</fieldset>
						<Form.Group as={Row} controlId="setTokenFee">
							<Form.Label column sm={2}>Fee</Form.Label>
							<Col xl={7}>
								<Form.Control
									type="text"
									placeholder={this.props.tokenData.fee_value}
									name="fee_value"
									autoComplete="off"
									value={this.props.tokenData.fee_value}
									onChange={this.handleInputChange.bind(this)} />
								<Form.Text className="err-msg">
									ErrorMesssage
								</Form.Text>
							</Col>	
						</Form.Group>
						{ (this.props.tokenData.fee_type == "1") && 
							<Form.Group as={Row} controlId="setTokenMinFee">
								<Form.Label column sm={2}>Min Fee</Form.Label>
								<Col xl={7}>
									<Form.Control
										type="text"
										placeholder={this.props.tokenData.min_fee_for_percent_fee_type}
										name="min_fee_for_percent_fee_type"
										autoComplete="off"
										value={this.props.tokenData.min_fee_for_percent_fee_type}
										onChange={this.handleInputChange.bind(this)} />
									<Form.Text className="err-msg">
										ErrorMesssage
									</Form.Text>
								</Col>	
							</Form.Group>
						}
						<Row>
							<Col xl={{ span: 7, offset: 2 }} className="text-center">
								<Button
								variant="primary"
								type="submit"
								onClick={this.validateAndShowSubmit} >
									Issue token
								</Button>
							</Col>					
						</Row>
					</Form>
				</div>
	        );
		}
    };
};

const WEtm = connect(mapStoreToProps(components.ETM), mapDispatchToProps(components.ETM))(withTranslation()(Etm));

export default WEtm;