import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
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
    };

	handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		console.log(name)
		this.props.updateTokenProperty({
			field : name,
			value : target.value
		});
	}


    
    render () {
        return (
        	<div id="ETMWrapper" className="py-5 px-5">
        		<div className="h1 mb-5">Issue token</div>
				<Form onSubmit={e => { e.preventDefault(); }}>
					<Form.Group as={Row} controlId="setTokenTicker">
						<Form.Label column sm={2}>Ticker</Form.Label>
						<Col xl={7}>
							<Form.Control 
								type="text"
								placeholder={this.props.tokenData.ticker}
								name="ticker"
								autocomplete="off"
								value={this.props.tokenData.ticker}
								onChange={this.handleInputChange} />
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
								autocomplete="off"
								value={this.props.tokenData.name}
								onChange={this.handleInputChange} />
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
									onChange={this.handleInputChange}
								/>
								<Form.Check
									type="radio"
									label="Reissuable"
									name="token_type"
									value="1"
									checked={this.props.tokenData.token_type === "1"}
									id="tokenType1"
									onChange={this.handleInputChange}
								/>
								<Form.Check
									type="radio"
									label="Mineable"
									name="token_type"
									value="2"
									checked={this.props.tokenData.token_type === "2"}
									id="tokenType2"
									onChange={this.handleInputChange}
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
								autocomplete="off"
								value={this.props.tokenData.total_supply}
								onChange={this.handleInputChange} />
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
										autocomplete="off"
										value={this.props.tokenData.max_supply}
										onChange={this.handleInputChange} />
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
										autocomplete="off"
										value={this.props.tokenData.block_reward}
										onChange={this.handleInputChange} />
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
									autocomplete="off"
									value={this.props.tokenData.mining_period}
									onChange={this.handleInputChange} />
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
										autocomplete="off"
										value={this.props.tokenData.min_stake}
										onChange={this.handleInputChange} />
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
										autocomplete="off"
										value={this.props.tokenData.referrer_stake}
										onChange={this.handleInputChange} />
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
										autocomplete="off"
										value={this.props.tokenData.ref_share}
										onChange={this.handleInputChange} />
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
								autocomplete="off"
								value={this.props.tokenData.decimals}
								onChange={this.handleInputChange} />
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
									onChange={this.handleInputChange} />
								<Form.Check
									type="radio"
									label="Percent"
									name="fee_type"
									value="1"
									checked={this.props.tokenData.fee_type === "1"}
									id="setFeeType2"
									onChange={this.handleInputChange} />
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
								autocomplete="off"
								value={this.props.tokenData.fee_value}
								onChange={this.handleInputChange} />
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
									autocomplete="off"
									value={this.props.tokenData.min_fee_for_percent_fee_type}
									onChange={this.handleInputChange} />
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
							type="submit" >
								Issue token
							</Button>
						</Col>					
					</Row>
				</Form>
			</div>
        );
    };
};

const WEtm = connect(mapStoreToProps(components.ETM), mapDispatchToProps(components.ETM))(withTranslation()(Etm));

export default WEtm;