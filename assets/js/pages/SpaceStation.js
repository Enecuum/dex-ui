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
import StakeModalSpaceStation from '../components/StakeModalSpaceStation';
import DistributeModal from '../components/DistributeModal';
import { withTranslation } from "react-i18next";
import networkApi from '../requests/networkApi';
import swapApi from '../requests/swapApi';
import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';
import utils from '../utils/swapUtils';
import testFormulas from '../utils/testFormulas';
import '../../css/drop-farms.css';
import '../../css/space-station-pools.css';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import lsdp from "../utils/localStorageDataProcessor";
import swapUtils from "../utils/swapUtils";
import Tooltip from "../elements/Tooltip";
import PairLogos from '../components/PairLogos'

const valueProcessor = new ValueProcessor();

class SpaceStation extends React.Component {
    constructor(props) {
        super(props);
        this.farms = [];
        this.spaceStationPools = [];

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
        if (this.props.connectionStatus) {
            this.updateMainTokenInfo();
            this.updateMainTokenAmount();
            this.updateStakeTokenBalance();
            this.updatePricelist();
            this.updateFarms();
            this.updateSpaceStationPools();
        }
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

    updateFarms() {
        let whiteList = this.props.networkInfo.dex.DEX_SPACE_STATION_ID !== undefined ? [this.props.networkInfo.dex.DEX_SPACE_STATION_ID] : [null];
        let farmsList = networkApi.getDexFarms(this.props.pubkey, whiteList);

        farmsList.then(result => {
            if (!result.lock && (this.props.networkInfo.dex.DEX_SPACE_STATION_ID !== undefined)) {
                result.json().then(resultFarmsList => {
                    this.farms = resultFarmsList;
                    let sStation = this.farms.find(farm => farm.farm_id === this.props.networkInfo.dex.DEX_SPACE_STATION_ID);
                    this.props.updateFarmsList({
                        value : resultFarmsList
                    });

                    this.props.updateExpandedRow({
                        value : this.props.networkInfo.dex.DEX_SPACE_STATION_ID
                    });
                    this.props.updateManagedFarmData({
                        value : sStation
                    });
                    
                    if (!(sStation.stake > 0))
                        sStation.stake = 0;

                    if (sStation.total_stake > 0) {                        
                        let stakeShare =  valueProcessor.div({value: BigInt(sStation.stake) * 100n, decimals: 2}, {value: BigInt(sStation.total_stake), decimals: 2});
                        this.stakeShare = this.getValueAsFormattedString(stakeShare);
                    } else
                        this.stakeShare = '---'

                    
                })
            }
        }, () => {
            this.farms = [];
        })
    }

    updateSpaceStationPools() {
        let that = this;
        let spaceStationPools = networkApi.getSpaceStationPools();
        spaceStationPools.then(result => {
            if (!result.lock) {
                result.json().then(resultSpaceStationPools => {
                    let spaceStationPools = resultSpaceStationPools;
                    let commanderBalances = networkApi.getAccountBalancesAll();
                    networkApi.getAccountBalancesAll(that.props.networkInfo.dex.DEX_COMMANDER_ADDRESS)
                    .then(balances => {
                        balances.json().then(function(commanderBalances) {
                            let enxHash = that.props.networkInfo.dex.DEX_ENX_TOKEN_HASH;
                            spaceStationPools.forEach(function(pool) {
                                let LPBalance = commanderBalances.find(balance => balance.token === pool.asset_LP);
                                if (LPBalance !== undefined) {
                                    pool.LPTokenOnCommanderBalance = LPBalance;
                                    let vol_LP = {
                                        value    : pool.volume_LP,
                                        decimals : pool.decimals_LP
                                    }

                                    let vol_ENX = {
                                        value    : pool.volume_ENX,
                                        decimals : pool.decimals_ENX
                                    }

                                    let amountIn = {
                                        value    : pool.LPTokenOnCommanderBalance.amount,
                                        decimals : pool.decimals_LP,
                                        token    : {
                                            hash: pool.asset_LP
                                        }
                                    }

                                    let pool_fee = {
                                        value    : pool.pool_fee,
                                        decimals : 2
                                    }

                                    let enxOut = testFormulas.getSwapPrice(vol_LP, vol_ENX, amountIn, pool_fee);
                                    enxOut.token = {
                                            hash: pool.asset_ENX
                                        }

                                    pool.enxPrice = valueProcessor.div(vol_LP,vol_ENX);

                                    let pair = {
                                        token_0 : {
                                            volume : vol_LP.value,
                                            hash : pool.asset_LP
                                        },
                                        token_1 : {
                                            volume : vol_ENX.value,
                                            hash : pool.asset_ENX
                                        },
                                        lt : pool.token_hash,
                                        pool_fee : pool.pool_fee
                                    }

                                    let priceImpact = testFormulas.countPriceImpact(pair, amountIn, enxOut, that.props.tokens);

                                    pool.distributeResult = {
                                        enxOut : enxOut,
                                        priceImpact : that.getValueAsFormattedString(priceImpact)
                                    }
                                } else {
                                    pool.LPTokenOnCommanderBalance = {
                                        amount: 0
                                    };
                                }
                            });

                            that.spaceStationPools = spaceStationPools;
                            that.props.updatePoolsList({
                                value : that.spaceStationPools
                            });
                        });
                    })
                },() => {
                    that.spaceStationPools = [];
                    that.props.updatePoolsList({
                        value : that.spaceStationPools
                    });
                })
            }
        }, () => {
            this.spaceStationPools = [];
        })
    }

    getValueAsFormattedString(data) {
        if (data.value == 0)
            return "0.00"
        else if (data.decimals - String(data.value).length > 2 || !Object.keys(data).length)
            return  "< 0.001"
        try {
            return valueProcessor.usCommasBigIntDecimals(data.value, data.decimals)
        } catch (e) {
            return "---"
        }         
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
                    {basic === true && this.props.pricelist != undefined && this.props.pricelist.farm_increase_stake != undefined && this.props.mainTokenFee !== undefined && this.props.mainTokenAmount !== undefined &&
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

        let active = (BigInt(this.props.mainTokenAmount) > (BigInt(this.props.mainTokenFee) + BigInt(this.props.pricelist.farm_increase_stake)));
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
                    {t('dropFarms.stakeNamedToken', {tokenName: this.props.managedFarmData !== null && this.props.managedFarmData !== undefined ? this.props.managedFarmData.stake_token_name : ''})}
                </Button>}                
            </>
        )
    }

    getIncreaseDecreaseStakeButtons(){
        let increaseStakeActive = undefined;
        let decreaseStakeActive = undefined;

        if (this.props.pricelist !== undefined && this.props.pricelist.farm_increase_stake !== undefined
         && this.props.pricelist.farm_close_stake !== undefined && this.props.mainTokenAmount !== undefined && this.props.mainTokenFee !== undefined) {
            increaseStakeActive = (BigInt(this.props.mainTokenAmount) > (BigInt(this.props.mainTokenFee) + BigInt(this.props.pricelist.farm_increase_stake)));
            decreaseStakeActive = BigInt(this.props.mainTokenAmount) > (BigInt(this.props.mainTokenFee) + BigInt(this.props.pricelist.farm_close_stake));
        } 

        return (
            <>
                {this.props.managedFarmData !== null && this.props.managedFarmData !== undefined &&               
                    <div className="value-and-control">
                        <div className="stake-value-wrapper">
                            <div className="stake-value">
                                {valueProcessor.usCommasBigIntDecimals(this.props.managedFarmData.stake, this.props.managedFarmData.stake_token_decimals, this.props.managedFarmData.stake_token_decimals)}
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
                }   
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
        if (this.props.pricelist !== undefined && this.props.pricelist.farm_get_reward !== undefined) {
            let enoughMainTokenToHarvest = BigInt(this.props.mainTokenAmount) > (BigInt(this.props.mainTokenFee) + BigInt(this.props.pricelist.farm_get_reward));
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
    }

    updateStakeTokenBalance() {
        if (!(this.props.managedFarmData === null || this.props.managedFarmData === undefined)) {
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

    showDistributeModal (pool) {
        this.props.updateManagedPool({
            value: pool
        });

        this.props.updShowDistributeModal({
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

    getFarmsTable() {
    	const t = this.props.t;

    	return (
    		<>
                <div className="h2 mb-4">
                    {t('navbars.left.spaceStation')}
                </div>
                <div className={"d-flex justify-content-start"}>
                    <div className="d-block h4 d-md-flex mb-5">
                        <div className="text-color3 mr-3 text-nowrap">{t('dropFarms.totalStaked')}</div>
                        <div className="text-nowrap">{valueProcessor.usCommasBigIntDecimals((this.farms[0].total_stake !== undefined ? this.farms[0].total_stake : '---'), this.farms[0].stake_token_decimals, this.farms[0].stake_token_decimals)} {this.farms[0].stake_token_name}</div>
                    </div>
                    <div className="d-block h4 d-md-flex mb-5 ml-4">
                        <div className="text-color3 mr-3 text-nowrap">{t('dropFarms.stakeShare')}</div>
                        <div className="text-nowrap">{this.stakeShare !== undefined ? this.stakeShare : '---'} %</div>
                    </div>
                </div>

                <div className="h5 mb-4 text-color4">
                    {t('spaceStation.aim')}
                </div>
    	    	<div className="drop-farms-table-wrapper mb-5">			    		
    				<Table hover variant="dark" className="table-to-cards">
    					<tbody>
    				        {this.farms.map(( farm, index ) => {                                                                   
    				        	return (
    					          	<>
    						            {this.props.expandedRow === farm.farm_id &&
    										<tr className="mb-3 farm-controls-wrapper">
    											<td colSpan="7" className="py-4">
    												<div className="dropfarms-controls-wrapper mx-0 px-0">
    													<div className="dropfarm-control">
    														<div className="border-solid-2 c-border-radius2 border-color2 p-4">
    															<div className="d-flex align-items-center justify-content-start mb-2">																	
    																<div className="text-color3 mr-2">
    																	{farm.reward_token_name}
    																</div>																	
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

    switchToPool() {
      this.props.changeMenuItem('pool');      
    }

    getLPAlias(lpHash, lpTicker) {
        let that = this;
        let alias = lpTicker;
        let re = /^[^\s]+$/;
        if (this.props.tokens !== undefined) {
            let lp = this.props.tokens.find(token => token.hash === lpHash);
            if (lp !== undefined && lp.caption !== null && lp.caption !== '' && re.test(lp.caption))
                alias = lp.caption;
        }

        return alias
    }

    isLpToken (hash) {
        let res = swapUtils.searchByLt(this.props.pairs, hash)
        if (res === undefined)
            return false
        return res
    }

    getPoolsTable() {
        const t = this.props.t;
        
        let isDisabled = true;
        if (this.props.mainTokenAmount !== undefined && this.props.mainTokenAmount > 0)
            isDisabled = false;

        function getClassName(disabled, nullTreasure) {
            let distributeButtonClass = 'btn unselectable-text'
            let disabledDependendClass = 'outline-border-color2-button'
            if (!disabled && !nullTreasure) {
                disabledDependendClass = 'outline-border-color3-button'
            } 
            return `${distributeButtonClass} ${disabledDependendClass}`
        }
        let poolCounter = 0
        return(
            <>
                <div className="h2 mb-5">
                    LP-ENX pools
                </div>

                <div className="pairs-table-wrapper">
                    <SimpleBar style={{paddingBottom: '25px', paddingTop : '10px'}} autoHide={false}>    
                        <Table hover variant="dark" style={{tableLayout : 'auto'}}>
                              <thead>
                                <tr>
                                    <th>{t('numberSign')}</th>
                                    <th>{t('name')}</th>
                                    <th>
                                        {t("spaceStation.treasuryFund.header")} <Tooltip text={t("spaceStation.treasuryFund.tooltip")} />
                                    </th>
                                    <th>
                                        {t("spaceStation.estimation.header")} <Tooltip text={t("spaceStation.estimation.tooltip")} />
                                    </th>
                                    <th>
                                        {t("spaceStation.enxPriceInPool.header")} <Tooltip text={t("spaceStation.enxPriceInPool.tooltip")} />
                                    </th>
                                    <th>
                                        {t("spaceStation.priceImpact.header")} <Tooltip text={t("spaceStation.priceImpact.tooltip")} />
                                    </th>
                                    <th />
                                </tr>
                              </thead>
                            <tbody>

                                {this.spaceStationPools.map(( pool, index ) => {
                                    if (!this.isLpToken(pool.asset_LP))
                                        return (<></>)

                                    let nullTreasure = pool.LPTokenOnCommanderBalance.amount <= 0;
                                    let LPAlias = this.getLPAlias(pool.asset_LP, pool.ticker_LP);

                                    return (
                                        <tr key={++poolCounter}>
                                            <td>{poolCounter}</td>
                                            <td className="text-nowrap d-flex">
                                                <PairLogos
                                                    logos={{
                                                        logo1 : swapUtils.getTokenObj(this.props.tokens, pool.asset_ENX).logo,
                                                        logo2 : swapUtils.getTokenObj(this.props.tokens, pool.asset_LP).logo,
                                                        net : this.props.net,
                                                        size : 'xs'
                                                    }}
                                                />
                                                <a
                                                    href = {"/#!action=pool&pair=" + pool.ticker_LP + "-" + pool.ticker_ENX + '&from=' + pool.asset_LP + "&to=" + pool.asset_ENX}
                                                    onClick={this.switchToPool.bind(this)}
                                                    className="text-color4-link hover-pointer ml-2">
                                                    {LPAlias}-{pool.ticker_ENX}
                                                </a>
                                            </td>
                                            <td>{pool.LPTokenOnCommanderBalance !== undefined ? valueProcessor.usCommasBigIntDecimals(pool.LPTokenOnCommanderBalance.amount, pool.LPTokenOnCommanderBalance.decimals, pool.LPTokenOnCommanderBalance.decimals) : '---'} {LPAlias}</td>
                                            <td>
                                                {pool.distributeResult !== undefined ? valueProcessor.usCommasBigIntDecimals(pool.distributeResult.enxOut.value, pool.distributeResult.enxOut.decimals, pool.decimals_ENX) : '---'} ENX
                                            </td>
                                            <td>
                                                {pool.enxPrice !== undefined ? valueProcessor.usCommasBigIntDecimals(pool.enxPrice.value, pool.enxPrice.decimals, pool.decimals_LP) : '---'} {LPAlias}
                                            </td>
                                            <td>
                                                {pool.distributeResult !== undefined ? pool.distributeResult.priceImpact : '---'}%
                                            </td>
                                            <td>
                                                <Button
                                                    className={getClassName(isDisabled, nullTreasure)}
                                                    disabled={isDisabled || nullTreasure}                                                
                                                    onClick={this.showDistributeModal.bind(this, pool)}>
                                                    Distribute
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                              </tbody>
                        </Table>
                    </SimpleBar>
                </div>
            </>
        ); 
    }    

    render() {
		const t = this.props.t;
       
    	return (
    		<div className="row">    		
    			<div className={!this.props.connectionStatus ? 'swap-card-wrapper px-2 pt-0 mt-0' : 'col-12 col-lg-10 offset-lg-1 col-xl-10 offset-xl-1'}>    			
					<Card className="c-card-1 pt-4" id="farmsCard">
					  <Card.Body>
					    <Card.Text as="div">
						    {this.props.connectionStatus && this.farms !== undefined && this.farms.length > 0 ? this.getFarmsTable() : this.getTmpErrorElement()}
                            {this.props.connectionStatus && this.spaceStationPools !== undefined && this.spaceStationPools.length > 0 &&
                                <>
                                    {this.getPoolsTable()}
                                </>	
                            }    			    
					    </Card.Text>
					  </Card.Body>
					</Card>                       			
    			</div> 
                <Suspense fallback={<div>---</div>}>                    
                    <StakeModalSpaceStation />
                </Suspense>
                <Suspense fallback={<div>---</div>}>                    
                    <DistributeModal />
                </Suspense>                                
    		</div>
        )
    }        
};

const WSpaceStation = connect(mapStoreToProps(components.SPACE_STATION), mapDispatchToProps(components.SPACE_STATION))(withTranslation()(SpaceStation));

export default WSpaceStation;    