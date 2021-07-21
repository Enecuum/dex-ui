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
import networkApi from '../requests/networkApi';
import swapApi from '../requests/swapApi';
import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';
import utils from '../utils/swapUtils';
import testFormulas from '../utils/testFormulas';
import '../../css/drop-farms.css';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

const valueProcessor = new ValueProcessor();

class Farms extends React.Component {
    constructor(props) {
        super(props);
        this.farms = [];

        this.dropFarmActions = [
            'farm_create',
            'farm_increase_stake',
            'farm_decrease_stake',
            'farm_close_stake',
            'farm_get_reward'
        ];

        this.state = {
            dropFarmActionsParams : {
                farm_create : {
                    "stake_token": "1111111111111111111111111111111111111111111111111111111111111111",
                    "reward_token": "1111111111111111111111111111111111111111111111111111111111111111",
                    "block_reward": 1,
                    "emission": 100                
                },
                farm_increase_stake : {
                    farm_id : '',
                    amount : ''
                },
                farm_decrease_stake : {
                    farm_id : '',
                    amount : ''
                },
                farm_close_stake : {
                    farm_id : ''
                },
                farm_get_reward : {
                    farm_id  : ''
                }                
            }
        }
        this.handleChange = this.handleChange.bind(this); 
        this.executeHarvest = this.executeHarvest.bind(this);    

        this.updateMainTokenInfo();
        this.updatePricelist();

    };

    handleChange(action, param, event) {
        console.log(action, param)
        let value = event.target.value;
        this.setState(state => (state.dropFarmActionsParams[action][param] = value, state))
        console.log(this.state)
    }

    executeDropFarmAction(actionType, pubkey, params) {
        let obj = {}
        for (let param in params) {
                if (param === 'amount' || param === 'block_reward' || param === 'emission')
                        obj[param] = valueProcessor.valueToBigInt(params[param], 10).value;
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

    executeHarvest() {
        extRequests.farmAction(this.props.pubkey, 'farm_get_reward', {farm_id  : this.props.expandedRow})        
        .then(result => {
            console.log('Success', result.hash);
            //this.closeModal();
            //this.props.updCurrentTxHash(result.hash);
            // this.props.changeWaitingStateType('submitted');
            // this.props.resetStore();
        },
        error => {
            console.log('Error')
            //this.props.changeWaitingStateType('rejected');
        });
    }

    updateExpandedRow(event) {
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

    updateMainTokenAmount() {
        let mainTokenAmount = 0;
        if (this.props.mainToken !== undefined && this.props.balances !== undefined) {
            let mainTokenBalance = this.props.balances.find(token => token.token === this.props.mainToken);

            if (mainTokenBalance !== undefined) {
                mainTokenAmount = mainTokenBalance.amount;
            }

            if (this.props.mainTokenAmount != mainTokenAmount) {
                this.props.updateMainTokenAmount({
                    value : mainTokenAmount
                });
            }    
        }    
    }

    updateMainTokenInfo() {
        let tokenInfoRequest = swapApi.getTokenInfo(this.props.mainToken);
        tokenInfoRequest.then(result => {
            if (!result.lock) {
                result.json().then(mainToken => {
                    this.props.updateMainTokenDecimals({
                        value : mainToken[0].decimals
                    });
                    this.props.updateMainTokenFee({
                        value : BigInt(mainToken[0].fee_value)
                    });                    
                });
            }
        });
    }

    updatePricelist() {
        let contractPricelist = networkApi.getContractPricelist();
        contractPricelist.then(result => {
            if (!result.lock) {
                result.json().then(pricelist => {
                    this.props.updatePricelist({
                        value : pricelist
                    });
                });
            }
        });        
    }



    getStakeControl(farmTitle, basic=true) {
        const t = this.props.t;
        let params = {
            lpTokenName : farmTitle //+ ' LP'
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
                            {this.getStakeButton()}
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

    getStakeButton() {
        const t = this.props.t;
        let active = this.props.mainTokenAmount > (this.props.mainTokenFee + BigInt(this.props.pricelist.farm_increase_stake));
        let attributes = {
            active : {
                className : 'btn py-3 px-5 w-100 outline-border-color3-button'
            },
            disabled : {
                className : 'btn py-3 px-5 w-100 outline-border-color2-button'
            }
        }
        let buttonState = active === true ? 'active' : 'disabled';
        return (
            <>
                {<Button
                    className={attributes[buttonState].className}                   
                    disabled={!active}
                    onClick={(e) => this.showStakeModal('farm_increase_stake', e)}
                >
                    Stake LP
                </Button>}                
            </>
        )
    }

    getIncreaseDecreaseStakeButtons(){
        let increaseStakeActive = this.props.mainTokenAmount > (this.props.mainTokenFee + BigInt(this.props.pricelist.farm_increase_stake));
        let decreaseStakeActive = this.props.mainTokenAmount > (this.props.mainTokenFee + BigInt(this.props.pricelist.farm_close_stake));
        return (
            <>
                <div className="d-flex align-items-center justify-content-between">
                    <div className="stake-value">
                        {valueProcessor.usCommasBigIntDecimals((this.props.managedFarmData !== null && this.props.managedFarmData.stake !== null ? this.props.managedFarmData.stake : '---'), 10, 10)}
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        <Button
                            className="btn outline-border-color3-button btn btn-primary mr-2 increase-decrease-btn zero-flex text-center" style={{paddingTop : '2px'}}
                            disabled={!decreaseStakeActive}
                            onClick={(e) => this.showStakeModal('farm_decrease_stake', e)}
                        >
                            -
                        </Button>
                        <Button
                            className="btn outline-border-color3-button btn btn-primary increase-decrease-btn zero-flex text-center"
                            disabled={!increaseStakeActive}
                            onClick={(e) => this.showStakeModal('farm_increase_stake', e)}                            
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
                    onClick={() => this.executeHarvest()}
				>
					Harvest
				</Button>
    		</>
    	)
    }

    showStakeModal (action) {

        this.props.updateCurrentAction({
            value : action
        });

        //if (action === 'farm_increase_stake') {
            this.props.updateCurrentAction({
                value : action
            });

            this.props.updateStakeData({
                field : 'actionCost',
                value : BigInt(this.props.mainTokenFee) + BigInt(this.props.pricelist[action])
            });

            let stakeTokenBalance = this.props.balances.find(token => token.token === this.props.managedFarmData.stake_token_hash);

            if (stakeTokenBalance !== undefined && BigInt(stakeTokenBalance.amount) > 0n) {
                this.props.updateStakeData({
                    field : 'stakeTokenAmount',
                    value : stakeTokenBalance.amount
                });                
            } else {
                this.props.updateStakeData({
                    field : 'stakeTokenAmount',
                    value : 0n
                });
            }
            this.props.updShowStakeModal({
                value : true
            });            
        //}      
    }

    getFarmsTable() {
    	const t = this.props.t;
    	let that = this;

        let farmsList = networkApi.getDexFarms(this.props.pubkey);

        farmsList.then(result => {
            if (!result.lock) {
                result.json().then(resultFarmsList => {
                    this.updateMainTokenAmount();
                    this.farms = resultFarmsList;
                    if (this.props.expandedRow !== null) {
                        this.props.updateManagedFarmData({
                            value : this.farms.find(farm => farm.farm_id === this.props.expandedRow)
                        });  
                    }
                })
            }
        }, () => {
            this.farms = [];
        })

    	return (
    		<>
				<div className="SET-D-FLEX-IF-READY d-none align-items-center justify-content-between pb-4">
					<div className="d-flex align-items-center justify-content-start">
						<i className="fas fa-grip-horizontal mr-2"></i>
						<i className="fas fa-table mr-3"></i>
						<Dropdown className="mr-3 sort-by">
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
<div className="d-none1" id="farmActions">
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
          Create a drop farm (farm_create)
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
                                <Form.Control type="text" placeholder="" value={this.state.dropFarmActionsParams.farm_create.stake_token} onChange={(e) => this.handleChange('farm_create','stake_token', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>
                              <Form.Group controlId="formGroupPassword">
                                <Form.Label>reward_token</Form.Label>
                                <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.farm_create.reward_token} onChange={(e) => this.handleChange('farm_create','reward_token', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>
                              <Form.Group controlId="formGroupEmail">
                                <Form.Label>block_reward</Form.Label>
                                <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.farm_create.block_reward} onChange={(e) => this.handleChange('farm_create','block_reward', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>
                              <Form.Group controlId="formGroupPassword">
                                <Form.Label>emission</Form.Label>
                                <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.farm_create.emission} onChange={(e) => this.handleChange('farm_create','emission', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>                          
                            </Form>
                            <Button variant="primary"
                            onClick={this.executeDropFarmAction.bind(this, 'farm_create', this.props.pubkey, this.state.dropFarmActionsParams.farm_create)}>
                                Create a drop farm (farm_create)
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
         Stake (farm_increase_stake)
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
                                <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.farm_increase_stake.farm_id} onChange={(e) => this.handleChange('farm_increase_stake','farm_id', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>
                              <Form.Group controlId="formGroupPassword">
                                <Form.Label>amount</Form.Label>
                                <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.farm_increase_stake.amount} onChange={(e) => this.handleChange('farm_increase_stake','amount', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>                          
                            </Form>
                            <Button variant="primary"
                            onClick={this.executeDropFarmAction.bind(this, 'farm_increase_stake', this.props.pubkey, this.state.dropFarmActionsParams.farm_increase_stake)}>
                                Stake (farm_increase_stake)
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
         Unstake (farm_decrease_stake)
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
                                <Form.Control type="text" placeholder=""   value={this.state.dropFarmActionsParams.farm_decrease_stake.farm_id} onChange={(e) => this.handleChange('farm_decrease_stake','farm_id', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>
                              <Form.Group controlId="formGroupPassword">
                                <Form.Label>amount</Form.Label>
                                <Form.Control type="text" placeholder=""  value={this.state.dropFarmActionsParams.farm_decrease_stake.amount} onChange={(e) => this.handleChange('farm_decrease_stake','amount', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>
                            </Form>
                            <Button variant="primary"
                            onClick={this.executeDropFarmAction.bind(this, 'farm_decrease_stake', this.props.pubkey, this.state.dropFarmActionsParams.farm_decrease_stake)}>
                                Unstake (farm_decrease_stake)
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
         Unstake and receive rewards (farm_close_stake)
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
                                <Form.Control type="text" placeholder="" value={this.state.dropFarmActionsParams.farm_close_stake.farm_id} onChange={(e) => this.handleChange('farm_close_stake','farm_id', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>
                            </Form>
                            <Button variant="primary"
                            onClick={this.executeDropFarmAction.bind(this, 'farm_close_stake', this.props.pubkey, this.state.dropFarmActionsParams.farm_close_stake)}>
                                Unstake and receive rewards (farm_close_stake)
                              </Button>                          
                       </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card  style={{borderColor: 'var(--color2)', borderWidth: '2px', borderRadius: '3px'}}>
        <Accordion.Toggle as={Card.Header} eventKey="4"  style={{
                           color: 'white',
                           backgroundColor: 'var(--color8)',
                           borderBottom: '2px solid #454d55'
                       }}
                       className="hover-pointer">
         Harvest reward (farm_get_reward)
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="4">
          <Card.Body className="pt-4" style={{
                           color: 'white',
                           backgroundColor: 'var(--color8)',
                           opacity: '0.9'
                       }}>
                            <Form>
                              <Form.Group controlId="formGroupEmail">
                                <Form.Label>farm_id</Form.Label>
                                <Form.Control type="text" placeholder="" value={this.state.dropFarmActionsParams.farm_get_reward.farm_id} onChange={(e) => this.handleChange('farm_get_reward','farm_id', e)} style={{backgroundColor: '#777'}}/>
                              </Form.Group>
                            </Form>
                            <Button variant="primary"
                            onClick={this.executeDropFarmAction.bind(this, 'farm_get_reward', this.props.pubkey, this.state.dropFarmActionsParams.farm_get_reward)}>
                               Harvest reward (farm_get_reward)
                              </Button>                          
                       </Card.Body>
        </Accordion.Collapse>
      </Card>          
    </Accordion>
</div>
            <div className="h2">
                Farms
            </div>
		    	<div className="drop-farms-table-wrapper">
			    	<SimpleBar style={{paddingBottom: '25px', paddingTop : '10px'}} autoHide={false}>	
						<Table hover variant="dark" style={{tableLayout : 'auto'}}>
							<tbody>
						        {this.farms.map(( farm, index ) => {
                                    let farmTitle = farm.stake_token_name //+ '-' + farm.reward_token_name;
						        	return (
							          	<>
								            <tr key={index} data-farm-id={farm.farm_id} data-expanded-row={this.props.expandedRow === farm.farm_id}>
												<td className="text-nowrap">
													<div className="cell-wrapper d-flex align-items-center justify-content-center">
														{farmTitle}
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
														<div>${farm.liquidity !== null ? farm.liquidity.toLocaleString('en-us') : '---'}</div>
													</div>	
												</td>
												<td>
													<div className="cell-wrapper">
														<div className="text-color4">Reward</div>
														<div>{valueProcessor.usCommasBigIntDecimals((farm.block_reward !== undefined ? farm.block_reward : '---'), 10, 10)}</div>
													</div>	
												</td>

												<td>
													<div className="cell-wrapper d-flex align-items-center justify-content-center text-color4 details-control unselectable-text" onClick={that.updateExpandedRow.bind(that)}>
														<div className="mr-2">Details</div>
														<span className="icon-Icon26 d-flex align-items-center chevron-down"></span>
													</div>	
												</td>										
								            </tr>
								            {this.props.expandedRow === farm.farm_id &&
												<tr className="mb-3 farm-controls-wrapper">
													<td colSpan="6" className="py-4">
														<div className="row mx-0 px-0">
															<div className="col-12 col-lg-6 col-xl-5 offset-xl-1 pr-xl-5">
																<div className="border-solid-2 c-border-radius2 border-color2 p-4">
																	<div className="d-flex align-items-center justify-content-start mb-2">
																		{farm.earned !== undefined && farm.earned > 0 && 
																			<div className="text-color3 mr-2">
																				{farm.reward_token_name}
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
																	{this.getStakeControl(farmTitle, !(farm.stake !== null && farm.stake > 0))}
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
						    {this.props.connectionStatus ? this.getFarmsTable() : this.getTmpErrorElement() /*проверка на пустой массив списка ферм*/}				    
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