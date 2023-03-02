import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import presets from '../../store/pageDataPresets';
import StakeModalVoting from '../components/StakeModalVoting';
import networkApi from '../requests/networkApi';
import swapApi from '../requests/swapApi';
import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';
import utils from '../utils/swapUtils';
import '../../css/drop-farms.css';
import 'simplebar/dist/simplebar.min.css';
import lsdp from "../utils/localStorageDataProcessor";


const valueProcessor = new ValueProcessor();


class Voting extends React.Component {
    constructor(props) {
        super(props);
        this.farms = [];
        this.height = "---";

        this.dropFarmActions = [
            'farm_create',
            'farm_increase_stake',
            'farm_decrease_stake',
            'farm_close_stake',
            'farm_get_reward'
        ];

        this.state = {
            expandedVote : undefined,
            dropFarmActionsParams : {
                farm_create : {
                    "stake_token": "0000000000000000000000000000000000000000000000000000000000000001",
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
        this.updStats()
    }

    componentDidMount() {
        this.curLang = this.props["i18n"].language
        this.interval = setInterval(() => {
            this.getDataSet()
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    handleChange(action, param, event) {
        console.log(action, param)
        let value = event.target.value;
        this.setState(state => (state.dropFarmActionsParams[action][param] = value, state))
        // console.log(this.state)
    }

    executeDropFarmAction(actionType, pubkey, params) {
        let obj = {}
        for (let param in params) {
                if (param === 'amount' || param === 'block_reward' || param === 'emission')
                        obj[param] = valueProcessor.valueToBigInt(params[param], 10).value;
                else 
                     obj[param] = params[param]    
        }

        extRequests.farmAction(pubkey, actionType, BigInt(presets.network.nativeToken.fee), obj)        
        .then(result => {
            // console.log(obj)
            console.log('Success', result.hash)
            let interpolateParams, txTypes = presets.pending.allowedTxTypes
            if (actionType === txTypes.farm_decrease_stake || actionType === txTypes.farm_increase_stake) {
                interpolateParams = {
                    value0  : this.props.stakeData.stakeValue.numberValue,
                    ticker0 : this.props.managedFarmData.stake_token_name
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

    updStats() {
        let rawData = networkApi.getStats()
        
        rawData.then(result => {
            if (!result.lock) {
                result.json().then(stats => {
                    this.height = stats.height
                })
            }
        })
    }

    updateFarms() {
        let list = []
        let votes = presets.dropFarms.voting.votes
        for (let vote in votes)
            list = list.concat(votes[vote].list)

        let whiteList = list.map(farm => farm.farm_id);
        let farmsList = networkApi.getDexFarms(this.props.pubkey, whiteList);

        farmsList.then(result => {
            if (!result.lock) {
                result.json().then(resultFarmsList => {
                    this.farms = resultFarmsList;
                    
                    this.farms.map(farm => {
                        let farmData = list.find(item => item.farm_id === farm.farm_id)
                        if (farmData)
                            farm = Object.assign(farm, farmData)
                        return farm
                    })

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
                    <div className="stake-value">
                        {valueProcessor.usCommasBigIntDecimals((this.props.managedFarmData !== null && this.props.managedFarmData.stake !== null ? this.props.managedFarmData.stake : '---'), this.props.managedFarmData.stake_token_decimals, this.props.managedFarmData.stake_token_decimals)}
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
        if (this.props.managedFarmData !== null && this.props.balances !== undefined) {
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

    countTime (curBlock, finalBlock) {
        let blocksLeft = finalBlock - curBlock
        if (blocksLeft < 0)
            return "---"

        let formatDate = function (dateNum) {
            // return dateNum < 10 ? `0${dateNum}` : dateNum
            return dateNum
        }

        if (this.props.networkInfo && this.props.networkInfo.target_speed) {
            let curTime = new Date()
            let endTime = new Date().getTime() + blocksLeft * this.props.networkInfo.target_speed * 1000
            let diffTime = endTime - curTime.getTime()

            let days = formatDate(Math.floor(diffTime / (1000 * 60 * 60 * 24)))
            let hours = formatDate(Math.floor(diffTime / (1000 * 60 * 60)) % 24)
            let minutes = formatDate(Math.floor(diffTime / (1000 * 60)) % 60)
            let timeIntParams = {days: days, hours: hours, minutes: minutes}, langPath = "dropFarms.nDaysLeft"
            if (days == 0) {
                delete timeIntParams.days
                if (hours == 0) {
                    delete timeIntParams.hours
                    langPath = "dropFarms.nMinutesLeft"
                } else
                    langPath = "dropFarms.nHoursLeft"
            }
            let datetime = new Date(endTime).toLocaleString()
            return datetime.substring(0, datetime.length - 3)
        } else {
            return blocksLeft
        }
    }

    checkByStatus(farm) {
        // if (farm !== undefined)
            return true
        // return false
    }

    afterUpdate () {
        this.getDataSet()
    }

    sortVotes(votes) {
        let res = {active: [], past: []}
        res = Object.keys(votes).reduce((sortedVotes, voteKey, index) => {
            let vote = {...votes[voteKey], voteName : voteKey, voteIndex : index}
            if (votes[voteKey].finalBlockNum < this.height || votes[voteKey].forceDeactivation)
                sortedVotes.past.push(vote)
            else 
                sortedVotes.active.push(vote)
            return sortedVotes
        }, res)
        return res
    }

    getFarmsTable() {
    	const t = this.props.t
        let votes = this.sortVotes(presets.dropFarms.voting.votes)

    	return (
    		<>
	            <div className="d-flex justify-content-between">
                    <div>
                        <h2 className="h2 mb-4">
                            {t('dropFarms.voting.header')}
                        </h2>
                        <div className="mb-4">
                            {t('dropFarms.voting.description')}
                        </div>
                        <h2 className="h2 mb-2">
                            {t('dropFarms.voting.activeVotes')}
                        </h2>
                        <div className="mb-4">
                            {this.getVotesAccordeons(votes.active, true)}
                        </div>
                        <h2 className="h2 mb-2">
                            {t('dropFarms.voting.pastVotes')}
                        </h2>
                        <div className="mb-2">
                            {this.getVotesAccordeons(votes.past)}
                        </div>
                    </div>
                </div>
			</>					
    	)
    }

    renderVoteTable(vote, activeVouting) {
        const t = this.props.t
        return(
            <>
                <div className="d-flex justify-content-between">
                    <div>
                        <div className="mb-0">
                            {t('dropFarms.voting.votingTill', {
                                block: valueProcessor.usCommasBigIntDecimals(vote.finalBlockNum, 0, 0), 
                                timeStr: this.countTime(this.height, vote.finalBlockNum)
                            })}
                        </div>
                        <div className="mb-4">
                            {t('dropFarms.voting.currentBlock', {block: valueProcessor.usCommasBigIntDecimals(this.height, 0, 0)})}
                        </div>
                        <div className="mb-0">
                            {vote.description}
                        </div>
                        <div className="mb-0">
                            <a href={vote.situationReadme} className='text-color4-link hover-pointer'>{t('dropFarms.voting.readMore1')}</a>
                        </div>
                        <div className="mb-0">
                            <a href={vote.voutingReadme} className='text-color4-link hover-pointer'>{t('dropFarms.voting.readMore2')}</a>
                        </div>
                        {(!activeVouting || !vote.resultsReadme) && 
                            <div className="mb-0">
                                <a href={vote.resultsReadme} className='text-color4-link hover-pointer'>{t('dropFarms.voting.readMore3')}</a>
                            </div>
                        }
                        <h2 className="h2 mb-4 mt-4">
                            {t('dropFarms.voting.proposalsTitle')}
                        </h2>
                    </div>
                </div>

		    	<div className="drop-farms-table-wrapper governance">	
                        <Table hover variant="dark" className="table-to-cards">
                            <tbody>
                                {vote.list.map(( listItem, index ) => {
                                    let farm = this.farms.find(farm => farm.farm_id === listItem.farm_id)
                                    if (!farm)
                                        return <></>
                                    let farmTitle = listItem.issue;
                                    return (
                                        <>
                                            <tr key={index} data-farm-id={listItem.farm_id} data-expanded-row={this.props.expandedRow === listItem.farm_id} className="votingCard">
                                                <td>
                                                    <div className="cell-wrapper pl-5 text-nowrap">
                                                        <div className="h5 mb-0">{farmTitle}</div>
                                                        <div className="long-value" ><a href={listItem.proposal} className="text-color4-link hover-pointer">{t('dropFarms.voting.readTheProposal')}</a></div>
                                                    </div>	
                                                </td>
                                                <td>
                                                    <div className="cell-wrapper pl-5">
                                                        <div className="text-color4">{t('dropFarms.voting.totalVotes')}</div>
                                                        <div className="long-value">{valueProcessor.usCommasBigIntDecimals((farm.total_stake !== undefined ? farm.total_stake : '---'), farm.stake_token_decimals, farm.stake_token_decimals)}</div>
                                                    </div>	
                                                </td>
                                                <td>                                                    
                                                    <div className="cell-wrapper pl-5">
                                                        <div className="text-color4">{t('dropFarms.voting.myVotes')}</div>
                                                        <div className="long-value">{valueProcessor.usCommasBigIntDecimals((farm !== null && farm.stake !== null ? farm.stake : '---'), farm.stake_token_decimals, farm.stake_token_decimals)}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="cell-wrapper pl-5 d-flex align-items-center justify-content-center text-color4 details-control unselectable-text" onClick={this.updateExpandedRow.bind(this)}>
                                                        <div className="mr-2">{t('dropFarms.details')}</div>
                                                        <span className="icon-Icon26 d-flex align-items-center chevron-down"></span>
                                                    </div>	
                                                </td>
                                            </tr>
                                            {this.props.expandedRow === listItem.farm_id &&
                                                <tr className="mb-3 farm-controls-wrapper">
                                                    <td colSpan="7" className="py-4">
                                                        <div className="dropfarms-controls-wrapper mx-0 px-0">
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

    getVotesAccordeons(votes, activeVouting) {
        let t = this.props.t
        return (
            <>
                <div className="drop-farms-table-wrapper governance">
                    <Table hover variant="dark" className="table-to-cards">
                        <tbody>
                            {!votes.length &&
                                <div className='d-flex justify-content-center'>
                                    {t("dropFarms.voting.noVotes")}
                                </div>
                            }
                            {votes.map(( vote, index ) => {
                                let tPath = `dropFarms.voting.votes.${vote.voteName}`
                                let voteTitle = t(`${tPath}.header`, {status: (vote.finalBlockNum > this.height) ? t('active') : t('inactive')})
                                vote.description = t(`${tPath}.description`)
                                return (
                                    <>
                                        <tr key={index} data-farm-id={index} data-expanded-row={this.state.expandedVote === vote.voteIndex}>
                                            <td>
                                                <div className="cell-wrapper pl-5 text-nowrap">
                                                    <div className="h5 mb-0">{voteTitle}</div>
                                                </div>	
                                            </td>
                                            <td>
                                                <div className="cell-wrapper pl-5 d-flex align-items-center justify-content-center text-color4 details-control unselectable-text" onClick={this.updateExpandedVote.bind(this, vote.voteIndex)}>
                                                    <div className="mr-2">{t('dropFarms.details')}</div>
                                                    <span className="icon-Icon26 d-flex align-items-center chevron-down"></span>
                                                </div>	
                                            </td>
                                        </tr>
                                        {this.state.expandedVote === vote.voteIndex &&
                                            <tr className="mb-3 farm-controls-wrapper">
                                                <td colSpan="7" className="py-4">
                                                    <div className="mx-0 px-0">
                                                        <div className="dropfarm-control">
                                                            <div className="border-solid-2 c-border-radius2 border-color2 p-4">
                                                                {this.renderVoteTable(vote, activeVouting)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        }
                                    </>
                                )
                            })}
                        </tbody>
                    </Table>
				</div>
			</>
        )
    }

    updateExpandedVote(voteIndex) {
        let newIndex = this.state.expandedVote === voteIndex ? undefined : voteIndex
        this.setState({expandedVote : newIndex})
    }

    render() {
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
                    <StakeModalVoting />
                </Suspense>
    		</div>
        )
    }        
};

const WVoting = connect(mapStoreToProps(components.VOTING), mapDispatchToProps(components.VOTING))(withTranslation()(Voting));

export default WVoting;    
