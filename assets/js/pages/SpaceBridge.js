import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import Card from 'react-bootstrap/Card';
// import img from '../img/unknownPage.png';
// import '../../css/unknown-page.css';
import Steps from './../elements/bridge/Steps'
import BridgeForm from './../elements/bridge/BridgeForm'
import ClaimControl from './../elements/bridge/ClaimControl'
import '../../css/bridge.css';

import ValueProcessor from '../utils/ValueProcessor';
import tokenERC20ContractProvider from './../contracts-providers/tokenERC20ContractProvider';
import spaceBridgeProvider from './../contracts-providers/spaceBridgeProvider';
import {bridgeNets, netProps, smartContracts} from'./../config';
import presets from '../../store/pageDataPresets';
import extRequests from '../requests/extRequests';
import lsdp from "../utils/localStorageDataProcessor";
import BridgeHistoryProcessor from "./../utils/BridgeHistoryProcessor";

import utils from '../utils/swapUtils';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import networkApi from "../requests/networkApi";


import TokenCardBridge from './../components/TokenCardBridge';

class SpaceBridge extends React.Component {
	constructor(props) {
        super(props);
        this.bridgeHistoryProcessor = new BridgeHistoryProcessor();
        this.valueProcessor = new ValueProcessor;
        this.state = {
            initData : undefined,
            confirmData : undefined,
            ticket : undefined,
            transfer_id : undefined,
            history : []
            // enqBalances : []
        }
        setInterval(() => {
            this.updateUserHistory();
            this.getValidatorRes();
        }, 5000)       
    }

    componentDidUpdate(prevProps) {
        if (prevProps.pubkey !== this.props.pubkey ||
            prevProps.nonNativeConnection.web3ExtensionAccountId !== this.props.nonNativeConnection.web3ExtensionAccountId ||
            prevProps.bridgeDirection !== this.props.bridgeDirection) {
            this.resetStore();
            this.setState({initData: undefined});
            this.setState({confirmData: undefined});
            this.setState({ticket: undefined});
            this.setState({transfer_id: undefined});
            this.setState({history: []});
        }
    }

    renderTokenCard() {
        if (this.props.showTokenList)
            return (
                <>
                    <TokenCardBridge
                        // changeBalance={this.changeBalance.bind(this)}
                        // getMode={this.getMode.bind(this)}
                        // recalculateSwapForNewToken={this.recalculateSwapForNewToken.bind(this)}
                        // swapPair={this.swapPair.bind(this)}
                        useSuspense={false} />
                </>
           );
    };

    resetStore() {
        this.props.updCurrentTxHash(undefined);          
        this.props.updateSrcTokenHash('');      
        this.props.updateSrcTokenAllowance(undefined);   
        this.props.updateSrcTokenBalance(undefined);     
        this.props.updateSrcTokenDecimals(undefined);    
        this.props.updateSrcTokenTicker(undefined);      
        this.props.updateSrcTokenAmountToSend(0);
        this.props.updateCurrentBridgeTx(undefined);
        this.props.updateSrcTokenObj(undefined);
    }

    async updateUserHistory() {
    	let enqExtUserId = this.props.pubkey;
    	let web3ExtUserId = this.props.nonNativeConnection.web3ExtensionAccountId;
    	let userHistory = this.bridgeHistoryProcessor.getUserHistory(enqExtUserId, web3ExtUserId);
    	let that = this;
    	if (userHistory.length > 0) {
            this.setState({history: userHistory});
    		userHistory.forEach(function(elem, index, array) {
    			if (!elem.hasOwnProperty('validatorRes')) {
    				that.postToValidator(elem.lock.transactionHash).then(function(validatorRes) {
    					if (validatorRes.hasOwnProperty('err'))
    						return
    					elem.validatorRes = validatorRes;
    					localStorage.setItem('bridge_history', JSON.stringify(array));
                        that.setState({history: array});
    				});   				
    			}
    		});
    	}
    }

    connectWC() {
    	if (this.props.nonNativeConnection.walletConnect !== undefined)
    		this.props.nonNativeConnection.walletConnect.walletConnectInit();
    }

    disconnectWC() {
    	if (this.props.nonNativeConnection.walletConnect !== undefined)
    		this.props.nonNativeConnection.walletConnect.connector.killSession({message : 'killSession by user'});
    }

    connectWeb3Ext() {
		localStorage.setItem('try_metamask_connect', true);
        this.connectMetamask();
    }

    async connectMetamask() {
        let that = this;
        let account_id = await this.props.nonNativeConnection.web3Extension.requestAuth();
        if (account_id != undefined) {
            let sessionState = await this.props.nonNativeConnection.web3Extension.getSessionState();
            localStorage.setItem('user_id', sessionState.account_id);            
            this.props.updateWeb3ExtensionAccountId(sessionState.account_id);
            this.props.updateWeb3ExtensionChain(sessionState.chain_id);
            this.props.updateWeb3ExtensionIsConnected(true);
            									//this.props.nonNativeConnection.updConnectionType('connectViaMetamask');
            this.props.nonNativeConnection.web3Extension.subscribeToEvents();
            localStorage.setItem('try_metamask_connect', true)
        } else {
            this.props.nonNativeConnection.web3Extension.disconnectApp();
            localStorage.setItem('user_id', '');
            localStorage.setItem('try_metamask_connect', false);
        }
    }    

    disconnectWeb3Ext() {
		this.props.nonNativeConnection.web3Extension.disconnectApp();
        localStorage.setItem('user_id', '');
        localStorage.setItem('try_metamask_connect', false);
    }

    getAllowance() {
    	let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
    	let ABI = smartContracts.erc20token.ABI;
    	//let token_hash = netProps['0x5'].wethAddr;
    	let token_hash = netProps['0x5'].usdcAddr;
    	let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

		let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
		let spaceBridgeContractAddress = smartContracts.spaceBridge.address;
			
		console.log(dataProvider, ABI, token_hash, assetProvider, account_id, spaceBridgeContractAddress)
		assetProvider.getAssetInfo(account_id).then(function(assetInfo) {
			console.log(assetInfo)
		});

		assetProvider.getAllowance(account_id, spaceBridgeContractAddress).then(function(allowance) {
			console.log(allowance);
		},function(err) {
			console.log(`Can\'t get allowance for asset ${token_hash}`);						
		});
    }

	approveSrcTokenBalance() {
		if (this.props.srcTokenHash && this.props.nonNativeConnection.web3ExtensionAccountId) {
			let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
	    	let ABI = smartContracts.erc20token.ABI;
	    	//let token_hash = netProps['0x5'].wethAddr;
	    	let token_hash = this.props.srcTokenHash;
	    	let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

			let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
			let spaceBridgeContractAddress = smartContracts.spaceBridge.address;

			assetProvider.approveBalance(spaceBridgeContractAddress, '100000000000000000000000000000000000000000000000000000', account_id).then(function(approveTx) {
				console.log(approveTx)
			});			
		}

	}

    async postToValidator(txHash) {
    	let src_network = undefined;

        if (this.props.bridgeDirection == 'ETH-ENQ')
            src_network = 5
        else if (this.props.bridgeDirection == 'ENQ-ETH')
            src_network = 1 //11
        else
            return


    	let URL = 'http://95.216.207.173:8080/api/v1/notify';
    	
    	return fetch(URL, {
	        method: 'POST',
	        body: JSON.stringify({networkId : src_network, txHash : txHash}),
	        headers: {'Content-Type': 'application/json','Accept': 'application/json'}
	    }).then(function(response) {  
	        return response.json()
	    }).then(res => {
	    	console.log(txHash, res);
	    	return res
	    });
    }

    handleInputTokenHashChange(item) {
    	console.log(item.target.value)
    	let that = this;
    	console.log(that)
    	if (!this.props.nonNativeConnection.web3ExtensionAccountId) {
    		console.log('No metamask user id!')
    		alert('Please, connect to your Ethereum wallet and check the current network is Goerli')
    	} else {
			let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
	    	let ABI = smartContracts.erc20token.ABI;
	    	//let token_hash = netProps['0x5'].wethAddr;
	    	let token_hash = item.target.value;
	    	let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

			let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
			let spaceBridgeContractAddress = smartContracts.spaceBridge.address;

			assetProvider.getAssetInfo(account_id).then(function(assetInfo) {
				console.log(assetInfo)
				that.props.updateSrcTokenHash(assetInfo.token);				
				that.props.updateSrcTokenBalance(assetInfo.amount);
				that.props.updateSrcTokenDecimals(assetInfo.decimals);
				that.props.updateSrcTokenTicker(assetInfo.ticker);
			}, function(assetInfo) {
				alert('Error');
			});

			assetProvider.getAllowance(account_id, spaceBridgeContractAddress).then(function(allowance) {
				console.log(allowance);
				that.props.updateSrcTokenAllowance(allowance);
			},function(err) {
				console.log(`Can\'t get allowance for asset ${token_hash}`);
				alert('Error');					
			});    		
    	}
    }

    handleInputTokenAmountChange(item) {
		console.log(item.target.value);
		if (!isNaN(item.target.value))
			this.props.updateSrcTokenAmountToSend(item.target.value);
		else {
			alert('Wrong Amount format')
		}
    }

    lockSrcToken() {
    	console.log(this.props.srcTokenHash, Number(this.props.srcTokenAmountToSend) > 0, this.props.srcTokenDecimals, this.props.nonNativeConnection.web3ExtensionAccountId)
    	if (this.props.pubkey !== undefined && this.props.srcTokenHash !== undefined && (Number(this.props.srcTokenAmountToSend) > 0) && this.props.srcTokenDecimals !== undefined && this.props.nonNativeConnection.web3ExtensionAccountId !== undefined) {
    		let that = this;
			let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
	    	let ABI = smartContracts.spaceBridge.ABI;
	    	let spaceBridgeContractAddress = smartContracts.spaceBridge.address;
	    	//let token_hash = netProps['0x5'].wethAddr;
	    	let token_hash = this.props.srcTokenHash;
	    	let bridgeProvider = new spaceBridgeProvider(dataProvider, ABI, spaceBridgeContractAddress);
	    	let src_address = this.props.nonNativeConnection.web3ExtensionAccountId;
	    	let dst_address = window.Buffer.from(that.props.pubkey);
	    	let amount = this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, Number(this.props.srcTokenDecimals)).value;
            let token_decimals = this.props.srcTokenDecimals;
            let ticker = this.props.srcTokenTicker;
			bridgeProvider.lock(src_address, '5', dst_address, '1' /*11*/, amount, token_hash, token_decimals, ticker, that.props.updateCurrentBridgeTx).then(function(lockTx) {
				console.log('lock result', lockTx);
			});
    	} else {
    		alert('Wrong input data')
    	}
    }

    getValidatorRes () {
        let that = this;
        let userHistory = this.bridgeHistoryProcessor.getUserHistory(this.props.pubkey, this.props.nonNativeConnection.web3ExtensionAccountId);
        if (this.props.bridgeDirection === 'ETH-ENQ') {
            let res = {
                init : undefined,
                confirm : undefined
            }
            if (this.props.currentBridgeTx !== undefined) {
                let item = userHistory.find(function(elem) {
                    return (elem.lock.transactionHash === that.props.currentBridgeTx)
                });
                if (item !== undefined && item.validatorRes !== undefined && item.validatorRes.encoded_data?.enq.hasOwnProperty('confirm') && item.validatorRes.encoded_data?.enq.hasOwnProperty('init')) {
                    res =  {
                        init : item.validatorRes.encoded_data.enq.init,
                        confirm : item.validatorRes.encoded_data.enq.confirm
                    }
                } 
            }        
            this.setState({initData: res.init});
            this.setState({confirmData: res.confirm});
        } else if (this.props.bridgeDirection === 'ENQ-ETH') {
            let res = {
                ticket : undefined,
                transfer_id : undefined
            }
            if (this.props.currentBridgeTx !== undefined) {
                let item = userHistory.find(function(elem) {
                    return (elem.lock.transactionHash === that.props.currentBridgeTx)
                });
                if (item !== undefined && item.validatorRes !== undefined && item.validatorRes.ticket !== undefined && item.validatorRes.transfer_id !== undefined) {
                    res =  {
                        ticket : item.validatorRes.ticket,
                        transfer_id : item.validatorRes.transfer_id
                    }
                } 
            }        
            this.setState({ticket: res.ticket});
            this.setState({transfer_id: res.transfer_id});
        }
    }

    claimInitEnecuumByParameters() {
        let pubkey = this.props.pubkey;
        let claimInitData = this.state.initData;
        if (!(pubkey && claimInitData))
            return
        extRequests.claimInitTest(pubkey,claimInitData).then(result => {
            console.log('Success', result.hash);
            let interpolateParams, txTypes = presets.pending.allowedTxTypes;
            let actionType = presets.pending.allowedTxTypes.claim_init;
            lsdp.write(result.hash, 0, actionType);
            this.props.updCurrentTxHash(result.hash);
        },
        error => {
            console.log('Error')
        });
    }

    claimConfirmEnecuumByParameters() {
        let pubkey = this.props.pubkey;
        let claimConfirmData = this.state.confirmData;
        if (!(pubkey && claimConfirmData))
            return
        extRequests.claimConfirmTest(pubkey, claimConfirmData).then(result => {
            console.log('Success', result.hash);
            let interpolateParams, txTypes = presets.pending.allowedTxTypes;
            let actionType = presets.pending.allowedTxTypes.claim_confirm;
            lsdp.write(result.hash, 0, actionType);
            this.props.updCurrentTxHash(result.hash);
        },
        error => {
            console.log('Error')
        });
    }

    claimETHByParameters() {
        console.log('claimETHByParameters');
        if (this.props.pubkey !== undefined && this.props.srcTokenObj.hash !== undefined && (Number(this.props.srcTokenAmountToSend) > 0) && this.props.srcTokenObj.decimals !== undefined && this.props.nonNativeConnection.web3ExtensionAccountId !== undefined) {
            let that = this;
            let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
            let ABI = smartContracts.spaceBridge.ABI;
            let spaceBridgeContractAddress = smartContracts.spaceBridge.address;
            let bridgeProvider = new spaceBridgeProvider(dataProvider, ABI, spaceBridgeContractAddress);
            let userHistory = this.bridgeHistoryProcessor.getUserHistory(this.props.pubkey, this.props.nonNativeConnection.web3ExtensionAccountId);
            let currentTxObj = userHistory.find(function(elem) {
                if (elem.lock.transactionHash === that.props.currentBridgeTx)
                    return true
            });
            
            if (currentTxObj !== undefined && currentTxObj.hasOwnProperty('validatorRes') && currentTxObj.validatorRes?.ticket !== undefined) {
                bridgeProvider.send_claim_init(currentTxObj.validatorRes, [], this.props.nonNativeConnection.web3ExtensionAccountId).then(function(claimTx) {
                    console.log('claim result', claimTx);
                });
            }
        } else {
            alert('Wrong input data')
        }
    } 

    async setGoerli() {
        let requestData = {
            method: 'wallet_switchEthereumChain',
            params: [
                {
                    chainId: '0x5'
                },
            ],
        }
        try {
                await ethereum.request(requestData);
            } catch (error) {
              console.log(error)
        }
    }

    async encodeDataAndLock() {
        let URL =  'http://95.216.207.173:8080/api/v1/encode_lock';
        let token_decimals = Number(this.props.srcTokenObj.decimals);
        let amount = this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, token_decimals).value;
        let data = {
            "src_network": 1, //11
            "dst_address": this.props.nonNativeConnection.web3ExtensionAccountId,
            "dst_network": 5,
            "amount": amount,
            "src_hash": this.props.srcTokenObj.hash,
            "src_address": this.props.pubkey
        }

        let lockInfo = {...data, ...{token_decimals : token_decimals, ticker : this.props.srcTokenTicker}};
           
        return fetch(URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json','Accept': 'application/json'}
        }).then(function(response) {  
            return response.json()
        }).then(res => {
            console.log(res.encoded_data);
            this.enqLock(res.encoded_data, lockInfo)            
            return res
        });
    }

    enqLock(packedDataFromEncodeLock, lockInfo) {
        let that = this;
        let pubkey = lockInfo.src_address;
        let dst_address = lockInfo.dst_address;
        let packedData = packedDataFromEncodeLock;
        if (!(pubkey && packedData))
            return
        extRequests.enqLock(pubkey, packedData).then(result => {
            console.log('Success', result.hash);
            that.props.updCurrentTxHash(result.hash);
            that.props.updateCurrentBridgeTx(result.hash);
            let interpolateParams, txTypes = presets.pending.allowedTxTypes;
            let actionType = presets.pending.allowedTxTypes.enq_lock;
            lsdp.write(result.hash, 0, actionType);


            let accountInteractToBridgeItem = {
                    initiator : `${pubkey}_${dst_address}`,
                    lock       : {
                                    transactionHash : result.hash,
                                    src_address : pubkey,
                                    src_network : lockInfo.src_network,
                                    dst_address, 
                                    dst_network : lockInfo.dst_network,
                                    token_amount : lockInfo.amount,
                                    token_hash : lockInfo.src_hash,
                                    token_decimals : lockInfo.token_decimals,
                                    ticker : lockInfo.ticker
                                }                    
                };

            let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
            if (bridgeHistoryArray.length > 0) {
                let itemIsExist = bridgeHistoryArray.find(function(elem) {
                    if (elem.initiator === `${pubkey}_${dst_address}` && elem.lock?.transactionHash === result.hash)
                        return true
                });

                if (itemIsExist !== undefined)
                    return
                else
                    that.bridgeHistoryProcessor.addBridgeHistoryItem(accountInteractToBridgeItem);
            } else {
                that.bridgeHistoryProcessor.initiateHistoryStorage(accountInteractToBridgeItem);
            }



        },
        error => {
            console.log('Error')
            //this.props.changeWaitingStateType('rejected');
        });
    }

    toggleBridgeDirection() {
        if (this.props.bridgeDirection === 'ENQ-ETH')
            this.props.updateBridgeDirection('ETH-ENQ');
        else if (this.props.bridgeDirection === 'ETH-ENQ')
            this.props.updateBridgeDirection('ENQ-ETH');
        else
            console.log('toggleBridgeDirection: something went wrong!')
    }

    toggleShowTokensList() {
        this.props.updateShowTokenList(!this.props.showTokenList)
    }

    getBridgeTxAmountStr(bridgeTxInfo) {
        let res = '---';
        if (bridgeTxInfo.lock?.token_amount !== undefined &&
            bridgeTxInfo.lock?.token_decimals !== undefined) {
            res = valueProcessor.usCommasBigIntDecimals(bridgeTxInfo.lock.token_amount, Number(bridgeTxInfo.lock.token_decimals), Number(bridgeTxInfo.lock.token_decimals));
            if (bridgeTxInfo.lock?.ticker !== undefined) {
                res = `${res} (${bridgeTxInfo.lock.ticker})`
            }
        }

        return res       
    }

    getBridgeTxDirectionStr(bridgeTxInfo) {
        let res = '';
        let srcNetwork = '???';
        let dstNetwork = '???';

        if (bridgeTxInfo.lock?.src_network !== undefined) {
            let srcId = Number(bridgeTxInfo.lock.src_network);
            let srcNetworkObj = bridgeNets.find(elem => elem.id === srcId);
            if (srcNetworkObj !== undefined && srcNetworkObj.name !== undefined)
                srcNetwork = srcNetworkObj.name;
        }

        if (bridgeTxInfo.lock?.dst_network !== undefined) {
            let dstId = Number(bridgeTxInfo.lock.dst_network);
            let dstNetworkObj = bridgeNets.find(elem => elem.id === dstId);
            if (dstNetworkObj !== undefined && dstNetworkObj.name !== undefined)
                dstNetwork = dstNetworkObj.name;
        }

        res = `From ${srcNetwork} to ${dstNetwork}`;
        
        return res
    }

        
    render () {
        let that = this;
  //   	let enqExtUserId = this.props.pubkey;
  //   	let web3ExtUserId = this.props.nonNativeConnection.web3ExtensionAccountId;

		// console.log(this.bridgeHistoryProcessor.getUserHistory(enqExtUserId, web3ExtUserId));

        return (
            <div id="bridgeWrapper" className='d-flex flex-column justify-content-center align-items-center'>
            { this.renderTokenCard()  }
{/*            	<div className="mb-3 d-none">
            		<div className="mb-5">
		            	<button onClick={this.connectWC.bind(this)}className="mr-1">CONNECT WALLET CONNECT</button>
		            	<button onClick={this.disconnectWC.bind(this)} className="mr-3">DISCONNECT WALLET CONNECT</button>
		            	<button onClick={this.connectWeb3Ext.bind(this)}className="mr-1">CONNECT WEB3 EXTENSION</button>
		            	<button onClick={this.disconnectWeb3Ext.bind(this)}>DISCONNECT WEB3 EXTENSION</button>
	            	</div>
	            	<div className="mb-5">
		            	<button onClick={this.getAllowance.bind(this)} className="mr-3">getAllowance</button>
	            		<button onClick={this.approve1Token.bind(this)}>Approve 0.1 Token</button>
	            	</div>
	            	<div className="mb-5">
		            	<button onClick={this.lock001Token.bind(this)} className="mr-3">LOCK 0.1 Token Ethereum</button>
	            		<button onClick={this.postToValidator.bind(this)}>send POST to Validator</button>
	            	</div>

	            	<div className="mb-5">
		            	<button onClick={this.claimInitEnecuumTest.bind(this)} className="mr-3">Claim init Enecuum</button>
	            		<button onClick={this.claimConfirmTest.bind(this)}>Claim confirm Enecuum</button>
	            	</div>


                    <div className="mb-5">
                        <button onClick={this.toggleShowTokensList.bind(this)} className="mr-3">get ENQ Balance</button>
                        { this.renderTokenCard()  }
                    </div>




            	</div>*/}
            	

{/*            	{(this.props.pubkey === '') &&
	            	<div className="row w-100 mb-5">
		    			<div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>    			
							<Card className="swap-card">
							  <Card.Body className="p-0">
							    <div className="p-4 bottom-line-1">
							    	<div className="d-flex align-items-center justify-content-between nowrap">
							    		<div>
							    			<div className="h4 text-nowrap">Space Bridge - demo_1</div>
							    			<div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
							    		</div>							    								    		
							    	</div>
							    </div>
							    <Card.Text as="div" className="p-4">
							    	<div>
							    		Please, connect to your Enecuum extension
							    	</div>
							    </Card.Text>
							  </Card.Body>
							</Card>    			
		    			</div>
		    		</div>
            	}*/}


                {this.props.bridgeDirection === 'ETH-ENQ' &&
	            <div className="row w-100 mb-5">
	    			<div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>    			
						<Card className="swap-card">
						  <Card.Body className="p-0">
						    <div className="p-4 bottom-line-1">
						    	<div className="d-flex align-items-center justify-content-between nowrap">
                                    <div>
                                        <div className="h4 text-nowrap">Space Bridge</div>
                                        <div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
                                    </div>
                                    {!this.props.nonNativeConnection.web3ExtensionAccountId &&
                                        <div>                                        
                                            <button
                                                className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3"
                                                onClick={this.connectWeb3Ext.bind(this)}>Connect Ethereum Wallet</button>
                                        </div>
                                    }                                    
                                </div>
						    </div>
						    <Card.Text as="div" className="p-4">
						    	<div>
							    	<div className="h5">Source</div>
							    	<div className="h6 d-flex">
                                        <div>
                                            <span className="text-nowrap">
                                                Source Network:
                                            </span>
                                            {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension.provider.chainId !== '0x5' &&
                                                <button
                                                    className="d-block btn btn-info mt-2 p-1 w-100"
                                                    style={{'lineHeight': '18px'}}
                                                    onClick={this.setGoerli.bind(this)}>Set Network</button>
                                            }    
                                        </div>
                                        {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId !== '0x5' &&
                                            <span className="font-weight-bold ml-3" style={{'color' : '#ecd07b', 'fontSize' : '18px'}}>
                                                <div>Goerli required!</div>
                                                <div>Check settings of your Ethereum wallet!</div>
                                            </span>
                                        }
                                        {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId == '0x5' &&
                                            <div className="ml-2" style={{'color' : '#ecd07b'}}>Goerli</div>
                                        }    
                                        
                                    </div>
							    	<div className="mt-3">
							    		<div className="mb-2 d-flex justify-content-start text-color4">Source token hash</div>
			                            <Form.Group className="mb-0" controlId="inputSrcTokenHash">        
			                                <Form.Control
			                                	type="text"
			                                	placeholder="Address"
			                                	autoComplete="off"
												value={this.props.srcTokenHash}
												onChange={this.handleInputTokenHashChange.bind(this)}
                                                disabled={this.props.nonNativeConnection.web3ExtensionAccountId === undefined}/>       
			                            </Form.Group>
                                        <div className="mt-3">
                                            <span>Ticker: {(this.props.srcTokenTicker !== undefined) ? this.props.srcTokenTicker : '---'}</span>
                                        </div>
			                            <div className="mt-1">
			                            	<span>Balance: {(this.props.srcTokenBalance !== undefined) && (this.props.srcTokenDecimals !== undefined) ? this.props.srcTokenBalance / Math.pow(10, this.props.srcTokenDecimals) : '---'}</span>
			                            </div>
			                            <div className="mt-1 d-flex align-items-center justify-content-between">
			                            	<span>Approved balance: {(this.props.srcTokenAllowance !== undefined) && (this.props.srcTokenDecimals !== undefined) ? this.props.srcTokenAllowance / Math.pow(10, this.props.srcTokenDecimals) : '---'}</span>
			                            	{this.props.nonNativeConnection.web3ExtensionAccountId && this.props.srcTokenHash &&
				                            	<button
				                            		className="d-block btn btn-info mb-2 p-1"
				                            		onClick={this.approveSrcTokenBalance.bind(this)}
                                                    disabled={this.props.pubkey === undefined || this.props.nonNativeConnection.web3ExtensionAccountId === undefined}>Approve</button>
			                            	}	
			                            </div>
							    	</div>
							    	<div className="mt-3">
							    		<div className="mb-2 d-flex justify-content-start text-color4">Amount to send</div>
			                            <Form.Group className="mb-0" controlId="inputSrcTokenHash">
			                            	<Form.Control
			                                	type="text"
			                                	placeholder="Amount"
			                                	autoComplete="off"
												value={this.props.srcTokenAmountToSend}
												onChange={this.handleInputTokenAmountChange.bind(this)} 
                                                disabled={this.props.pubkey === undefined || this.props.nonNativeConnection.web3ExtensionAccountId === undefined}/>        
			                                {/*<Form.Control type="text" placeholder="0"  value="0"/>     */}  
			                            </Form.Group>
							    	</div>

						    	</div>

								<div
                                    id="exch"
                                    className="d-flex justify-content-center align-items-center mx-auto mt-3"
                                    onClick={this.toggleBridgeDirection.bind(this)}>
                                    <span className="icon-Icon13 exch-button hover-pointer"></span>
                                </div>

						    	<div>
						    		<div className="h5">Destination</div>
						    		<div className="h6">Destination Network: <span className="text-bolder" style={{'color' : '#ecd07b'}}>Enecuum</span></div>
						    		<div className="h6">Destination Address: <span className="text-bolder" style={{'color' : '#ecd07b'}}>{utils.packAddressString(this.props.pubkey)}</span></div>
						    	</div>
						    	<button
						    		className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3 mt-4"
						    		onClick={this.lockSrcToken.bind(this)}
                                    disabled={this.props.pubkey === undefined || this.props.nonNativeConnection.web3ExtensionAccountId === undefined || this.props.nonNativeConnection.web3Extension?.provider?.chainId !== '0x5'}>
                                    Send Lock</button>
                                {(this.props.currentBridgeTx !== undefined) &&    
                                    <div className="mt-4">Current bridge Tx: {this.props.currentBridgeTx}</div>
                                }
                                {(this.state.initData !== undefined) &&
                                    <>    
                                        <div className="mt-4">Claim Init Data: <span className="text-color4">{this.state.initData}</span></div>
                                        <button
                                            className="d-block btn btn-info mb-2 p-2 mt-2"
                                            onClick={this.claimInitEnecuumByParameters.bind(this)}>Claim Init</button>
                                    </>
                                }
                                {(this.state.confirmData !== undefined) &&
                                    <>    
                                        <div className="mt-4">Claim Confirm Data: <span className="text-color4">{this.state.confirmData}</span></div>
                                        <button
                                            className="d-block btn btn-info mb-2 p-2 mt-2"
                                            onClick={this.claimConfirmEnecuumByParameters.bind(this)}>Claim Confirm</button>
                                    </>
                                }
						    </Card.Text>
						  </Card.Body>
						</Card>    			
	    			</div>
	    		</div>
                }

                {this.props.bridgeDirection === 'ENQ-ETH' &&
                <div className="row w-100 mb-5">
                    <div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>                
                        <Card className="swap-card">
                          <Card.Body className="p-0">
                            <div className="p-4 bottom-line-1">
                                <div className="d-flex align-items-center justify-content-between nowrap">
                                    <div>
                                        <div className="h4 text-nowrap">Space Bridge</div>
                                        <div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
                                    </div>
                                    {!this.props.nonNativeConnection.web3ExtensionAccountId &&
                                        <div>                                        
                                            <button
                                                className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3"
                                                onClick={this.connectWeb3Ext.bind(this)}>Connect Ethereum Wallet</button>
                                        </div>
                                    }                                    
                                </div>
                            </div>
                            <Card.Text as="div" className="p-4">
                                <div>
                                    <div className="h5">Source</div>
                                    <div className="h6 d-flex">
                                        <div>
                                            <span className="text-nowrap">
                                                Source Network: {this.props.net.name}
                                            </span>
{/*                                            {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension.provider.chainId !== '0x5' &&
                                                <button
                                                    className="d-block btn btn-info mt-2 p-1 w-100"
                                                    style={{'lineHeight': '18px'}}
                                                    onClick={this.setGoerli.bind(this)}>Set Network</button>
                                            }   */} 
                                        </div>
{/*                                        {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId !== '0x5' &&
                                            <span className="font-weight-bold ml-3" style={{'color' : '#ecd07b', 'fontSize' : '18px'}}>
                                                <div>Goerli required!</div>
                                                <div>Check settings of your Ethereum wallet!</div>
                                            </span>
                                        }
                                        {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId == '0x5' &&
                                            <div className="ml-2" style={{'color' : '#ecd07b'}}>Goerli</div>
                                        } */}   
                                        
                                    </div>
                                    <div className="mt-3">
                                        <div className="mb-2 d-flex align-items-center justify-content-start text-color4">
                                            <div className="mr-3">Source token</div>
                                            <button
                                                    className="d-block btn btn-info p-1"
                                                    onClick={this.toggleShowTokensList.bind(this)}
                                                    disabled={this.props.pubkey === undefined || this.props.nonNativeConnection.web3ExtensionAccountId === undefined}>Choose token</button>
                                        </div>
                                        {/*<Form.Group className="mb-0" controlId="inputSrcTokenHash">        
                                            <Form.Control
                                                type="text"
                                                placeholder="Address"
                                                autoComplete="off"
                                                value={this.props.srcTokenHash}
                                                onChange={this.handleInputTokenHashChange.bind(this)}
                                                disabled={this.props.nonNativeConnection.web3ExtensionAccountId === undefined}/>       
                                        </Form.Group>*/}
                                        <div className="mt-3">
                                            <span>Ticker: {(this.props.srcTokenObj?.ticker !== undefined) ? this.props.srcTokenObj.ticker : '---'}</span>
                                        </div>
                                        <div className="mt-1">
                                            <span>Balance: {(this.props.srcTokenBalance !== undefined) && (this.props.srcTokenObj?.decimals !== undefined) ? this.props.srcTokenBalance / Math.pow(10, this.props.srcTokenObj.decimals) : '---'}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="mb-2 d-flex justify-content-start text-color4">Amount to send</div>
                                        <Form.Group className="mb-0" controlId="inputSrcTokenHash">
                                            <Form.Control
                                                type="text"
                                                placeholder="Amount"
                                                autoComplete="off"
                                                value={this.props.srcTokenAmountToSend}
                                                onChange={this.handleInputTokenAmountChange.bind(this)} 
                                                disabled={this.props.pubkey === undefined || this.props.nonNativeConnection.web3ExtensionAccountId === undefined}/>        
                                            {/*<Form.Control type="text" placeholder="0"  value="0"/>     */}  
                                        </Form.Group>
                                    </div>

                                </div>

                                <div
                                    id="exch"
                                    className="d-flex justify-content-center align-items-center mx-auto mt-3"
                                    onClick={this.toggleBridgeDirection.bind(this)}>
                                    <span className="icon-Icon13 exch-button hover-pointer"></span>
                                </div>

                                <div>
                                    <div className="h5">Destination</div>
                                    <div className="d-flex align-items-center mb-2">
                                        <div>
                                            <div className="h6 mb-0">Destination Network:</div>                                            
                                                {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension.provider.chainId !== '0x5' &&                                            
                                                    <div className="mt-2">
                                                        <button
                                                            className="d-block btn btn-info p-1 w-100"
                                                            style={{'lineHeight': '18px'}}
                                                            onClick={this.setGoerli.bind(this)}>Set Network</button>
                                                    </div>    
                                                }                                            
                                        </div>
                                        <div className="">
                                            {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId !== '0x5' &&
                                                <span className="font-weight-bold pl-3" style={{'color' : '#ecd07b', 'fontSize' : '18px'}}>
                                                    <div>Goerli required!</div>
                                                    <div>Check settings of your Ethereum wallet!</div>
                                                </span>
                                            }
                                            {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId == '0x5' &&
                                                <div style={{'color' : '#ecd07b'}} className="pl-2">Goerli</div>
                                            }
                                            {this.props.nonNativeConnection.web3ExtensionAccountId == undefined &&
                                                <div style={{'color' : '#ecd07b'}} className="pl-2">---</div>
                                            } 
                                        </div>
                                        
                                    </div>
                                    <div className="h6 d-flex align-items-center">
                                        <div className="mr-2">Destination Address:</div>
                                        <div style={{'color' : '#ecd07b'}}>{utils.packAddressString(this.props.nonNativeConnection.web3ExtensionAccountId)}</div> 
                                    </div>
                                </div>
                                <button
                                    className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3 mt-4"
                                    onClick={this.encodeDataAndLock.bind(this)}
                                    disabled={this.props.pubkey === undefined || this.props.nonNativeConnection.web3ExtensionAccountId === undefined || this.props.nonNativeConnection.web3Extension?.provider?.chainId !== '0x5'}>
                                    Send Lock</button>
                                {(this.props.currentBridgeTx !== undefined) &&    
                                    <div className="mt-4">Current bridge Tx: {this.props.currentBridgeTx}</div>
                                }
                                {(this.state.transfer_id !== undefined) &&
                                    <>    
                                        <div className="mt-4">Transfer ID: <span className="text-color4">{this.state.transfer_id}</span></div>
                                        <button
                                            className="d-block btn btn-info mb-2 p-2 mt-2"
                                            onClick={this.claimETHByParameters.bind(this)}>Claim</button>
                                    </>
                                }
{/*                                {(this.state.confirmData !== undefined) &&
                                    <>    
                                        <div className="mt-4">Claim Confirm Data: <span className="text-color4">{this.state.confirmData}</span></div>
                                        <button
                                            className="d-block btn btn-info mb-2 p-2 mt-2"
                                            onClick={this.claimConfirmEnecuumByParameters.bind(this)}>Claim Confirm</button>
                                    </>
                                }*/}
                            </Card.Text>
                          </Card.Body>
                        </Card>                
                    </div>
                </div>
                }



{/*                <div className="row w-100 mb-5">
                    <div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>                
                        <Card className="swap-card">
                          <Card.Body className="p-0">
                            <div className="p-4 bottom-line-1">
                                <div className="d-flex align-items-center justify-content-between nowrap">
                                    <div>
                                        <div className="h4 text-nowrap">Space Bridge</div>
                                        <div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
                                    </div>
                                    {!this.props.nonNativeConnection.web3ExtensionAccountId &&
                                        <div>                                        
                                            <button
                                                className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3"
                                                onClick={this.connectWeb3Ext.bind(this)}>Bridge</button>
                                        </div>
                                    }                                    
                                </div>
                            </div>
                            <Card.Text as="div" className="p-4">
                                <div>
                                    <div className="h5">History</div>
                                </div>

                                {this.state.history.map((item, index) => (
                                    <div className="d-flex justify-content-between">
                                        <div className="mr-3">
                                            <div>{item.lock?.transactionHash}</div>
                                            <div>
                                                {that.getBridgeTxDirectionStr(that, item)}
                                            </div>
                                            <div className="text-color4">
                                                <span className="mr-3">Amount:</span>
                                                <span>{that.getBridgeTxAmountStr(that, item)}</span>                                                
                                            </div>
                                            
                                        </div>
                                        <div>
                                            <button></button>
                                        </div>                                        
                                    </div>
                                ))}


                            </Card.Text>
                          </Card.Body>
                        </Card>                
                    </div>
                </div>*/}




{/*	            <div className="row w-100 mb-5 d-none">
	    			<div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>    			
						<Card className="swap-card">
						  <Card.Body className="p-0">
						    <div className="p-4 bottom-line-1">
						    	<div className="d-flex align-items-center justify-content-between nowrap">
						    		<div>
						    			<div className="h4 text-nowrap">Space Bridge - demo_1</div>
						    			<div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
						    		</div>
						    		<div>
							    		<button className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3">History</button>
							    		<button className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3">0xd16f....568b</button>
						    		</div>						    		
						    	</div>
						    </div>
						    <Card.Text as="div" className="p-4">
						    	<div>
									<Steps useSuspense={false}/>
							    </div>

							    <div>
							    	<BridgeForm useSuspense={false}/>
							    </div>
						    </Card.Text>
						  </Card.Body>
						</Card>    			
	    			</div>
	    		</div>*/}
	    		


{/*	    		<div className="row w-100 d-none">
	    			<div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>    			
						<Card className="swap-card">
						  <Card.Body className="p-0">
						    <div className="p-4 bottom-line-1">
						    	<div className="d-flex align-items-center justify-content-between nowrap">
						    		<div>
						    			<div className="h4 text-nowrap">Space Bridge - demo_2</div>
						    			<div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
						    		</div>
						    		<div>
							    		<button className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3">History</button>
							    		<button className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3">0xd16f....568b</button>
						    		</div>						    		
						    	</div>
						    </div>
						    <Card.Text as="div" className="py-4 px-0">						    	
						    	<div className="px-4">
									<Steps useSuspense={false}/>
							    </div>

							    <div>
							    	<ClaimControl useSuspense={false}/>
							    </div>
						    </Card.Text>
						  </Card.Body>
						</Card>    			
	    			</div>
	    		</div>*/}
            </div>
        );
    };
};

const WSpaceBridge = connect(mapStoreToProps(components.SPACE_BRIDGE), mapDispatchToProps(components.SPACE_BRIDGE))(withTranslation()(SpaceBridge));

export default WSpaceBridge;   