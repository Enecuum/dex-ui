import React, { Suspense } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import { connect } from 'react-redux';
import presets from '../../store/pageDataPresets';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import StakeModalDrops from '../components/StakeModalDrops';
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
import lsdp from "../utils/localStorageDataProcessor";
import {FarmsFilter} from "../elements/Filters";
import swapUtils from '../utils/swapUtils'

const valueProcessor = new ValueProcessor();

const DROPS_FILTER_NAME = "dropsStatusFilter"


class Drops extends React.Component {
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
                    "stake_token": "824e7b171c01e971337c1b25a055023dd53c003d4aa5aa8b58a503d7c622651e",
                    "reward_token": "0000000000000000000000000000000000000000000000000000000000000001",
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
        this.getDataSet();     
    };

    getDataSet() {
        this.updateMainTokenInfo();
        this.updateMainTokenAmount();
        this.updateStakeTokenBalance();        
        this.updatePricelist();
        this.updateFarms(); 
    }

    componentDidMount() {
      this.intervalDrops = setInterval(() => {
                            this.getDataSet();
                        }, 5000);
    }

    componentWillUnmount() {
      clearInterval(this.intervalDrops);
    }

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
            let interpolateParams, txTypes = presets.pending.allowedTxTypes
            if (actionType === txTypes.farm_decrease_stake || actionType === txTypes.farm_increase_stake) {
                interpolateParams = {
                    value0  : this.props.stakeData.stakeValue.numberValue,
                    ticker0 : this.props.managedFarmData.reward_token_name
                }
            } else if (actionType === txTypes.farm_create) {
                interpolateParams = {
                    ticker0 : this.props.managedFarmData.stake_token_name,
                    ticker1 : this.props.managedFarmData.reward_token_name
                }
            } else if (actionType === txTypes.farm_get_reward) {
                interpolateParams = {
                    value0  : valueProcessor.usCommasBigIntDecimals(this.props.managedFarmData.earned, utils.getTokenObj(this.props.tokens, this.props.managedFarmData.reward_token_hash)),
                    ticker0 : this.props.managedFarmData.reward_token_name
                }
            }
            lsdp.write(result.hash, 0, actionType, interpolateParams)
            this.props.updCurrentTxHash(result.hash);
        },
        error => {
            console.log('Error')
            this.props.changeWaitingStateType('rejected');
        });
    }

    executeHarvest() {
        extRequests.farmAction(this.props.pubkey, 'farm_get_reward', this.props.mainTokenFee + BigInt(this.props.pricelist.farm_get_reward), {farm_id  : this.props.expandedRow})        
        .then(result => {
            console.log('Success', result.hash);
            let interpolateParams = {
                value0  : valueProcessor.usCommasBigIntDecimals(this.props.managedFarmData.earned, utils.getTokenObj(this.props.tokens, this.props.managedFarmData.reward_token_hash).decimals),
                ticker0 : this.props.managedFarmData.reward_token_name,
                asset_out : this.props.managedFarmData.reward_token_hash
            }
            lsdp.write(result.hash, 0, 'farm_get_reward', interpolateParams)
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

    checkByStatus(farm) {
        let filter = lsdp.simple.get(DROPS_FILTER_NAME), items = this.getItems()
        if (farm !== undefined && filter) {
            if (filter === items.all.value)
                return true
            if (farm.blocks_left === null) {
                return filter === items.paused.value
            } else if (farm.blocks_left <= 0)
                return filter === items.finished.value
            else if (farm.blocks_left > 0)
                return filter === items.active.value
        }
        return false
    }

    updateFarms() {
        let whiteList = presets.dropFarms.spaceDrops.whiteList;
        let farmsList = networkApi.getDexFarms(this.props.pubkey, []);

        farmsList.then(result => {
            if (!result.lock) {
                result.json().then(resultFarmsList => {
                    this.farms = resultFarmsList.filter(farm => farm.stake_token_hash === this.props.networkInfo.dex.DEX_ENX_TOKEN_HASH)
                    this.props.updateFarmsList({
                        value : resultFarmsList
                    });
                    if (this.props.expandedRow !== null) {
                        this.props.updateManagedFarmData({
                            value : this.farms.find(farm => farm.farm_id === this.props.expandedRow)
                        });                       
                    } else {
                        this.props.updateManagedFarmData({
                            value : null
                        });                        
                    }                                      
                })
            }
        }, () => {
            this.farms = [];
        })
    }    

    updateExpandedRow(event) {
    	const target = event.target;        
		const farmId = target.closest("tr").dataset.expandedRow === "true" ? null : target.closest("tr").dataset.farmId;
        let managedFarm = this.farms.find(farm => farm.farm_id === farmId);
        this.props.updateManagedFarmData({
            value : managedFarm !== undefined ? managedFarm : null
        });                       

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
        if (this.props.mainToken !== undefined && this.props.balances !== undefined) {
            let mainTokenBalance = this.props.balances.find(token => token.token === this.props.mainToken);

            if (mainTokenBalance !== undefined) {
               let mainTokenAmount = mainTokenBalance.amount;
               this.props.updateMainTokenAmount({
                    value : BigInt(mainTokenAmount)
                });
            } else {
               this.props.updateMainTokenAmount({
                    value : 0n
                });                
            }  
        } else {
           this.props.updateMainTokenAmount({
                value : 0n
            });                
        }     
    }

    updateMainTokenInfo() {
        let mainTokenHash = this.props.mainToken
        let tokenInfoRequest = swapApi.getTokenInfo(mainTokenHash);
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
                            {t('dropFarms.myStake')}
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
        let active = (this.props.managedFarmData.blocks_left === null || this.props.managedFarmData.blocks_left > 0) && (this.props.mainTokenAmount > (this.props.mainTokenFee + BigInt(this.props.pricelist.farm_increase_stake)));
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
                    {t('dropFarms.stakeNamedToken', {tokenName: this.props.managedFarmData !== null ? this.props.managedFarmData.stake_token_name : ''})}
                </Button>}                
            </>
        )
    }

    getIncreaseDecreaseStakeButtons(){
        let increaseStakeActive = (this.props.managedFarmData.blocks_left > 0) && (this.props.mainTokenAmount > (this.props.mainTokenFee + BigInt(this.props.pricelist.farm_increase_stake)));
        let decreaseStakeActive = this.props.mainTokenAmount > (this.props.mainTokenFee + BigInt(this.props.pricelist.farm_close_stake));
        return (
            <>
                <div className="value-and-control">
                    <div className="stake-value-wrapper">
                        <div className="stake-value">
                            {valueProcessor.usCommasBigIntDecimals((this.props.managedFarmData !== null && this.props.managedFarmData.stake !== null ? this.props.managedFarmData.stake : '---'), this.props.managedFarmData.stake_token_decimals, this.props.managedFarmData.stake_token_decimals)}
                        </div>
                        <div className="color-2 stake-value-usd">≈ {this.getValueInUSD()} USD</div>
                    </div>
                    <div className="d-flex align-items-center">
                        <Button
                            className="btn outline-border-color3-button mr-2 increase-decrease-btn zero-flex text-center" style={{paddingTop : '2px'}}
                            disabled={!decreaseStakeActive}
                            onClick={(e) => this.showStakeModal('farm_decrease_stake', e)}
                        >
                            -
                        </Button>
                        <Button
                            className="btn outline-border-color3-button increase-decrease-btn zero-flex text-center"
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

    getValueInUSD() {
        let res;
        let price = this.props.exchangeRate !== undefined ? this.props.exchangeRate : 0;
        let stringPrice = price.toString();
        let priceDecimalsPart = stringPrice.split('.')[1];
        let priceDecimals = priceDecimalsPart !== undefined ? priceDecimalsPart.length : 0;
        let priceToBigint = valueProcessor.valueToBigInt(price, priceDecimals).value;

        let op0 = {
            value    : this.props.managedFarmData.stake,
            decimals : this.props.managedFarmData.stake_token_decimals
        };

        let op1 = {
            value    : priceToBigint,
            decimals : priceDecimals
        };        

        res = valueProcessor.mul(op0, op1);
        return valueProcessor.usCommasBigIntDecimals(res.value, res.decimals, 5);

    }

    getHarvestButton(active = true) {
        const t = this.props.t;
        let enoughMainTokenToHarvest = this.props.mainTokenAmount > (this.props.mainTokenFee + BigInt(this.props.pricelist.farm_get_reward));
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
					disabled={!active || !enoughMainTokenToHarvest}
                    onClick={() => this.executeHarvest()}
				>
					{t('dropFarms.harvest')}
				</Button>
    		</>
    	)
    }

    updateStakeTokenBalance() {
        if (this.props.managedFarmData !== null) {
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
        }       
    }

    showStakeModal (action) {

        this.props.updateCurrentAction({
            value : action
        });

        this.props.updateStakeData({
            field : 'actionCost',
            value : BigInt(this.props.mainTokenFee) + BigInt(this.props.pricelist[action])
        });

        this.updateStakeTokenBalance();

        this.props.updShowStakeModal({
            value : true
        });
    }

    getFarmStatus(farm) {
        let status = '---';
        if (farm !== undefined) {
            const t = this.props.t;
            if (farm.blocks_left === null)
                status = t('dropFarms.pausedFarmStatusDescription', {stakeTokenName : farm.stake_token_name});            
            else if (farm.blocks_left <= 0)
                status = t('dropFarms.finished');
            else if (farm.blocks_left > 0)
                status = t('dropFarms.nBlocksLeft', {blocksLeft : farm.blocks_left});         
        }
        return status;
    }

    getItems () {
        let t = this.props.t
        return {
            all : {
                text : t('all'),
                value: "all"
            },
            active : {
                text : t('dropFarms.activeFilter'),
                value: "active"
            },
            paused : {
                text : t('dropFarms.pausedFilter'),
                value: "paused"
            },
            finished : {
                text : t('dropFarms.finishedFilter'),
                value: "finished"
            }
        }
    }

    afterUpdate () {
        this.getDataSet()
    }

    getFarmsTable() {
    	const t = this.props.t;

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
<div className="d-none" id="farmActions">
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
                <div className="d-flex justify-content-between">
                    <div>
                        <div className="h2 mb-2">
                            {t('navbars.left.drops')}
                        </div>
                        <h5 className="mb-5 text-color4">
                            {t('dropFarms.subscriptDrops')}
                        </h5>
                    </div>
                    <div className="m-2">
                        <FarmsFilter name={DROPS_FILTER_NAME}
                                     title={t("status")}
                                     getItems={this.getItems.bind(this)}
                                     afterUpdate={this.afterUpdate.bind(this)}
                        />
                    </div>
                </div>
		    	<div className="drop-farms-table-wrapper">			    		
					<Table hover variant="dark" className="table-to-cards">
						<tbody>
					        {this.farms.map(( farm, index ) => {
					            if (!this.checkByStatus(farm))
					                return <></>
                                let farmTitle = farm.stake_token_name + '-' + farm.reward_token_name;                                   
					        	return (
						          	<>
							            <tr key={index} data-farm-id={farm.farm_id} data-expanded-row={this.props.expandedRow === farm.farm_id}>
											<td className="text-nowrap">
												<div className="cell-wrapper text-center">
                                                    <div className="text-color4">{t('dropFarms.stake')}-{t('dropFarms.earn')}</div>
													<div>{farmTitle}</div>
												</div>
											</td>
                                            <td className="">                                                    
                                                <div className="cell-wrapper">
                                                    <div className="text-color4">{t('status')}</div>
                                                    <div className="farm-status">{this.getFarmStatus(farm)}</div>
                                                </div>
                                            </td>                                                
											<td>
												<div className="cell-wrapper">
													<div className="text-color4">{t('dropFarms.earned')}</div>
													<div className="long-value">{
                                                        farm.earned !== undefined && swapUtils.removeEndZeros(
                                                            valueProcessor.usCommasBigIntDecimals(farm.earned, farm.reward_token_decimals, farm.reward_token_decimals)
                                                        ) || "0.0"
                                                    } {farm.reward_token_name}
													</div>
												</div>	
											</td>
											<td>
												<div className="cell-wrapper">
													<div className="text-color4">{t('dropFarms.apy')}</div>
													<div className="long-value">{farm.apy && farm.blocks_left > 0 ? valueProcessor.usCommasBigIntDecimals(farm.apy, 2, 2) : '---'}%</div>
												</div>	
											</td>
											<td>
												<div className="cell-wrapper">
													<div className="text-color4">{t('dropFarms.totalStaked')}</div>
													<div className="long-value">{valueProcessor.usCommasBigIntDecimals((farm.total_stake !== undefined ? farm.total_stake : '---'), farm.stake_token_decimals, farm.stake_token_decimals)}</div>
												</div>	
											</td>
											<td>
												<div className="cell-wrapper">
													<div className="text-color4">{t('dropFarms.rewardPerBlock')}</div>
													<div className="long-value">{
													    swapUtils.removeEndZeros(
													        valueProcessor.usCommasBigIntDecimals((farm.block_reward !== undefined ? farm.block_reward : '---'), farm.reward_token_decimals, farm.reward_token_decimals)
                                                        )
													}</div>
												</div>	
											</td>

											<td>
												<div className="cell-wrapper d-flex align-items-center justify-content-center text-color4 details-control unselectable-text" onClick={this.updateExpandedRow.bind(this)}>
													<div className="mr-2">{t('dropFarms.details')}</div>
													<span className="icon-Icon26 d-flex align-items-center chevron-down"></span>
												</div>	
											</td>										
							            </tr>
							            {this.props.expandedRow === farm.farm_id &&
											<tr className="mb-3 farm-controls-wrapper">
												<td colSpan="7" className="py-4">
													<div className="dropfarms-controls-wrapper mx-0 px-0">
														<div className="dropfarm-control">
															<div className="border-solid-2 c-border-radius2 border-color2 p-4">
																<div className="d-flex align-items-center justify-content-start mb-2">
																	{farm.earned !== undefined && farm.earned > 0 && 
																		<div className="text-color3 mr-2">
																			{farm.reward_token_name}
																		</div>
																	}
																	<div className="color-2">
																		{t('dropFarms.earned')}
																	</div>																	
																</div>
																<div className="value-and-control harvest-wrapper">
                                                                    <div className="harvest-value-wrapper">
																	    <div className="earned-value">{valueProcessor.usCommasBigIntDecimals((farm.earned !== undefined ? farm.earned : '---'), farm.reward_token_decimals, farm.reward_token_decimals)}</div>
																	    <div className="color-2 earned-value-usd">≈ 0.00000 USD</div>
                                                                    </div>
                                                                    {this.getHarvestButton(farm.earned !== undefined && farm.earned > 0)}
																</div>
															</div>
														</div>
														<div className="dropfarm-control">
															<div className="border-solid-2 c-border-radius2 border-color2 p-4">
																{this.getStakeControl(farm.stake_token_name, !(farm.stake !== null && farm.stake > 0))}
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
				</div>
			</>					
    	)
    }

    render() {
		const t = this.props.t;
       
    	return (
    		<div className="row">    		
    			<div className={!this.props.connectionStatus ? 'swap-card-wrapper px-2 pt-0 mt-0' : 'col-12 col-lg-10 offset-lg-1 col-xl-10 offset-xl-1'}>    			
					<Card className="c-card-1 pt-4" id="farmsCard">
					  <Card.Body>
					    <Card.Text as="div">
						    {this.props.connectionStatus && this.farms !== undefined && this.farms.length > 0 ? this.getFarmsTable() : this.getTmpErrorElement() /*проверка на пустой массив списка ферм*/}				    
					    </Card.Text>
					  </Card.Body>
					</Card>    			
    			</div>
                <Suspense fallback={<div>---</div>}>
                    <StakeModalDrops/>
                </Suspense>
    		</div>
        )
    }        
}

const WDrops = connect(mapStoreToProps(components.DROPS), mapDispatchToProps(components.DROPS))(withTranslation()(Drops));

export default WDrops;    