import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import networkApi from '../requests/networkApi';
import swapApi from '../requests/swapApi';
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
import IssueTokenValidationRules from '../utils/issueTokenValidationRules';
import ConfirmIssueToken from '../components/ConfirmIssueToken';
import Validator from  '../utils/Validator';
import presets from '../../store/pageDataPresets';



class Etm extends React.Component {
    constructor (props) {
        super(props);
        this.props.resetStore();
        this.valueProcessor = new ValueProcessor;
		this.MAX_SUPPLY_LIMIT = this.valueProcessor.getMaxValue(10);
		this.maxBigInt = this.valueProcessor.maxBigInt;
	    this.handleInputChange = this.handleInputChange.bind(this);
	    this.validateAndShowSubmit = this.validateAndShowSubmit.bind(this);
	    this.mainToken = {	    	
	    	ticker   : undefined,
	    	amount   : undefined,
	    	decimals : undefined
	    }

        this.newToken = {
			tokenData : this.props.tokenData,
	        tokenBigIntData : this.props.tokenBigIntData     	
        }

	    this.BigIntParametersArrays = {
	        decimalsDependent: ['max_supply','block_reward', 'min_stake', 'referrer_stake','total_supply', 'min_fee_for_percent_fee_type'],
	        percentFeeToken: ['min_fee_for_percent_fee_type'],
	        simpleToken: ['total_supply', 'fee_value'],
	        mineableToken: ['max_supply','block_reward', 'min_stake', 'referrer_stake', 'ref_share']
	    }
	    this.constraints = new TokenConstraints(this.maxBigInt);
		this.watchIfEnoughMainTokenBalanceToIssueToken();
    };

	handleInputChange(event) {
		const target = event.target;
		const propName = target.name;
		let value = propName === 'ticker' ? target.value.toUpperCase() : target.value
		this.newToken.tokenData[propName] = value;

		if (propName === 'token_type') {
			this.newToken.tokenData.total_supply = presets.etm.totalSupplyDefault;
			this.props.updateTokenProperty({
				field : 'total_supply',
				value : presets.etm.totalSupplyDefault
			});
			this.props.updateTokenProperty({
				field : 'reissuable',
				value : target.value !== '2' ? target.value : 0
			});
			this.props.updateTokenProperty({
				field : 'minable',
				value : target.value === '2' ? 1 : 0
			});
		}

		if (propName === 'fee_type') {
			this.newToken.tokenData.fee_value = presets.etm.feeValueDefault;
			this.props.updateTokenProperty({
				field : 'fee_value',
				value : presets.etm.feeValueDefault
			});
		} 

		this.props.updateTokenProperty({
			field : propName,
			value : value
		});

		this.processData(); 
	};

	validateAndShowSubmit() {
		this.processData('issueToken');			
	};

	watchIfEnoughMainTokenBalanceToIssueToken() {
		if (this.props.showForm !== true) {

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

								if (BigInt(this.mainToken.amount) >= contract_pricelistIssueToken) {								
									let tokenInfoRequest = swapApi.getTokenInfo(this.props.mainToken);
							        tokenInfoRequest.then(result => {
							            if (!result.lock) {
							                result.json().then(mainToken => {
							                    let mainTokenFee = BigInt(mainToken[0].fee_value);
							                    let issueTokenTxAmount = BigInt(contract_pricelistIssueToken) + BigInt(mainTokenFee);						                    
												if (BigInt(this.mainToken.amount) >= issueTokenTxAmount) {
													this.props.updateIssueTokenTxAmount({
														value : issueTokenTxAmount
													});
													this.props.updateMainTokenTicker({
														value : mainToken[0].ticker
													});
													this.props.updateMainTokenDecimals({
														value : mainToken[0].decimals
													});													
													this.props.updateShowForm({
														value : true
													});
												}                                
							                })
							            }
							        })
								}
							}		
						}									
					})
				}
	        })
		}
	}

	getBigIntParametersArray() {
        let parametersArr = this.BigIntParametersArrays.simpleToken;
        if (this.newToken.tokenData.fee_type === '1')
            parametersArr = parametersArr.concat(this.BigIntParametersArrays.percentFeeToken);
        if (this.newToken.tokenData.token_type === '2')
            parametersArr = parametersArr.concat(this.BigIntParametersArrays.mineableToken);
        return parametersArr;
    }

	transformBigIntValue(propertyName) {
        let decimals = this.newToken.tokenData.decimals;
        if (propertyName === 'fee_value' && this.newToken.tokenData.fee_type === '1') {
            decimals = this.constraints.fee_value_props_arr[1].decimalPlaces;
        } else if (propertyName === 'ref_share') {
            decimals = this.constraints.ref_share.decimalPlaces;
        }
        let property = this.newToken.tokenData[propertyName];
        let transformResultObj = this.valueProcessor.valueToBigInt(property, decimals);

        this.newToken.tokenBigIntData[propertyName] = {
	        integerPart    : transformResultObj.integerPart, //only for dev check
	        fractionalPart : transformResultObj.rawFractionalPart, //only for validation//////////////////////////////////////////////
	        completeValue  : transformResultObj.value
		}
    }    

    processData(purpose = '') { //if purpose == 'issueToken', 'possibleToIssueToken' property in etm.state will set to boolean 'true' or 'false'
    	if (purpose === 'issueToken') {
    		this.newToken.tokenData = this.props.tokenData;
    		this.newToken.tokenBigIntData = this.props.tokenBigIntData;
    	}
    	let that = this;
    	let validator = new Validator;
    	let validationRules = new IssueTokenValidationRules;
    	let dataValid = false;
        let newMaxValue = this.valueProcessor.getMaxValue(this.newToken.tokenData.decimals);
        this.BigIntParametersArrays.decimalsDependent.forEach(function(parameter) {
           that.constraints[parameter].maxValue = that.constraints.fee_value_props_arr[0].maxValue = newMaxValue;
        });
        this.constraints.fee_value_props_arr[0].decimalPlaces = this.newToken.tokenData.decimals;
        let commonValidationRules = validationRules.getCommonValidationRules(this.newToken.tokenData, this.constraints);
        let commonCheckNewTokenData = validator.batchValidate(this.newToken.tokenData, commonValidationRules);

        dataValid = commonCheckNewTokenData.dataValid; 

		this.props.updateMsgData({
			value : commonCheckNewTokenData.propsArr
		});

        if (commonCheckNewTokenData.dataValid) {
        	if (this.newToken.tokenData.token_type === '2') {
	        	this.calculateBlockReward();
	        }
            let bigIntParamsArr = this.getBigIntParametersArray();
            bigIntParamsArr.forEach(param => that.transformBigIntValue(param));
        	let specialValidationRules = validationRules.getSpecialValidationRules(this.newToken, this.constraints, this.maxBigInt);
        	let validatonResult = validator.batchValidate(this.newToken.tokenData, specialValidationRules);
        	dataValid = validatonResult.dataValid;
        	this.props.updateMsgData({
				value : validatonResult.propsArr
			});
			this.props.updateTokenBigIntData({
				value : this.newToken.tokenBigIntData
			});
        }

		if (purpose === 'issueToken') {
			this.props.updateTokenProperty({
				field : 'reissuable',
				value : this.newToken.tokenData.token_type !== '2' ? this.newToken.tokenData.token_type : '0'
			});
			this.props.updateTokenProperty({
				field : 'mineable',
				value : this.newToken.tokenData.token_type === '2' ? '1' : '0'
			});
			this.props.updatePossibleToIssueToken({
				value : dataValid
			});
		}
    }

	calculateBlockReward() {
        let block_reward = (Number(this.newToken.tokenData.max_supply) - Number(this.newToken.tokenData.total_supply))/(Number(this.newToken.tokenData.mining_period) * 5760);
        if (typeof block_reward === 'number') {
        	if (block_reward >= 0) {
				let value = block_reward.toFixed(this.newToken.tokenData.decimals);
				this.newToken.tokenData.block_reward = value;
				this.props.updateTokenProperty({
					field : 'block_reward',
					value : value
				});        		
        	} else {
	        	this.newToken.tokenData.block_reward = '0';
	            this.props.updateTokenProperty({
					field : 'block_reward',
					value : '---'
				});        		
        	}      	
        } else {
        	this.newToken.tokenData.block_reward = '0';
            this.props.updateTokenProperty({
				field : 'block_reward',
				value : '---'
			});
		}	        
    }    
    
    render () {    	
    	this.watchIfEnoughMainTokenBalanceToIssueToken();   

		const t = this.props.t;  
    	if (!this.props.connectionStatus) {
    		return (
    			<div className="px-5">
    				<div className="mb-3 h5">{t('noConnection')}</div>
    				<div className="mb-3 h6">{t('clickConnect')}</div>
    			</div>
    		)
    	} else if (!this.props.showForm) {
    		return (
    			<div className="px-5">
    				Сhecking the balance of the native token...
    			</div>
    		)
    	} else {
	        return (
	        	<div id="ETMWrapper" className="pb-5 px-5">
	        		<div className="h1 mb-5">{t('etm.issueToken')}</div>
					<Form onSubmit={e => { e.preventDefault(); }}>
						<Form.Group as={Row} controlId="setTokenTicker">
							<Form.Label column sm={2}>{t('etm.ticker')}</Form.Label>
							<Col xl={5}>
								<Form.Control 
									type="text"
									placeholder={this.props.tokenData.ticker}
									name="ticker"
									autoComplete="off"
									value={this.props.tokenData.ticker}
									onChange={this.handleInputChange.bind(this)} />
								<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('ticker') ? 'd-block' : 'd-none'}`} >
									{this.props.msgData.ticker !== undefined ? this.props.msgData.ticker.msg : ''}
								</Form.Text>
							</Col>	
						</Form.Group>
						<Form.Group as={Row} controlId="setTokenName">
							<Form.Label column sm={2}>{t('etm.name')}</Form.Label>
							<Col xl={5} >
								<Form.Control
									type="text"
									placeholder={this.props.tokenData.name}
									name="name"
									autoComplete="off"
									value={this.props.tokenData.name}
									onChange={this.handleInputChange.bind(this)} />
								<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('name') ? 'd-block' : 'd-none'}`} >
									{this.props.msgData.name !== undefined ? this.props.msgData.name.msg : ''}
								</Form.Text>
							</Col>	
						</Form.Group>
						<fieldset >
							<Form.Group as={Row} controlId="setTokenType">
								<Form.Label column sm={2}>{t('etm.tokenType')}</Form.Label>
								<Col xl={5}>
									<Form.Check
										type="radio"
										label={t('etm.nonReissuable')}
										name="token_type"
										value="0"
										checked={this.props.tokenData.token_type === "0"}
										id="tokenType0"
										onChange={this.handleInputChange.bind(this)}
										className="mb-2"
									/>
									<Form.Check
										type="radio"
										label={t('etm.reissuable')}
										name="token_type"
										value="1"
										checked={this.props.tokenData.token_type === "1"}
										id="tokenType1"
										onChange={this.handleInputChange.bind(this)}
										className="mb-2"
									/>
									<Form.Check
										type="radio"
										label={t('etm.mineable')}
										name="token_type"
										value="2"
										checked={this.props.tokenData.token_type === "2"}
										id="tokenType2"
										onChange={this.handleInputChange.bind(this)} />
								</Col>	
							</Form.Group>
						</fieldset>
						<Form.Group as={Row} controlId="setTokenPremineEmission">
							<Form.Label column sm={2}>{this.props.tokenData.token_type === '2' ? t('etm.premine') : t('etm.emission')}</Form.Label>
							<Col xl={5}>
								<Form.Control
									type="text"
									placeholder={this.props.tokenData.total_supply}
									name="total_supply"
									autoComplete="off"
									value={this.props.tokenData.total_supply}
									onChange={this.handleInputChange.bind(this)} />
								<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('total_supply') ? 'd-block' : 'd-none'}`} >
									{this.props.msgData.total_supply !== undefined ? this.props.msgData.total_supply.msg : ''}
								</Form.Text>
							</Col>	
						</Form.Group>

						{ (this.props.tokenData.token_type == "2") &&
							<div>
								<Form.Group as={Row} controlId="setTokenMaxSupply">
									<Form.Label column sm={2}>{t('etm.maxSupply')}</Form.Label>
									<Col xl={5}>
										<Form.Control
											type="text"
											placeholder={this.props.tokenData.max_supply}
											name="max_supply"
											autoComplete="off"
											value={this.props.tokenData.max_supply}
											onChange={this.handleInputChange.bind(this)} />
									<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('max_supply') ? 'd-block' : 'd-none'}`} >
										{this.props.msgData.max_supply !== undefined ? this.props.msgData.max_supply.msg : ''}
									</Form.Text>
									</Col>	
								</Form.Group>

								<Form.Group as={Row} controlId="setTokenBlockReward">
									<Form.Label column sm={2}>{t('etm.blockReward')}</Form.Label>
									<Col xl={5}>
										<InputGroup>
											<Form.Control
												readOnly
												disabled
												type="text"
												placeholder={this.props.tokenData.block_reward}
												name="block_reward"
												autoComplete="off"
												value={this.props.tokenData.block_reward}
												onChange={this.handleInputChange.bind(this)} />
											<InputGroup.Append>
												<InputGroup.Text>{this.props.msgData.ticker !== undefined ? t('tokens') : this.props.tokenData.ticker}</InputGroup.Text>
											</InputGroup.Append>
										</InputGroup>	
										<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('block_reward') ? 'd-block' : 'd-none'}`} >
											{this.props.msgData.block_reward !== undefined ? this.props.msgData.block_reward.msg : ''}
										</Form.Text>
									</Col>	
								</Form.Group>
								<Form.Group as={Row} controlId="setTokenMiningPeriod">
									<Form.Label column sm={2}>{t('etm.miningPeriod')}</Form.Label>
									<Col xl={5}>
										<InputGroup>
											<Form.Control
												type="text"
												placeholder={this.props.tokenData.mining_period}
												name="mining_period"
												autoComplete="off"
												value={this.props.tokenData.mining_period}
												onChange={this.handleInputChange.bind(this)} />
											<InputGroup.Append>
												<InputGroup.Text>{t('etm.days')}</InputGroup.Text>
											</InputGroup.Append>	
										</InputGroup>	
										<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('mining_period') ? 'd-block' : 'd-none'}`} >
											{this.props.msgData.mining_period !== undefined ? this.props.msgData.mining_period.msg : ''}
										</Form.Text>
									</Col>	
								</Form.Group>
								<Form.Group as={Row} controlId="setTokenMinStake">
									<Form.Label column sm={2}>{t('etm.minStake')}</Form.Label>
									<Col xl={5}>
										<Form.Control
											type="text"
											placeholder={this.props.tokenData.min_stake}
											name="min_stake"
											autoComplete="off"
											value={this.props.tokenData.min_stake}
											onChange={this.handleInputChange.bind(this)} />
										<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('min_stake') ? 'd-block' : 'd-none'}`} >
											{this.props.msgData.min_stake !== undefined ? this.props.msgData.min_stake.msg : ''}
										</Form.Text>
									</Col>	
								</Form.Group>
								<Form.Group as={Row} controlId="setTokenReferrerStake">
									<Form.Label column sm={2}>{t('etm.referrerStake')}</Form.Label>
									<Col xl={5}>
										<Form.Control
											type="text"
											placeholder={this.props.tokenData.referrer_stake}
											name="referrer_stake"
											autoComplete="off"
											value={this.props.tokenData.referrer_stake}
											onChange={this.handleInputChange.bind(this)} />
										<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('referrer_stake') ? 'd-block' : 'd-none'}`} >
											{this.props.msgData.referrer_stake !== undefined ? this.props.msgData.referrer_stake.msg : ''}
										</Form.Text>
									</Col>	
								</Form.Group>
								<Form.Group as={Row} controlId="setTokenRefShare">
									<Form.Label column sm={2}>{t('etm.refShare')}</Form.Label>
									<Col xl={5}>
										<InputGroup>
											<Form.Control
												type="text"
												placeholder={this.props.tokenData.ref_share}
												name="ref_share"
												autoComplete="off"
												value={this.props.tokenData.ref_share}
												onChange={this.handleInputChange.bind(this)} />
											<InputGroup.Append>
												<InputGroup.Text>%</InputGroup.Text>
											</InputGroup.Append>
										</InputGroup>			
										<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('ref_share') ? 'd-block' : 'd-none'}`} >
											{this.props.msgData.ref_share !== undefined ? this.props.msgData.ref_share.msg : ''}
										</Form.Text>
									</Col>	
								</Form.Group>
							</div>
						}
						<Form.Group as={Row} controlId="setTokenDecimals">
							<Form.Label column sm={2}>{t('etm.decimals')}</Form.Label>
							<Col xl={5}>
								<Form.Control
									readOnly
									disabled
									type="text"
									placeholder={this.props.tokenData.decimals}
									name="decimals"
									autoComplete="off"
									value={this.props.tokenData.decimals}
									onChange={this.handleInputChange.bind(this)} />
								<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('decimals') ? 'd-block' : 'd-none'}`} >
									{this.props.msgData.decimals !== undefined ? this.props.msgData.decimals.msg : ''}
								</Form.Text>
							</Col>	
						</Form.Group>
						<fieldset>
							<Form.Group as={Row} controlId="setTokenFeeType">
								<Form.Label column sm={2}>{t('etm.feeType')}</Form.Label>
								<Col xl={5}>
									<Form.Check
										type="radio"
										label={t('etm.flat')}
										name="fee_type"
										value="0"
										checked={this.props.tokenData.fee_type === "0"}
										id="setFeeType1"
										onChange={this.handleInputChange.bind(this)}
										className="mb-2" />
									<Form.Check
										type="radio"
										label={t('etm.percent')}
										name="fee_type"
										value="1"
										checked={this.props.tokenData.fee_type === "1"}
										id="setFeeType2"
										onChange={this.handleInputChange.bind(this)} />
								</Col>	
							</Form.Group>
						</fieldset>
						<Form.Group as={Row} controlId="setTokenFee">
							<Form.Label column sm={2}>{t('etm.fee')}</Form.Label>
							<Col xl={5}>
								<InputGroup>
									<Form.Control
										type="text"
										placeholder={this.props.tokenData.fee_value}
										name="fee_value"
										autoComplete="off"
										value={this.props.tokenData.fee_value}
										onChange={this.handleInputChange.bind(this)} />
									<InputGroup.Append>
										<InputGroup.Text>{this.props.tokenData.fee_type === '0' ? (this.props.msgData.ticker !== undefined || !(this.props.tokenData.ticker.length)  ? t('tokens') : this.props.tokenData.ticker) : '%'}</InputGroup.Text>
									</InputGroup.Append>
								</InputGroup>	
								<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('fee_value') ? 'd-block' : 'd-none'}`} >
									{this.props.msgData.fee_value !== undefined ? this.props.msgData.fee_value.msg : ''}
								</Form.Text>
							</Col>	
						</Form.Group>
						{ (this.props.tokenData.fee_type == "1") && 
							<Form.Group as={Row} controlId="setTokenMinFee">
								<Form.Label column sm={2}>{t('etm.minFee')}</Form.Label>
								<Col xl={5}>
									<Form.Control
										type="text"
										placeholder={this.props.tokenData.min_fee_for_percent_fee_type}
										name="min_fee_for_percent_fee_type"
										autoComplete="off"
										value={this.props.tokenData.min_fee_for_percent_fee_type}
										onChange={this.handleInputChange.bind(this)} />
									<Form.Text className={`err-msg ${this.props.msgData.hasOwnProperty('min_fee_for_percent_fee_type') ? 'd-block' : 'd-none'}`} >
										{this.props.msgData.min_fee_for_percent_fee_type !== undefined ? this.props.msgData.min_fee_for_percent_fee_type.msg : ''}
									</Form.Text>
								</Col>	
							</Form.Group>
						}
						<Row>
							<Col xl={{ span: 5, offset: 2 }} className="text-center">
								<Button
								variant="primary"
								type="submit"
								onClick={this.validateAndShowSubmit} >
									Issue token
								</Button>
							</Col>					
						</Row>
					</Form>
					<Suspense fallback={<div>---</div>}>
	                    <ConfirmIssueToken />
	                </Suspense>
				</div>
	        );
		}
    };
};

const WEtm = connect(mapStoreToProps(components.ETM), mapDispatchToProps(components.ETM))(withTranslation()(Etm));

export default WEtm;