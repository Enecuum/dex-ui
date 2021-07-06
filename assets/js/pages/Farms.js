import React, { Suspense } from 'react';
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import StakeModal from '../components/StakeModal';
import { withTranslation } from "react-i18next";
import extRequests from '../requests/extRequests';
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
        this.farms = [
        	{        		
        		id        : 'a',
        		token1	  : 'CAKE',
        		token2	  : 'BNB',
        		title     : 'CAKE-BNBa',
        		earned    : 123456789123456789,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'b',
        		token1	  : 'CAKE1',
        		token2	  : 'BNB',
        		title     : 'CAKE1-BNBb',
        		earned    : 0,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'c',
        		token1	  : 'CAKE2',
        		token2	  : 'BNB',
        		title     : 'CAKE2-BNBc',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'd',
        		token1	  : 'CAKE',
        		token2	  : 'BNB',
        		title     : 'CAKE-BNBd',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'e',
        		token1	  : 'CAKE',
        		token2	  : 'BNB',
        		title     : 'CAKE-BNBe',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'f',
        		token1	  : 'CAKE',
        		token2	  : 'BNB',
        		title     : 'CAKE-BNBf',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	},
        	{        		
        		id        : 'g',
        		token1	  : 'CAKE',
        		token2	  : 'BNB',
        		title     : 'CAKE-BNBg',
        		earned    : 1,
        		apy       : 1,
        		liquidity : 1,
        		reward    : 0
        	}
        ]

        this.dropFarmActions = [
            'create_farm',
            'add_funds',
            'put_stake',
            'close_stake',
            // 'get_reward',
            // 'increase_stake'
        ];

        this.state = {
            dropFarmActionsParams : {
                create_farm : {
                    "stake_token": "1111111111111111111111111111111111111111111111111111111111111111",
                    "reward_token": "1111111111111111111111111111111111111111111111111111111111111111",
                    "block_reward": 1,
                    "emission": 100                
                },
                add_funds : {
                    farm_id : '',
                    amount : ''
                },
                put_stake : {
                    farm_id : '',
                    amount : ''
                },
                close_stake : {
                    farm_id : ''
                },
                get_reward : {//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Нет параметров! Id Фермы??!!

                },
                increase_stake : {//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Id Фермы??!!
                    amount  : ''
                }                
            }
        }
        this.handleChange = this.handleChange.bind(this);
    };

      handleChange(action, param, event) {
        console.log(action, param)
        let value = event.target.value;
        this.setState(state => (state.dropFarmActionsParams[action][param] = value, state))
        console.log(this.state)
      }

    executeDropFarmAction(actionType, pubkey, params) {
        console.log(params)
        let obj = {}
        for (let param in params) {
                if (param === 'amount' || param === 'block_reward' || param === 'emission')
                        obj[param] = BigInt(params[param]) * BigInt(1e10);
                else 
                     obj[param] = params[param]    
        }

        extRequests.farmAction(pubkey, actionType, obj)        
        .then(result => {
            console.log(obj)
            console.log('Success', result.hash)
            this.props.updCurrentTxHash(result.hash);
            // this.props.changeWaitingStateType('submitted');
            // this.props.resetStore();
        },
        error => {
            console.log('Error')
            this.props.changeWaitingStateType('rejected');
        });
    }

    aupdateExpandedRow(event) {
    	const target = event.target;
		const farmId = target.closest("tr").dataset.expandedRow === "true" ? null : target.closest("tr").dataset.farmId;
		this.props.updateExpandedRow({
			value : farmId
		});
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

    getStakeControl(basic=false) {

        let params = {
            lpTokenName : 'Cale-BNB ' + 'LP'
        } 

    	return (
    		<>
                <div className="d-flex align-items-center justify-content-start mb-2">
                    {'placeholder' !== undefined && 1 > 0 && 
                        <div className="text-color3 mr-2">
                            Stake
                        </div>
                    }
                    <div className="color-2">
                        {params.lpTokenName}  
                    </div>                                                                    
                </div>
                <div>
                    {basic === true &&
                        <>
                            {this.getStakeButton(true)}
                        </>
                    }
                    {basic === false &&
                        <>
                            {this.getIncreaseDecreaseStakeButtons()}
                        </>
                    }
                </div>
    		</>
    	)	
    }

    getStakeButton(active = true) {
        let attributes = {
            active : {
                className : 'btn outline-border-color3-button py-3 px-5 w-100'
            },
            disabled : {
                className : 'btn outline-border-color2-button py-3 px-5 w-100'
            }
        }
        let buttonState = active === true ? 'active' : 'disabled';
        return (
            <>
                {<Button
                    className={attributes[buttonState].className}                   
                    disabled={!active}
                >
                    Stake LP
                </Button>}                
            </>
        )
    }

    getIncreaseDecreaseStakeButtons(){
        return (
            <>
                <div className="d-flex align-items-center justify-content-between">
                    <div className="stake-value">
                        0.176
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        <Button
                            className="btn outline-border-color3-button btn btn-primary mr-2 increase-decrease-btn zero-flex text-center" style={{paddingTop : '2px'}}
                        >
                            -
                        </Button>
                        <Button
                            className="btn outline-border-color3-button btn btn-primary increase-decrease-btn zero-flex text-center"
                        >
                            +
                        </Button>                                                
                    </div>
                </div>

            </>
        )        
    }

    getHarvestButton(active = true) {
    	let attributes = {
    		active : {
    			className : 'btn btn-info py-3 px-5',
    			variant   : 'btn-info'
    		},
    		disabled : {
    			className : 'btn btn-secondary py-3 px-5',
    			variant   : 'btn-secondary'		
    		}
    	}
    	let buttonState = active === true ? 'active' : 'disabled';
    	return (
    		<>
    			<Button
					className={attributes[buttonState].className}
					variant={attributes[buttonState].variant}
					disabled={!active}
				>
					Harvest
				</Button>
    		</>
    	)
    }

    getFarmsTable() {
    	const t = this.props.t;
    	let that = this;
    	return (
    		<>
				<div className="d-flex align-items-center justify-content-between pb-4">
					<div className="d-flex align-items-center justify-content-start">
						<i className="fas fa-grip-horizontal mr-2"></i>
						<i className="fas fa-table mr-3"></i>
						<Dropdown className="mr-3">
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
                                placeholder='Search farm' />
                    </div>
				</div>

<div className="h2">
    Actions
</div>

<Accordion className="mb-4">
  <Card style={{borderColor: 'var(--color2)', borderWidth: '2px', borderRadius: '3px'}}>
    <Accordion.Toggle as={Card.Header} eventKey="0"   style={{
                       color: 'white',
                       backgroundColor: 'var(--color8)',
                       borderBottom: '2px solid #454d55'
                   }}
                   className="hover-pointer">
      Create Farm
    </Accordion.Toggle>
    <Accordion.Collapse eventKey="0">
      <Card.Body className="pt-4" style={{
                       color: 'white',
                       backgroundColor: 'var(--color8)',
                       opacity: '0.9'
                   }}>
                       
                        <Form>
                          <Form.Group controlId="formGroupEmail">
                            <Form.Label>stake_token</Form.Label>
                            <Form.Control type="text" placeholder="" value={this.state.dropFarmActionsParams.create_farm.stake_token} onChange={(e) => this.handleChange('create_farm','stake_token', e)} style={{backgroundColor: '#777'}}/>
                          </Form.Group>
                          <Form.Group controlId="formGroupPassword">
                            <Form.Label>reward_token</Form.Label>
                            <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.create_farm.reward_token} onChange={(e) => this.handleChange('create_farm','reward_token', e)} style={{backgroundColor: '#777'}}/>
                          </Form.Group>
                          <Form.Group controlId="formGroupEmail">
                            <Form.Label>block_reward</Form.Label>
                            <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.create_farm.block_reward} onChange={(e) => this.handleChange('create_farm','block_reward', e)} style={{backgroundColor: '#777'}}/>
                          </Form.Group>
                          <Form.Group controlId="formGroupPassword">
                            <Form.Label>emission</Form.Label>
                            <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.create_farm.emission} onChange={(e) => this.handleChange('create_farm','emission', e)} style={{backgroundColor: '#777'}}/>
                          </Form.Group>                          
                        </Form>
                        <Button variant="primary"
                        onClick={this.executeDropFarmAction.bind(this, 'create_farm', this.props.pubkey, this.state.dropFarmActionsParams.create_farm)}>
                            Create Farm
                        </Button>
                   </Card.Body>
    </Accordion.Collapse>
  </Card>
  <Card style={{borderColor: 'var(--color2)', borderWidth: '2px', borderRadius: '3px'}}>
    <Accordion.Toggle as={Card.Header} eventKey="1"  style={{
                       color: 'white',
                       backgroundColor: 'var(--color8)',
                       borderBottom: '2px solid #454d55'
                   }}
                   className="hover-pointer">
     Add Funds
    </Accordion.Toggle>
    <Accordion.Collapse eventKey="1">
      <Card.Body className="pt-4" style={{
                       color: 'white',
                       backgroundColor: 'var(--color8)',
                       opacity: '0.9'
                   }}>
                        <Form>
                          <Form.Group controlId="formGroupEmail">
                            <Form.Label>farm_id</Form.Label>
                            <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.add_funds.farm_id} onChange={(e) => this.handleChange('add_funds','farm_id', e)} style={{backgroundColor: '#777'}}/>
                          </Form.Group>
                          <Form.Group controlId="formGroupPassword">
                            <Form.Label>amount</Form.Label>
                            <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.add_funds.amount} onChange={(e) => this.handleChange('add_funds','amount', e)} style={{backgroundColor: '#777'}}/>
                          </Form.Group>                          
                        </Form>
                        <Button variant="primary"
                        onClick={this.executeDropFarmAction.bind(this, 'add_funds', this.props.pubkey, this.state.dropFarmActionsParams.add_funds)}>
                            Add Funds
                          </Button>
                   </Card.Body>
    </Accordion.Collapse>
  </Card>
  <Card  style={{borderColor: 'var(--color2)', borderWidth: '2px', borderRadius: '3px'}}>
    <Accordion.Toggle as={Card.Header} eventKey="2"  style={{
                       color: 'white',
                       backgroundColor: 'var(--color8)',
                       borderBottom: '2px solid #454d55'
                   }}
                   className="hover-pointer">
     Put Stake
    </Accordion.Toggle>
    <Accordion.Collapse eventKey="2">
      <Card.Body className="pt-4" style={{
                       color: 'white',
                       backgroundColor: 'var(--color8)',
                       opacity: '0.9'
                   }}>
                        <Form>
                          <Form.Group controlId="formGroupEmail">
                            <Form.Label>farm_id</Form.Label>
                            <Form.Control type="text" placeholder=""   value={this.state.dropFarmActionsParams.put_stake.farm_id} onChange={(e) => this.handleChange('put_stake','farm_id', e)} style={{backgroundColor: '#777'}}/>
                          </Form.Group>
                          <Form.Group controlId="formGroupPassword">
                            <Form.Label>amount</Form.Label>
                            <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.put_stake.amount} onChange={(e) => this.handleChange('put_stake','amount', e)} style={{backgroundColor: '#777'}}/>
                          </Form.Group>
                        </Form>
                        <Button variant="primary"
                        onClick={this.executeDropFarmAction.bind(this, 'put_stake', this.props.pubkey, this.state.dropFarmActionsParams.put_stake)}>
                             Put Stake
                          </Button>                        
                   </Card.Body>
    </Accordion.Collapse>
  </Card>
  <Card  style={{borderColor: 'var(--color2)', borderWidth: '2px', borderRadius: '3px'}}>
    <Accordion.Toggle as={Card.Header} eventKey="3"  style={{
                       color: 'white',
                       backgroundColor: 'var(--color8)',
                       borderBottom: '2px solid #454d55'
                   }}
                   className="hover-pointer">
     Close Stake
    </Accordion.Toggle>
    <Accordion.Collapse eventKey="3">
      <Card.Body className="pt-4" style={{
                       color: 'white',
                       backgroundColor: 'var(--color8)',
                       opacity: '0.9'
                   }}>
                        <Form>
                          <Form.Group controlId="formGroupEmail">
                            <Form.Label>farm_id</Form.Label>
                            <Form.Control type="text" placeholder="" value={this.state.dropFarmActionsParams.close_stake.farm_id} onChange={(e) => this.handleChange('close_stake','farm_id', e)} style={{backgroundColor: '#777'}}/>
                          </Form.Group>
                        </Form>
                        <Button variant="primary"
                        onClick={this.executeDropFarmAction.bind(this, 'close_stake', this.props.pubkey, this.state.dropFarmActionsParams.close_stake)}>
                             Close Stake
                          </Button>                          
                   </Card.Body>
    </Accordion.Collapse>
  </Card>    
</Accordion>

<div className="h2">
    Farms
</div>
		    	<div className="drop-farms-table-wrapper">
			    	<SimpleBar style={{paddingBottom: '25px', paddingTop : '10px'}} autoHide={false}>	
						<Table hover variant="dark" style={{tableLayout : 'auto'}}>
							<tbody>
						        {this.farms.map(( farm, index ) => {
						        	return (
							          	<>
								            <tr key={index} data-farm-id={farm.id} data-expanded-row={this.props.expandedRow === farm.id}>
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
														<div>{valueProcessor.usCommasBigIntDecimals((farm.liquidity !== undefined ? '$ ' + farm.liquidity : '---'), 10, 10)}</div>
													</div>	
												</td>
												<td>
													<div className="cell-wrapper">
														<div className="text-color4">Reward</div>
														<div>{valueProcessor.usCommasBigIntDecimals((farm.reward !== undefined ? farm.reward : '---'), 10, 10)}</div>
													</div>	
												</td>

												<td>
													<div className="cell-wrapper d-flex align-items-center justify-content-center text-color4 details-control unselectable-text" onClick={that.aupdateExpandedRow.bind(that)}>
														<div className="mr-2">Details</div>
														<span className="icon-Icon26 d-flex align-items-center chevron-down"></span>
													</div>	
												</td>										
								            </tr>
								            {this.props.expandedRow === farm.id &&
												<tr className="mb-3 farm-controls-wrapper">
													<td colSpan="6" className="py-4">
														<div className="row mx-0 px-0">
															<div className="col-12 col-lg-6 col-xl-5 offset-xl-1 pr-xl-5">
																<div className="border-solid-2 c-border-radius2 border-color2 p-4">
																	<div className="d-flex align-items-center justify-content-start mb-2">
																		{farm.earned !== undefined && farm.earned > 0 && 
																			<div className="text-color3 mr-2">
																				{farm.token1}
																			</div>
																		}
																		<div className="color-2">
																			Earned
																		</div>																	
																	</div>
																	<div className="d-flex align-items-center justify-content-between">
																		<div className="earned-value">{valueProcessor.usCommasBigIntDecimals((farm.earned !== undefined ? farm.earned : '---'), 10, 10)}</div>
																		{this.getHarvestButton(farm.earned !== undefined && farm.earned > 0)}
																	</div>
																</div>
															</div>
															<div className="col-12 col-lg-6 col-xl-5 pl-xl-5">
																<div className="border-solid-2 c-border-radius2 border-color2 p-4">
																	{this.getStakeControl()}
																</div>
															</div>
														</div>
													</td>
												</tr>
								    		}
							            </>
						         	);
						        })}
						  	</tbody>
						</Table>
					</SimpleBar>
				</div>
			</>					
    	)
    }

    render() {
		const t = this.props.t;
		//this.pairsArr = this.populateTable();
    	return (
    		<div className="row">    		
    			<div className={!this.props.connectionStatus ? 'swap-card-wrapper px-2 pt-0 mt-0' : 'col-12 col-lg-10 offset-lg-1 col-xl-10 offset-xl-1'}>    			
					<Card className="c-card-1 pt-4" id="farmsCard">
					  <Card.Body>
					    <Card.Text as="div">
						    {this.farms.length > 0 && this.props.connectionStatus ? this.getFarmsTable() : this.getTmpErrorElement()}						    
					    </Card.Text>
					  </Card.Body>
					</Card>    			
    			</div>
                <Suspense fallback={<div>---</div>}>
                    <StakeModal />
                </Suspense>
    		</div>
        )
    }        
};

const WFarms = connect(mapStoreToProps(components.FARMS), mapDispatchToProps(components.FARMS))(withTranslation()(Farms));

export default WFarms;    