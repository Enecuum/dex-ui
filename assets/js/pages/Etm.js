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
import IssueTokenValidationRules from '../utils/issueTokenValidationRules';
import ConfirmIssueToken from '../components/ConfirmIssueToken';
import Validator from  '../utils/Validator';



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
	    this.BigIntParametersArrays = {
	        decimalsDependent: ['max_supply','block_reward', 'min_stake', 'referrer_stake','total_supply', 'min_fee_for_percent_fee_type'],
	        percentFeeToken: ['min_fee_for_percent_fee_type'],
	        simpleToken: ['total_supply', 'fee_value'],
	        mineableToken: ['max_supply','block_reward', 'min_stake', 'referrer_stake', 'ref_share']
	    }
	    this.constraints = new TokenConstraints(this.maxBigInt);
    };

	handleInputChange(event) {
		const target = event.target;
		const name = target.name;

		this.props.updateTokenProperty({
			field : name,
			value : name === 'ticker' ? target.value.toUpperCase() : target.value
		});

		this.processData();
		
	};

	validateAndShowSubmit() {
		let dataValid = true;
		let possibleToIssueToken = true;

		//this.processData();

		// this.props.updateDataValid({
		// 	value : dataValid
		// });
		// this.props.updatePossibleToIssueToken({
		// 	value : possibleToIssueToken
		// });


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
							if (BigInt(this.mainToken.amount) >= contract_pricelistIssueToken) {
								this.balanseIsEnough = true;
							}
						}		
					}									
				})
			}
        })
	}

	getBigIntParametersArray() {
        let parametersArr = this.BigIntParametersArrays.simpleToken;
        if (this.props.tokenData.fee_type.value === 1)
            parametersArr = parametersArr.concat(this.BigIntParametersArrays.percentFeeToken);
        if (this.props.tokenData.token_type.value === 2)
            parametersArr = parametersArr.concat(this.BigIntParametersArrays.mineableToken);
        return parametersArr;
    }

	transformBigIntValue(propertyName) {
        let decimals = this.props.tokenData.decimals;
        if (propertyName === 'fee_value' && this.props.tokenData.fee_type === '1') {
            decimals = this.constraints.fee_value_props_arr[1].decimalPlaces;
        } else if (propertyName === 'ref_share') {
            decimals = this.constraints.ref_share.decimalPlaces;
        }
        let property = this.props.tokenData[propertyName];
        let transformResultObj = this.valueProcessor.valueToBigInt(property, decimals);


        if (this.props.tokenBigIntData[propertyName].completeValue !== transformResultObj.completeValue) {
			this.props.updateTokenBigIntProperty({
				field : propertyName,
				value : {
					        integerPart    : transformResultObj.integerPart, //only for dev check
					        fractionalPart : transformResultObj.rawFractionalPart, //only for validation//////////////////////////////////////////////
					        completeValue  : transformResultObj.value
						}
			});        	
        }
    }    

    processData() {
    	let that = this;
    	let validator = new Validator;
    	let validationRules = new IssueTokenValidationRules;
        if (this.props.tokenData.token_type === '2') {
            let miningPeriodCheck = validator.batchValidate({value : this.props.tokenData.mining_period}, validationRules.getMiningPeriodValidationRules(this.props.tokenData.mining_period, this.constraints.mining_period));////////////////////////////////////////////////////////////////////////
            if (miningPeriodCheck) 
                this.calculateBlockReward();
            else
            	this.props.updateTokenProperty({
					field : 'block_reward',
					value : '---'
				}); 
        }
        let newMaxValue = this.valueProcessor.getMaxValue(this.props.tokenData.decimals);
        this.BigIntParametersArrays.decimalsDependent.forEach(function(parameter) {
           that.constraints[parameter].maxValue = that.constraints.fee_value_props_arr[0].maxValue = newMaxValue;
        });
        this.constraints.fee_value_props_arr[0].decimalPlaces = this.props.tokenData.decimals;
        let commonValidationRules = validationRules.getCommonValidationRules(this.props.tokenData, this.constraints);
        let commonCheckNewTokenData = validator.batchValidate(this.props.tokenData, commonValidationRules);
        if  (commonCheckNewTokenData) {
            let bigIntParamsArr = this.getBigIntParametersArray();
            bigIntParamsArr.forEach(param => that.transformBigIntValue(param));
            let specialValidationRules = validationRules.getSpecialValidationRules(this.props, this.constraints, this.maxBigInt);
        	validator.batchValidate({value : this.props.tokenData.mining_period}, specialValidationRules); 
        }
    }

	calculateBlockReward() {
        let block_reward = (this.props.tokenData.max_supply - this.props.tokenData.total_supply)/(this.props.tokenData.mining_period * 5760);

        if (typeof block_reward === 'number')
        	this.props.updateTokenProperty({
				field : 'block_reward',
				value : block_reward.toFixed(this.props.tokenData.decimals)
			});
        else
            this.props.updateTokenProperty({
				field : 'block_reward',
				value : '---'
			});        
    }    
    
    render () {    	
    	this.watchIfEnoughMainTokenBalanceToIssueToken();    	
		const t = this.props.t;  
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
	        		<div className="h1 mb-5">{t('etm.issueToken')}</div>
					<Form onSubmit={e => { e.preventDefault(); }}>
						<Form.Group as={Row} controlId="setTokenTicker">
							<Form.Label column sm={2}>{t('etm.ticker')}</Form.Label>
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
							<Form.Label column sm={2}>{t('etm.name')}</Form.Label>
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
								<Form.Label column sm={2}>{t('etm.tokenType')}</Form.Label>
								<Col xl={7}>
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
									<Form.Label column sm={2}>{t('etm.maxSupply')}</Form.Label>
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
									<Form.Label column sm={2}>{t('etm.blockReward')}</Form.Label>
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
									<Form.Label column sm={2}>{t('etm.miningPeriod')}</Form.Label>
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
									<Form.Label column sm={2}>{t('etm.minStake')}</Form.Label>
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
									<Form.Label column sm={2}>{t('etm.referrerStake')}</Form.Label>
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
									<Form.Label column sm={2}>{t('etm.refShare')}</Form.Label>
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
							<Form.Label column sm={2}>{t('etm.decimals')}</Form.Label>
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
								<Form.Label column sm={2}>{t('etm.feeType')}</Form.Label>
								<Col xl={7}>
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
								<Form.Label column sm={2}>{t('etm.minFee')}</Form.Label>
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