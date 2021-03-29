import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import 'bootstrap/dist/css/bootstrap.min.css';


class EtmForm extends React.Component {
    constructor (props) {
        super(props);
        this.root = props.outer;

    };
    
    render () {


        return (
        	<div id="ETMWrapper" className="py-5 px-5">
        		<div className="h1 mb-5">Issue token</div>
				<Form>


					<Form.Group as={Row} controlId="setTokenTicker">
						<Form.Label column sm={2}>Ticker</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Ticker" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>


					<Form.Group as={Row} controlId="setTokenName">
						<Form.Label column sm={2}>Name</Form.Label>
						<Col xl={7} >
							<Form.Control type="text" placeholder="Name" />
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
									name="tokenType"
									id="tokenType0"
								/>
								<Form.Check
									type="radio"
									label="Reissuable"
									name="tokenType"
									id="tokenType1"
								/>
								<Form.Check
									type="radio"
									label="Mineable"
									name="tokenType"
									id="tokenType2"
								/>
							</Col>	
						</Form.Group>
					</fieldset>


					<Form.Group as={Row} controlId="setTokenPremineEmission">
						<Form.Label column sm={2}>Premine or Emission</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Premine or Emission" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>


					<Form.Group as={Row} controlId="setTokenMaxSupply">
						<Form.Label column sm={2}>Max Supply</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Max Supply" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>



					<Form.Group as={Row} controlId="setTokenBlockReward">
						<Form.Label column sm={2}>Block Reward</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Block Reward" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>



					<Form.Group as={Row} controlId="setTokenMiningPeriod">
						<Form.Label column sm={2}>Mining Period</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Mining Period" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>



					<Form.Group as={Row} controlId="setTokenMinStake">
						<Form.Label column sm={2}>Min Stake</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Min Stake" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>




					<Form.Group as={Row} controlId="setTokenReferrerStake">
						<Form.Label column sm={2}>Referrer Stake</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Referrer Stake" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>



					<Form.Group as={Row} controlId="setTokenRefShare">
						<Form.Label column sm={2}>RefShare</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="RefShare" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>					



					<Form.Group as={Row} controlId="setTokenDecimals">
						<Form.Label column sm={2}>Decimals</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Decimals" />
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
									name="setFeeType"
									id="setFeeType1"
								/>
								<Form.Check
									type="radio"
									label="Percent"
									name="setFeeType"
									id="setFeeType2"
								/>
							</Col>	
						</Form.Group>
					</fieldset>



					<Form.Group as={Row} controlId="setTokenFee">
						<Form.Label column sm={2}>Fee</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Fee" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>




					<Form.Group as={Row} controlId="setTokenMinFee">
						<Form.Label column sm={2}>Min Fee</Form.Label>
						<Col xl={7}>
							<Form.Control type="text" placeholder="Min Fee" />
							<Form.Text className="err-msg">
								ErrorMesssage
							</Form.Text>
						</Col>	
					</Form.Group>					
					<Row>
						<Col xl={{ span: 7, offset: 2 }} className="text-center">
							<Button variant="primary" type="submit" >
								Issue token
							</Button>
						</Col>					
					</Row>
				</Form>
			</div>
        );
    };
};

export default EtmForm;