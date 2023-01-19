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
import web3LibProvider from './../web3-provider/Web3LibProvider';
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
            this.props.updateShowHistory(false);
        }
    }

    renderTokenCard() {
        if (this.props.showTokenList)
            return (
                <>
                    <TokenCardBridge
                        useSuspense={false} />
                </>
           );
    };

    resetStore() {
        this.props.updCurrentTxHash(undefined);          
        this.props.updateSrcTokenHash('');      
        this.resetTokenInfo(this);      
        this.props.updateSrcTokenAmountToSend(0);
        this.props.updateCurrentBridgeTx(undefined);
        this.props.updateSrcTokenObj(undefined);
    }

    resetTokenInfo(context) {
        context.props.updateSrcTokenAllowance(undefined);   
        context.props.updateSrcTokenBalance(undefined);     
        context.props.updateSrcTokenDecimals(undefined);    
        context.props.updateSrcTokenTicker(undefined);
    }

    async updateUserHistory() {
    	let enqExtUserId = this.props.pubkey;
    	let web3ExtUserId = this.props.nonNativeConnection.web3ExtensionAccountId;
    	let userHistory = this.bridgeHistoryProcessor.getUserHistory(enqExtUserId, web3ExtUserId);
    	let that = this;
    	if (userHistory.length > 0) {
            this.setState({history: userHistory});
    		userHistory.forEach(function(elem, index, array) {
                if (!elem.lock.hasOwnProperty('status')) {
                    if (elem.lock?.src_network === '5'  && that.props.nonNativeConnection.web3Extension?.provider) {
                        let dataProvider = that.props.nonNativeConnection.web3Extension.provider;
                        let web3Provider = new web3LibProvider(dataProvider);
                        web3Provider.getTxReceipt(elem.lock.transactionHash, 'Lock').then(function(res) {
                            if (res !== null && res.status !== undefined) {
                                elem.lock.status = res.status;
                                localStorage.setItem('bridge_history', JSON.stringify(array));
                                that.setState({history: array});
                            }
                        });                        
                    }
                    if (elem.lock?.src_network === 1) {
                        let net = bridgeNets.find(net => net.id === elem.lock.src_network);
                        let url = net !== undefined ? net.url : undefined;
                        if (url !== undefined) {
                            networkApi.getTx(url, elem.lock.transactionHash).then(function(res) {                                
                                if (res !== null && !res.lock) {
                                    res.json().then(function(tx) {                                        
                                        if (tx.status !== undefined) {
                                            elem.lock.status = tx.status === 3 ? true : false;
                                            localStorage.setItem('bridge_history', JSON.stringify(array));
                                            that.setState({history: array});
                                        }
                                    }, function(err) {
                                        console.log('Can\'t get status for transaction', elem.lock.transactionHash);
                                    });
                                }
                            });                        
                        }
                    }
                } else if (elem.lock.status === true) {
                    if (elem.lock?.src_network === 1) {
                        if (elem.claimTxHash !== undefined && !elem.hasOwnProperty('claimTxStatus') && that.props.nonNativeConnection.web3Extension?.provider) {
                            let dataProvider = that.props.nonNativeConnection.web3Extension.provider;
                            let web3Provider = new web3LibProvider(dataProvider);
                            web3Provider.getTxReceipt(elem.claimTxHash, 'Claim').then(function(res) {
                                if (res.status !== undefined) {
                                    elem.claimTxStatus = res.status;
                                    localStorage.setItem('bridge_history', JSON.stringify(array));
                                    that.setState({history: array});
                                }
                            });
                        }
                    }
                    if (elem.claimInitTxHash !== undefined && elem.claimInitTxStatus === undefined) {
                        if (elem.lock?.dst_network === '1') {
                            let net = bridgeNets.find(net => net.id === Number(elem.lock.dst_network));
                            let url = net !== undefined ? net.url : undefined;
                            if (url !== undefined) {
                                networkApi.getTx(url, elem.claimInitTxHash).then(function(res) {
                                    if (res !== null && !res.lock) {                                        
                                        res.json().then(tx => {
                                            if (tx.status !== undefined) {
                                                elem.claimInitTxStatus = tx.status === 3 ? true : false;
                                                localStorage.setItem('bridge_history', JSON.stringify(array));
                                                that.setState({history: array});
                                            }
                                        });
                                    }
                                });                        
                            }
                        }
                    }
                    if (elem.claimConfirmTxHash !== undefined && elem.claimConfirmTxStatus === undefined) {
                        if (elem.lock?.dst_network === '1') {
                            let net = bridgeNets.find(net => net.id === Number(elem.lock.dst_network));
                            let url = net !== undefined ? net.url : undefined;
                            if (url !== undefined) {
                                networkApi.getTx(url, elem.claimConfirmTxHash).then(function(res) {
                                    if (res !== null && !res.lock) {
                                        res.json().then(tx => {
                                            if (tx.status !== undefined) {
                                                elem.claimConfirmTxStatus = tx.status === 3 ? true : false;
                                                localStorage.setItem('bridge_history', JSON.stringify(array));
                                                that.setState({history: array});
                                            }
                                        });
                                    }
                                });                        
                            }
                        }
                    }
                }
                
    			if (!elem.hasOwnProperty('validatorRes') || elem.validatorRes.transfer_id == undefined) {
    				that.postToValidator(elem.lock.transactionHash, elem.lock.src_network).then(function(validatorRes) {
    					if (validatorRes.hasOwnProperty('err'))
    						return
    					elem.validatorRes = validatorRes;
    					localStorage.setItem('bridge_history', JSON.stringify(array));
                        that.setState({history: array});
    				}, function(err) {
                        console.log(err);
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
			
		assetProvider.getAssetInfo(account_id).then(function(assetInfo) {
			//console.log(assetInfo)
		});

		assetProvider.getAllowance(account_id, spaceBridgeContractAddress).then(function(allowance) {
			//console.log(allowance);
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
				//console.log(approveTx)
			});			
		}
	}

    async postToValidator(txHash, srcNetwork = undefined) {
    	let src_network = undefined;

        if (srcNetwork !== undefined) {
            if (this.props.bridgeDirection == 'ETH-ENQ')
                src_network = 5;
            else if (this.props.bridgeDirection == 'ENQ-ETH')
                src_network = 1; //11
            else
                return
        } else
            src_network = Number(srcNetwork);


    	let URL = 'https://bridge.enex.space/api/v1/notify';
    	
    	return fetch(URL, {
	        method: 'POST',
	        body: JSON.stringify({networkId : src_network, txHash : txHash}),
	        headers: {'Content-Type': 'application/json','Accept': 'application/json'},
            mode: 'cors'
	    }).then(function(response) {            
	        return response.json().then(res => {
                console.log(txHash, res);
                return res
            }, err => {
                console.log(err)
                return {}
            })
	    }, function(err) {
            return {}
            console.log(errr)
        })
    }

    handleInputTokenHashChange(item) {
    	let that = this;
    	if (!this.props.nonNativeConnection.web3ExtensionAccountId) {
    		console.log('No metamask user id!')
    		alert('Please, connect to your Ethereum wallet and check the current network is Goerli')
    	} else {
			let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
	    	let ABI = smartContracts.erc20token.ABI;
	    	//let token_hash = netProps['0x5'].wethAddr;
	    	let token_hash = item.target.value;
            this.props.updateSrcTokenHash(token_hash);
	    	let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

			let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
			let spaceBridgeContractAddress = smartContracts.spaceBridge.address;

			assetProvider.getAssetInfo(account_id).then(function(assetInfo) {
				that.props.updateSrcTokenBalance(assetInfo.amount);
				that.props.updateSrcTokenDecimals(assetInfo.decimals);
				that.props.updateSrcTokenTicker(assetInfo.ticker);
			}, function(assetInfo) {
                console.log(`Can\'t get info for asset ${token_hash}`);                
                that.resetTokenInfo(that);      
                that.props.updateSrcTokenAmountToSend(0);
			});

			assetProvider.getAllowance(account_id, spaceBridgeContractAddress).then(function(allowance) {
				that.props.updateSrcTokenAllowance(allowance);
			},function(err) {
				console.log(`Can\'t get allowance for asset ${token_hash}`);                
				that.resetTokenInfo(that);      
                that.props.updateSrcTokenAmountToSend(0);					
			});    		
    	}
    }

    handleInputTokenAmountChange(item) {
		if (!isNaN(item.target.value))
			this.props.updateSrcTokenAmountToSend(item.target.value);
		else {
			alert('Wrong Amount format')
		}
    }

    lockSrcToken() {    	
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
        let that = this;
        let claimInitData = this.state.initData;
        if (!(pubkey && claimInitData))
            return
        extRequests.claimInitTest(pubkey,claimInitData).then(result => {
            console.log('Success', result.hash);

            let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
            let updatedHistory = bridgeHistoryArray.map(elem => {
                if (elem.initiator.includes(pubkey) && elem.initiator.includes(that.props.nonNativeConnection.web3ExtensionAccountId) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === that.props.currentBridgeTx) {
                    elem.claimInitTxHash = result.hash;
                }
                return elem
            });

            localStorage.setItem('bridge_history', JSON.stringify(updatedHistory));


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
        let that = this;
        let claimConfirmData = this.state.confirmData;
        if (!(pubkey && claimConfirmData))
            return
        extRequests.claimConfirmTest(pubkey, claimConfirmData).then(result => {
            console.log('Success', result.hash);

            let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
            let updatedHistory = bridgeHistoryArray.map(elem => {
                if (elem.initiator.includes(pubkey) && elem.initiator.includes(that.props.nonNativeConnection.web3ExtensionAccountId) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === that.props.currentBridgeTx) {
                    elem.claimConfirmTxHash = result.hash;
                }
                return elem
            });

            localStorage.setItem('bridge_history', JSON.stringify(updatedHistory));

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
                bridgeProvider.send_claim_init(currentTxObj.validatorRes, [], this.props.nonNativeConnection.web3ExtensionAccountId, currentTxObj.lock.transactionHash).then(function(claimTx) {
                    console.log('claim result', claimTx);
                });
            }
        } else {
            alert('Wrong input data')
        }
    }

    claimEnqEthBridge(bridgeItem) {
        if (this.props.pubkey !== undefined && this.props.nonNativeConnection.web3ExtensionAccountId !== undefined) {
            let that = this;
            let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
            let ABI = smartContracts.spaceBridge.ABI;
            let spaceBridgeContractAddress = smartContracts.spaceBridge.address;
            let bridgeProvider = new spaceBridgeProvider(dataProvider, ABI, spaceBridgeContractAddress);
            
            if (bridgeItem !== undefined && bridgeItem.hasOwnProperty('validatorRes') && bridgeItem.validatorRes?.ticket !== undefined) {
                bridgeProvider.send_claim_init(bridgeItem.validatorRes, [], this.props.nonNativeConnection.web3ExtensionAccountId, bridgeItem.lock.transactionHash).then(function(claimTx) {
                    console.log('claim result', claimTx);
                });
            }
        }
    }

    claimInitEthEnqBridge(bridgeItem, stateId) {
        if (this.props.pubkey !== undefined && this.props.nonNativeConnection.web3ExtensionAccountId !== undefined) {
            let that = this;
            let pubkey = this.props.pubkey;
            let claimInitData = bridgeItem.validatorRes.encoded_data.enq.init;
            if (!(pubkey && claimInitData))
                return
            extRequests.claimInitTest(pubkey,claimInitData).then(result => {
                console.log('Success', result.hash);
                let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
                let updatedHistory = bridgeHistoryArray.map(elem => {
                    if (elem.initiator.includes(pubkey) && elem.initiator.includes(that.props.nonNativeConnection.web3ExtensionAccountId) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === bridgeItem.lock.transactionHash) {
                        elem.claimInitTxHash = result.hash;
                    }
                    return elem
                });

                localStorage.setItem('bridge_history', JSON.stringify(updatedHistory));

                let interpolateParams, txTypes = presets.pending.allowedTxTypes;
                let actionType = presets.pending.allowedTxTypes.claim_init;
                lsdp.write(result.hash, 0, actionType);
                this.props.updCurrentTxHash(result.hash);
            },
            error => {
                console.log('Error')
            });
        } 
    } 

    claimConfirmEthEnqBridge(bridgeItem, stateId) {
        if (this.props.pubkey !== undefined && this.props.nonNativeConnection.web3ExtensionAccountId !== undefined) {
            let that = this;
            let pubkey = this.props.pubkey;
            let claimConfirmData = bridgeItem.validatorRes.encoded_data.enq.confirm;
            if (!(pubkey && claimConfirmData))
                return
            extRequests.claimConfirmTest(pubkey, claimConfirmData).then(result => {
                console.log('Success', result.hash);

                let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
                let updatedHistory = bridgeHistoryArray.map(elem => {
                    if (elem.initiator.includes(pubkey) && elem.initiator.includes(that.props.nonNativeConnection.web3ExtensionAccountId) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === bridgeItem.lock.transactionHash) {
                        elem.claimConfirmTxHash = result.hash;
                    }
                    return elem
                });

                localStorage.setItem('bridge_history', JSON.stringify(updatedHistory));

                let interpolateParams, txTypes = presets.pending.allowedTxTypes;
                let actionType = presets.pending.allowedTxTypes.claim_confirm;
                lsdp.write(result.hash, 0, actionType);
                this.props.updCurrentTxHash(result.hash);
            },
            error => {
                console.log('Error')
            });
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
        let URL =  'https://bridge.enex.space/api/v1/encode_lock';
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

        let lockInfo = {...data, ...{token_decimals : token_decimals, ticker : this.props.srcTokenObj.ticker}};
           
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
                    lock      : {
                                    transactionHash : result.hash,
                                    src_address : pubkey,
                                    src_network : lockInfo.src_network,
                                    dst_address : dst_address, 
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
            res = this.valueProcessor.usCommasBigIntDecimals(bridgeTxInfo.lock.token_amount, Number(bridgeTxInfo.lock.token_decimals), Number(bridgeTxInfo.lock.token_decimals));
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

    getControl(item) {
        let res = 'Waiting...'
        if (item.lock.status !== undefined && item.lock.status === true) {
            res = 'Locked successfully. Waiting for validation...';
            if (item.lock.src_network === '5') {
                if (item.validatorRes !== undefined && item.validatorRes?.encoded_data?.enq !== undefined)
                    res = this.getClaimEthEnqButton(item);
            } else if (item.lock.src_network === 1) {
                if (item.validatorRes !== undefined && item.validatorRes?.ticket !== undefined && item.claimTxHash === undefined)
                    res = this.getClaimEnqEthBridgeButton(item);
                else if (item.validatorRes !== undefined && item.validatorRes?.ticket !== undefined && item.claimTxHash !== undefined && item.claimTxStatus == undefined)
                    res = 'Waiting for claim confirmation...';
                else if (item.validatorRes !== undefined && item.validatorRes?.ticket !== undefined && item.claimTxHash !== undefined && item.claimTxStatus !== undefined)
                    res = this.getButtonLinkToEtherscan(item);
            }
        } else if (item.lock.status !== undefined && item.lock.status !== true) 
            res = 'Failed on lock stage';
        return res    
    }

    getClaimEthEnqButton(item) {
        let resume = 'Validated successfully';
        let stateId = 0;

        if (item.claimConfirmTxStatus === true) {
            resume = 'Done';
            stateId = 1;
        } else if (item.claimConfirmTxStatus === false) {
            resume = 'Claim confirmation failed';
            stateId = 2;         
        } else if (item.claimConfirmTxHash !== undefined) {
            resume = 'Claim confirmation initialized';
            stateId = 3;
        } else if (item.claimInitTxStatus === true) {
            resume = 'Claim is ready';
            stateId = 4; 
        } else if (item.claimInitTxStatus === false) {
            resume = 'Claim inititalization failed';
            stateId = 5;
        } else if (item.claimInitTxHash !== undefined) {
            resume = 'Claim initialized';
            stateId = 6;
        }

        return (
                <>
                    <div className="mb-2">{resume}</div>
                    {stateId === 0 &&
                    <Button
                        className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                        onClick={this.claimInitEthEnqBridge.bind(this, item, stateId)}>
                        Claim</Button>
                    }    
                    {stateId === 4 &&
                        <Button
                        className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                        onClick={this.claimConfirmEthEnqBridge.bind(this, item, stateId)}>
                        Confirm</Button>
                    }
                    {stateId === 1 &&
                    <a
                        href={`https://bit.enecuum.com/#!/tx/${item.claimConfirmTxHash}`} 
                        className="d-block w-100 btn btn-info px-4"
                        target="_blank">
                        Info</a>
                    }        
                </>
           );  
    }


    getClaimEnqEthBridgeButton(item) {
        return (
                <>
                    <div className="mb-2">Validated successfully</div>
                    <Button
                        className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                        onClick={this.claimEnqEthBridge.bind(this, item)}>
                        Claim</Button>
                </>
           );        
    }

    getButtonLinkToEtherscan(item) {
        let resume = 'Claim';
        if (item.claimTxStatus === true)
            resume = 'Done';
        else if (item.claimTxStatus === false)
            resume = 'Failed';

        return (
                <>
                    <div className="mb-2">{resume}</div>
                    <a
                        href={`https://goerli.etherscan.io/tx/${item.claimTxHash}`} 
                        className="d-block w-100 btn btn-info px-4"
                        target="_blank">
                        Info</a>
                </>
           );        
    }

    toggleHistoryBridge() {
        this.props.updateShowHistory(!this.props.showHistory);
    }
        
    render () {
        const t = this.props.t;
        let that = this;
        let enqExtUserId = this.props.pubkey;
        let web3ExtUserId = this.props.nonNativeConnection.web3ExtensionAccountId;
        let history = this.state.history;
        let currentBridgeTxItem = undefined;
        if (this.props.currentBridgeTx !== undefined) {
            currentBridgeTxItem = history.find(elem => (elem.lock.transactionHash !== undefined && elem.lock.transactionHash == this.props.currentBridgeTx));
        }

        return (
            <>
            {!this.props.connectionStatus &&
                <>
                    <div className="row">            
                        <div className='swap-card-wrapper px-2 pt-0 mt-0'>
                            <Card className="swap-card c-card-1 pt-4 card">
                                <Card.Body>
                                    <div className="mb-3 h5">{t('noConnection')}</div>
                                    <div className="mb-3 h6">{t('clickConnect')}</div>
                                </Card.Body>
                            </Card> 
                        </div>
                    </div>   
                </>
            }
            {this.props.connectionStatus &&
            <>    
            <div id="bridgeWrapper" className='d-flex flex-column justify-content-center align-items-center'>
            { this.renderTokenCard()  }
            {this.props.bridgeDirection === 'ETH-ENQ' && this.props.showHistory === false &&
	            <div className="row w-100 mb-5">
	    			<div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>    			
						<Card className="swap-card">
						  <Card.Body className="p-0">
                            <div className="p-4 bottom-line-1">                                
                                <div>
                                    <div className="d-flex align-items-center justify-content-between w-100 mb-2">
                                        <div className="h4 text-nowrap nowrap mb-0">Space Bridge</div>
                                        {this.props.nonNativeConnection.web3ExtensionAccountId && this.state.history.length > 0 &&                                                                                    
                                            <button
                                                className="d-block btn btn-secondary mt-2 px-4 button-bg-3"
                                                onClick={this.toggleHistoryBridge.bind(this)}>History</button>                                            
                                        }
                                    </div>
                                    <div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
                                </div>
                            </div>
						    <Card.Text as="div" className="p-4">
						    	<div>
							    	<div className="h5">From</div>
							    	<div className="h6 d-flex">
                                        <div>
                                            <span className="text-nowrap">
                                                Network:
                                                {this.props.nonNativeConnection.web3ExtensionAccountId == undefined &&
                                                    <span className="ml-2" style={{'color' : '#ecd07b'}}>Ethereum</span>
                                                }                                                    
                                            </span>
                                            {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension.provider.chainId !== '0x5' &&
                                                <button
                                                    className="d-block btn btn-info mt-2 p-1 w-100"
                                                    style={{'lineHeight': '18px'}}
                                                    onClick={this.setGoerli.bind(this)}>Set Network</button>
                                            }    
                                        </div>
                                        {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId !== '0x5' &&
                                            <span className="font-weight-bold pl-2" style={{'color' : '#ecd07b', 'fontSize' : '18px'}}>
                                                <div>Goerli required!</div>
                                                <div>Check settings of your Ethereum wallet!</div>
                                            </span>
                                        }
                                        {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId == '0x5' &&
                                            <div className="ml-2" style={{'color' : '#ecd07b'}}>Goerli</div>
                                        }    
                                        
                                    </div>
							    	<div className="mt-3">
							    		<div className="mb-2 d-flex justify-content-start text-color4">Token</div>
			                            <Form.Group className="mb-0" controlId="inputSrcTokenHash">        
			                                <Form.Control
			                                	type="text"
			                                	placeholder="Address"
			                                	autoComplete="off"
												value={this.props.srcTokenHash}
												onChange={this.handleInputTokenHashChange.bind(this)}
                                                disabled={this.props.nonNativeConnection.web3ExtensionAccountId === undefined}/>       
			                            </Form.Group>
                                        { this.props.srcTokenHash !== undefined &&
                                          this.props.srcTokenTicker !== undefined &&
                                          this.props.srcTokenBalance !== undefined &&
                                          this.props.srcTokenDecimals !== undefined &&
                                          this.props.srcTokenAllowance !== undefined &&
                                          this.props.nonNativeConnection.web3ExtensionAccountId !== undefined &&
                                          this.props.pubkey !== undefined &&
                                            <>    
                                                <div className="mt-3">
                                                    <span>Ticker: {this.props.srcTokenTicker}</span>
                                                </div>
        			                            <div className="mt-1">
        			                            	<span>Balance: {this.props.srcTokenBalance / Math.pow(10, this.props.srcTokenDecimals)}</span>
        			                            </div>
        			                            <div className="mt-1 d-flex align-items-center justify-content-between">
        			                            	<span>Approved balance: {this.props.srcTokenAllowance / Math.pow(10, this.props.srcTokenDecimals)}</span>        			                            	
    				                            	<button
    				                            		className="d-block btn btn-info mb-2 p-1"
    				                            		onClick={this.approveSrcTokenBalance.bind(this)}>Approve</button>
        			                            		
        			                            </div>
                                            </>
                                        }
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
                                                disabled={!(this.props.srcTokenHash !== undefined &&
                                                            this.props.srcTokenTicker !== undefined &&
                                                            this.props.srcTokenBalance !== undefined &&
                                                            this.props.srcTokenDecimals !== undefined &&
                                                            this.props.srcTokenAllowance !== undefined &&
                                                            this.props.nonNativeConnection.web3ExtensionAccountId !== undefined &&
                                                            this.props.pubkey !== undefined)}/> 
			                            </Form.Group>
							    	</div>

                                    {!this.props.nonNativeConnection.web3ExtensionAccountId &&
                                        <div className="my-3">                                        
                                            <button
                                                className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3"
                                                onClick={this.connectWeb3Ext.bind(this)}>Connect Ethereum Wallet</button>
                                        </div>
                                    }
						    	</div>

								<div
                                    id="exch"
                                    className="d-flex justify-content-center align-items-center mx-auto mt-3"
                                    onClick={this.toggleBridgeDirection.bind(this)}>
                                    <span className="icon-Icon13 exch-button hover-pointer"></span>
                                </div>

						    	<div>
						    		<div className="h5">To</div>
						    		<div className="h6">Network:<span className="text-bolder ml-2 text-uppercase" style={{'color' : '#ecd07b'}}>{this.props.net.name}</span></div>
						    		<div className="h6">Address:<span className="text-bolder ml-2" style={{'color' : '#ecd07b'}}>{utils.packAddressString(this.props.pubkey)}</span></div>
						    	</div>                                
                                {this.props.nonNativeConnection.web3ExtensionAccountId &&
                                    <>
                                        {currentBridgeTxItem === undefined &&
                                            <button
                                                className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3 mt-4"
                                                onClick={this.lockSrcToken.bind(this)}
                                                disabled={this.props.pubkey === undefined || this.props.nonNativeConnection.web3ExtensionAccountId === undefined || this.props.nonNativeConnection.web3Extension?.provider?.chainId !== '0x5'}>
                                                Confirm</button>
                                        }    
                                        {currentBridgeTxItem !== undefined &&
                                            <div className="text-center">{this.getControl(currentBridgeTxItem)}</div>
                                        }
                                    </>
                                }                                    
						    </Card.Text>
						  </Card.Body>
						</Card>    			
	    			</div>
	    		</div>
                }

                {this.props.bridgeDirection === 'ENQ-ETH' && this.props.showHistory === false &&
                <div className="row w-100 mb-5">
                    <div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>                
                        <Card className="swap-card">
                          <Card.Body className="p-0">
                            <div className="p-4 bottom-line-1">                                
                                <div>
                                    <div className="d-flex align-items-center justify-content-between w-100 mb-2">
                                        <div className="h4 text-nowrap nowrap mb-0">Space Bridge</div>
                                        {this.props.nonNativeConnection.web3ExtensionAccountId && this.state.history.length > 0 &&
                                            <button
                                                className="d-block btn btn-secondary mt-2 px-4 button-bg-3"
                                                onClick={this.toggleHistoryBridge.bind(this)}>History</button>                                            
                                        }
                                    </div>
                                    <div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
                                </div>
                            </div>
                            <Card.Text as="div" className="p-4">
                                <div>
                                    <div className="h5">From</div>
                                    <div className="h6 d-flex">
                                        <div>
                                            <span className="text-nowrap">
                                                Network:
                                                <span className="ml-2 text-uppercase" style={{'color' : '#ecd07b'}}>{this.props.net.name}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="mb-2 d-flex align-items-center justify-content-start text-color4">
                                            <div className="mr-3">Token</div>
                                            <button
                                                    className="d-block btn btn-info p-1"
                                                    onClick={this.toggleShowTokensList.bind(this)}
                                                    disabled={this.props.pubkey === undefined || this.props.nonNativeConnection.web3ExtensionAccountId === undefined}>Choose token</button>
                                        </div>
                                        {
                                            this.props.srcTokenObj?.ticker !== undefined &&
                                            this.props.srcTokenBalance !== undefined &&
                                            this.props.srcTokenObj?.decimals !== undefined &&
                                            this.props.pubkey !== undefined &&
                                            this.props.nonNativeConnection.web3ExtensionAccountId !== undefined &&
                                            <>
                                                <div className="mt-3">
                                                    <span>Ticker: {this.props.srcTokenObj.ticker}</span>
                                                </div>
                                                <div className="mt-1">
                                                    <span>Balance: {this.props.srcTokenBalance / Math.pow(10, this.props.srcTokenObj.decimals)}</span>
                                                </div>
                                            </>
                                        }    
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
                                                disabled={!(this.props.srcTokenObj?.ticker !== undefined &&
                                                            this.props.srcTokenBalance !== undefined &&
                                                            this.props.srcTokenObj?.decimals !== undefined &&
                                                            this.props.pubkey !== undefined &&
                                                            this.props.nonNativeConnection.web3ExtensionAccountId !== undefined)}/>
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
                                    <div className="h5">To</div>
                                    <div className="d-flex align-items-center mb-2">
                                        <div>
                                            <div className="h6 mb-0">Network:</div>                                            
                                                {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension.provider.chainId !== '0x5' &&                                            
                                                    <div className="mt-2">
                                                        <button
                                                            className="d-block btn btn-info p-1 w-100"
                                                            style={{'lineHeight': '18px'}}
                                                            onClick={this.setGoerli.bind(this)}>Set Network</button>
                                                    </div>    
                                                }                                            
                                        </div>
                                        <div className="pl-2">
                                            {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId !== '0x5' &&
                                                <span className="font-weight-bold" style={{'color' : '#ecd07b', 'fontSize' : '18px'}}>
                                                    <div>Goerli required!</div>
                                                    <div>Check settings of your Ethereum wallet!</div>
                                                </span>
                                            }
                                            {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined && this.props.nonNativeConnection.web3Extension?.provider?.chainId == '0x5' &&
                                                <div style={{'color' : '#ecd07b'}} >Goerli</div>
                                            }
                                            {this.props.nonNativeConnection.web3ExtensionAccountId == undefined &&
                                                <div style={{'color' : '#ecd07b'}} >Ethereum</div>
                                            } 
                                        </div>
                                        
                                    </div>
                                    {this.props.nonNativeConnection.web3ExtensionAccountId !== undefined &&
                                        <div className="h6 d-flex align-items-center">
                                            <div className="mr-2">Address:</div>
                                            <div style={{'color' : '#ecd07b'}}>{utils.packAddressString(this.props.nonNativeConnection.web3ExtensionAccountId)}</div> 
                                        </div>
                                    }
                                </div>
                                {!this.props.nonNativeConnection.web3ExtensionAccountId &&
                                    <div className="my-3">                                        
                                        <button
                                            className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3"
                                            onClick={this.connectWeb3Ext.bind(this)}>Connect Ethereum Wallet</button>
                                    </div>
                                }
                                {this.props.nonNativeConnection.web3ExtensionAccountId &&
                                    <>
                                        {currentBridgeTxItem == undefined &&
                                            <button
                                                className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3 mt-4"
                                                onClick={this.encodeDataAndLock.bind(this)}
                                                disabled={this.props.pubkey === undefined || this.props.nonNativeConnection.web3ExtensionAccountId === undefined || this.props.nonNativeConnection.web3Extension?.provider?.chainId !== '0x5'}>
                                                Confirm</button>
                                        }    

                                        {currentBridgeTxItem !== undefined &&
                                            <div>{this.getControl(currentBridgeTxItem)}</div>
                                        }
                                    </>
                                }                                    
                            </Card.Text>
                          </Card.Body>
                        </Card>                
                    </div>
                </div>
                }


{/*HISTORY!!!*/}

            {this.props.showHistory === true &&                
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
                                    <div className="ml-4">                                        
                                        <button
                                            className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3"
                                            onClick={this.toggleHistoryBridge.bind(this)}>Bridge</button>
                                    </div>                                                                       
                                </div>
                            </div>
                            <Card.Text as="div" className="p-y">
                                <div className="mb-3 px-4 pt-2">
                                    <div className="h5 mt-3">History</div>
                                </div>
                                {!this.props.nonNativeConnection.web3ExtensionAccountId &&
                                    <div className="my-3 px-5 pb-4">                                        
                                        <button
                                            className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3"
                                            onClick={this.connectWeb3Ext.bind(this)}>Connect Ethereum Wallet</button>
                                    </div>
                                }
                                {this.props.nonNativeConnection.web3ExtensionAccountId &&
                                    <>
                                        {this.state.history.map((item, index) => (
                                            <div className="d-flex justify-content-between bottom-line-1 pb-3 mb-3 px-4">
                                                <div className="mr-3">
                                                   {/* <div>{item.lock?.transactionHash}</div>*/}
                                                    <div>
                                                        {that.getBridgeTxDirectionStr(item)}
                                                    </div>
                                                    <div className="text-color4">
                                                        <span className="mr-2">Amount:</span>
                                                        <span>{that.getBridgeTxAmountStr(item)}</span>                                                
                                                    </div>                                            
                                                </div>
                                                <div className="bridge-history-resume-wrapper">
                                                    {that.getControl(item)}
                                                </div>                                        
                                            </div>
                                        ))}
                                    </>
                                }
                            </Card.Text>
                          </Card.Body>
                        </Card>                
                    </div>
                </div>
            }




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
            </>
            }
        </>    
        );
    };
};

const WSpaceBridge = connect(mapStoreToProps(components.SPACE_BRIDGE), mapDispatchToProps(components.SPACE_BRIDGE))(withTranslation()(SpaceBridge));

export default WSpaceBridge;   