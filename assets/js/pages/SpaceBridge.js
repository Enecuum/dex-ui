import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import Card from 'react-bootstrap/Card';

import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import presets from '../../store/pageDataPresets';

import Steps from './../elements/bridge/Steps';
import BridgeForm from './../elements/bridge/BridgeForm';
import ClaimControl from './../elements/bridge/ClaimControl';
import ChainsDropdown from './../elements/bridge/ChainsDropdown';

import TokenCardBridge from './../components/TokenCardBridge';

import '../../css/bridge.css';

import tokenERC20ContractProvider from './../contracts-providers/tokenERC20ContractProvider';
import spaceBridgeProvider from './../contracts-providers/spaceBridgeProvider';
import web3LibProvider from './../web3-provider/Web3LibProvider';

import ValueProcessor from '../utils/ValueProcessor';
import lsdp from "../utils/localStorageDataProcessor";
import BridgeHistoryProcessor from "./../utils/BridgeHistoryProcessor";
import utils from '../utils/swapUtils';
import AvailableNetworksUtils from '../utils/AvailableNetworksUtils';

import extRequests from '../requests/extRequests';
import networkApi from "../requests/networkApi";

import {availableNetworks, smartContracts} from'./../config';

import metamaskLogo from './../../img/metamask-logo.webp';

class SpaceBridge extends React.Component {
	constructor(props) {
        super(props);
        this.bridgeHistoryProcessor = new BridgeHistoryProcessor();
        this.valueProcessor = new ValueProcessor;
        this.availableNetworksUtils = new AvailableNetworksUtils();
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
        if (prevProps.pubkey !== this.props.pubkey  ||
            prevProps.net.url !== this.props.net.url ||
            prevProps.nonNativeConnection.web3ExtensionAccountId !== this.props.nonNativeConnection.web3ExtensionAccountId  ||
            prevProps.nonNativeConnection.web3ExtensionChain  !== this.props.nonNativeConnection.web3ExtensionChain ||
            prevProps.bridgeDirection !== this.props.bridgeDirection ||
            prevProps.fromBlockchain?.id !== this.props.fromBlockchain?.id) {

            if (this.props.currentBridgeTx === undefined) {
                this.resetStore();
                this.setState({initData: undefined});
                this.setState({confirmData: undefined});
                this.setState({ticket: undefined});
                this.setState({transfer_id: undefined});
                this.setState({history: []});
                this.props.updateShowHistory(false);

                if (prevProps.nonNativeConnection.web3ExtensionChain !== this.props.nonNativeConnection.web3ExtensionChain &&
                    this.props.nonNativeConnection.web3ExtensionChain !== undefined) {
                    let chainId = this.props.nonNativeConnection.web3ExtensionChain;
                    let availableItemInConfig = availableNetworks.find(elem => elem.web3ExtensionChainId == chainId);
                    if (availableItemInConfig == undefined) {
                        if (this.props.fromBlockchain !== undefined && this.props.fromBlockchain.type == 'eth') {
                            this.props.updateFromBlockchain(undefined);                      
                        }
                    } else if (availableItemInConfig !== undefined && this.props.fromBlockchain !== undefined && this.props.fromBlockchain.type == 'eth') {
                        this.props.updateFromBlockchain(availableItemInConfig)
                    }
                }

                if (prevProps.net.url !== this.props.net.url &&
                    this.props.net.url !== undefined) {
                    let chainId = this.props.net.url;
                    let availableItemInConfig = availableNetworks.find(elem => elem.enqExtensionChainId == chainId);
                    if (availableItemInConfig == undefined) {
                        if (this.props.fromBlockchain !== undefined && this.props.fromBlockchain.type == 'enq') {
                            this.props.updateFromBlockchain(undefined);                      
                        }
                    } else if (availableItemInConfig !== undefined && this.props.fromBlockchain !== undefined && this.props.fromBlockchain.type == 'enq') {
                        this.props.updateFromBlockchain(availableItemInConfig)
                    }
                }
            }            
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
        //console.log(userHistory)
    	let that = this;
    	if (userHistory.length > 0) {
            this.setState({history: userHistory});
    		userHistory.forEach(function(elem, index, array) {
                let srcNetworkType = that.availableNetworksUtils.getChainById(elem.lock?.src_network).type;
                let dstNetworkType = that.availableNetworksUtils.getChainById(elem.lock?.dst_network).type;                

                if (!elem.lock.hasOwnProperty('status')) {
                    if (srcNetworkType === 'eth'  && that.props.nonNativeConnection.web3Extension?.provider) {
                        let dataProvider = that.props.nonNativeConnection.web3Extension.provider;
                        let web3Provider = new web3LibProvider(dataProvider);
                        web3Provider.getTxReceipt(elem.lock.transactionHash, 'Lock').then(function(res) {
                            if (res !== null && res.status !== undefined) {
                                elem.lock.status = res.status;
                                localStorage.setItem('bridge_history', JSON.stringify(array));
                                that.setState({history: array});
                            }
                        }, function(err) {
                            console.log('Can\'t get receipt for lock transaction', elem.lock.transactionHash, err);
                        });                        
                    }
                    if (srcNetworkType === 'enq') {
                        let net = that.availableNetworksUtils.getChainById(elem.lock.src_network);                        
                        let url = net !== undefined ? net.explorerURL : undefined;
                        if (url !== undefined) {
                            networkApi.getTx(url, elem.lock.transactionHash).then(function(res) {                              
                                if (res !== null && !res.lock) {
                                    console.log(res)
                                    res.json().then(function(tx) {                                        
                                        if (tx.status !== undefined) {
                                            elem.lock.status = tx.status === 3 ? true : false;
                                            localStorage.setItem('bridge_history', JSON.stringify(array));
                                            that.setState({history: array});
                                        } else {
                                            console.log('Undefuned lock transaction status', elem.lock.transactionHash);
                                        }
                                    }, function(err) {
                                        console.log('Can\'t get status for lock transaction', elem.lock.transactionHash, err);
                                    });
                                }
                            }, function(err) {
                                console.log('Can\'t get data for lock transaction', elem.lock.transactionHash, err);
                            });                        
                        }
                    }
                } else if (elem.lock.status === true) {
                    if (dstNetworkType === 'eth') {
                        if (elem.claimTxHash !== undefined && !elem.hasOwnProperty('claimTxStatus') && that.props.nonNativeConnection.web3Extension?.provider) {
                            let dataProvider = that.props.nonNativeConnection.web3Extension.provider;
                            let web3Provider = new web3LibProvider(dataProvider);
                            web3Provider.getTxReceipt(elem.claimTxHash, 'Claim').then(function(res) {
                                if (res !== null && res.status !== undefined) {
                                    elem.claimTxStatus = res.status;
                                    localStorage.setItem('bridge_history', JSON.stringify(array));
                                    that.setState({history: array});
                                } else {
                                    console.log('Undefuned claim transaction status', elem.lock.transactionHash);
                                }
                            }, function(err) {
                                console.log('Can\'t get receipt for claim transaction', elem.claimTxHash, err);
                            });
                        }
                    }
                    if (elem.claimInitTxHash !== undefined && elem.claimInitTxStatus === undefined) {
                        if (dstNetworkType === 'enq') {
                            let net = that.availableNetworksUtils.getChainById(Number(elem.lock.dst_network));                            
                            let url = net !== undefined ? net.explorerURL : undefined;
                            if (url !== undefined) {
                                networkApi.getTx(url, elem.claimInitTxHash).then(function(res) {
                                    if (res !== null && !res.lock) {                                        
                                        res.json().then(tx => {
                                            if (tx.status !== undefined) {
                                                elem.claimInitTxStatus = tx.status === 3 ? true : false;
                                                localStorage.setItem('bridge_history', JSON.stringify(array));
                                                that.setState({history: array});
                                            }
                                        }, function(err) {
                                            console.log('Can\'t get status for Claim Init transaction', elem.claimInitTxHash, err);
                                        });
                                    }
                                }, function(err) {
                                    console.log('Can\'t get data for Claim init transaction', elem.claimInitTxHash, err);
                                });                        
                            }
                        }
                    }
                    if (elem.claimConfirmTxHash !== undefined && elem.claimConfirmTxStatus === undefined) {
                        if (dstNetworkType === 'enq') {
                            let net = that.availableNetworksUtils.getChainById(Number(elem.lock.dst_network));                            
                            let url = net !== undefined ? net.explorerURL : undefined;
                            if (url !== undefined) {
                                networkApi.getTx(url, elem.claimConfirmTxHash).then(function(res) {
                                    if (res !== null && !res.lock) {
                                        res.json().then(tx => {
                                            if (tx.status !== undefined) {
                                                elem.claimConfirmTxStatus = tx.status === 3 ? true : false;
                                                localStorage.setItem('bridge_history', JSON.stringify(array));
                                                that.setState({history: array});
                                            } else {
                                                console.log('Undefuned claim confirm transaction status', elem.lock.transactionHash);
                                            }
                                        }, function(err) {
                                            console.log('Can\'t get status for claim confirm transaction', elem.claimConfirmTxHash);
                                        });
                                    }
                                }, function(err) {
                                    console.log('Can\'t get data for Claim Confirm transaction', elem.claimConfirmTxHash);
                                });                        
                            }
                        }
                    }
                }
                
    			if (!elem.hasOwnProperty('validatorRes') || elem.validatorRes.transfer_id == undefined) {
                    that.postToValidator(elem.lock.transactionHash, elem.lock.src_network).then(function(validatorRes) {
    					if (validatorRes === null || validatorRes.hasOwnProperty('err')) {
                            console.log('Validator_notify response is null for lock transaction', elem.lock.transactionHash)
    						return
                        }
    					elem.validatorRes = validatorRes;
    					localStorage.setItem('bridge_history', JSON.stringify(array));
                        that.setState({history: array});
    				}, function(err) {
                        console.log('Can\'t get notify response ', err);
                    });                    				
    			}
    		});
    	}
    }

    clearHistory() {
        localStorage.removeItem('bridge_history');
        this.setState({history: []});
        this.toggleHistoryBridge();
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
        if (this.props.fromBlockchain !== undefined && this.props.fromBlockchain.type === 'eth') {
        	let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
        	let ABI = smartContracts.erc20token.ABI;
        	let token_hash = this.props.srcTokenHash;
        	let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

    		let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
    		let spaceBridgeContractAddress = this.props.fromBlockchain.bridgeContractAddress;
    			
    		assetProvider.getAssetInfo(account_id).then(function(assetInfo) {
    			//console.log(assetInfo)
    		});

    		assetProvider.getAllowance(account_id, spaceBridgeContractAddress).then(function(allowance) {
    			//console.log(allowance);
    		},function(err) {
    			console.log(`Can\'t get allowance for asset ${token_hash}`);						
    		});
        }
    }

	approveSrcTokenBalance() {
		if (this.props.srcTokenHash && this.props.nonNativeConnection.web3ExtensionAccountId) {
			let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
	    	let ABI = smartContracts.erc20token.ABI;
	    	let token_hash = this.props.srcTokenHash;
	    	let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

			let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
			let spaceBridgeContractAddress = this.props.fromBlockchain.bridgeContractAddress;
            let that = this;
			assetProvider.approveBalance(spaceBridgeContractAddress, '100000000000000000000000000000000000000000000000000000', account_id).then(function(approveTx) {
                if (approveTx.status === true &&
                    approveTx.events?.Approval?.returnValues?.owner !== undefined && 
                    approveTx.events?.Approval?.returnValues?.owner.toLowerCase() == that.props.nonNativeConnection.web3ExtensionAccountId.toLowerCase() &&
                    approveTx.events?.Approval?.returnValues?.spender !== undefined && 
                    approveTx.events?.Approval?.returnValues?.spender.toLowerCase() == that.props.fromBlockchain?.bridgeContractAddress.toLowerCase() &&
                    approveTx.events?.Approval?.address !== undefined && 
                    approveTx.events?.Approval?.address.toLowerCase() == that.props.srcTokenHash.toLowerCase()) {
                        that.props.updateSrcTokenAllowance(approveTx.events?.Approval?.returnValues?.value);
                }
			});			
		}
	}

    async postToValidator(txHash, srcNetwork = undefined) {
    	let URL = 'https://bridge.enex.space/api/v1/notify';    	
    	return fetch(URL, {
	        method: 'POST',
	        body: JSON.stringify({networkId : srcNetwork, txHash : txHash}),
	        headers: {'Content-Type': 'application/json','Accept': 'application/json'},
            mode: 'cors'
	    }).then(function(response) {            
	        return response.json().then(res => {
                console.log(txHash, res);
                return res
            }, err => {
                console.log('Parse notify response failed');
                return null
            })
	    }, function(err) {
            console.log('Get notify response failed');
            return null            
        })    
    }

    handleInputTokenHashChange(item) {
    	let that = this;
    	if (!this.props.nonNativeConnection.web3ExtensionAccountId) {
    		console.log('No metamask user id!')
    		alert('Please, connect to your Ethereum wallet and check the current network is Available')
    	} else {
            if (this.props.fromBlockchain !== undefined && this.props.fromBlockchain.type === 'eth') {
    			let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
    	    	let ABI = smartContracts.erc20token.ABI;
    	    	let token_hash = item.target.value;
                this.props.updateSrcTokenHash(token_hash);
    	    	let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

    			let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
    			let spaceBridgeContractAddress = this.props.fromBlockchain.bridgeContractAddress;

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
    }

    handleInputTokenAmountChange(item) {
		if (!isNaN(item.target.value))
			this.props.updateSrcTokenAmountToSend(item.target.value);
		else {
			alert('Wrong Amount format')
		}
    }

    lockEth() {    	
    	if (this.props.pubkey !== undefined &&
            this.props.srcTokenHash !== undefined &&
            (Number(this.props.srcTokenAmountToSend) > 0) &&
            this.props.srcTokenDecimals !== undefined &&
            this.props.nonNativeConnection.web3ExtensionAccountId !== undefined &&
            this.props.fromBlockchain !== undefined &&
            this.props.fromBlockchain.type === 'eth' &&
            this.props.toBlockchain !== undefined) {

                let chain = this.props.toBlockchain;
                let address = undefined;
                if (chain !== undefined) {
                    if (chain.type === 'enq')
                        address = this.props.pubkey;
                    else if (chain.type === 'eth')
                        address = this.props.nonNativeConnection.web3ExtensionAccountId;
                }

        		let that = this;
    			let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
    	    	let ABI = this.props.fromBlockchain.bridgeContractABI;
    	    	let spaceBridgeContractAddress = this.props.fromBlockchain.bridgeContractAddress;
    	    	let token_hash = this.props.srcTokenHash;
    	    	let bridgeProvider = new spaceBridgeProvider(dataProvider, ABI, spaceBridgeContractAddress);
    	    	let src_address = this.props.nonNativeConnection.web3ExtensionAccountId;
    	    	let dst_address = address;
    	    	let amount = this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, Number(this.props.srcTokenDecimals)).value;
                let token_decimals = this.props.srcTokenDecimals;
                let ticker = this.props.srcTokenTicker;
    			bridgeProvider.lock(src_address, this.props.fromBlockchain.id, dst_address, this.props.toBlockchain.id /*11*/, amount, token_hash, token_decimals, ticker, that.props.updateCurrentBridgeTx).then(function(lockTx) {
    				console.log('lock result', lockTx);
    			});
        	} else {
        		alert('Wrong input data')
        	}
    }

    getValidatorRes () {
        let that = this;
        let userHistory = this.bridgeHistoryProcessor.getUserHistory(this.props.pubkey, this.props.nonNativeConnection.web3ExtensionAccountId);

        if (this.props.currentBridgeTx !== undefined) {
            let item = userHistory.find(function(elem) {
                return (elem.lock.transactionHash === that.props.currentBridgeTx)
            });

            let dstNetwork = this.availableNetworksUtils.getChainById(item.lock.dst_network);
            if (dstNetwork !== undefined) {
                if (dstNetwork.type === 'enq') {
                    let res = {
                        init : undefined,
                        confirm : undefined
                    }
                    if (item !== undefined && item.validatorRes !== undefined &&
                        item.validatorRes.encoded_data?.enq.hasOwnProperty('confirm') && item.validatorRes.encoded_data?.enq.hasOwnProperty('init')) {
                        res =  {
                            init : item.validatorRes.encoded_data.enq.init,
                            confirm : item.validatorRes.encoded_data.enq.confirm
                        }
                    }
                    this.setState({initData: res.init});
                    this.setState({confirmData: res.confirm});
                } else if (dstNetwork.type === 'eth') {
                    let res = {
                        ticket : undefined,
                        transfer_id : undefined
                    }

                    if (item !== undefined && item.validatorRes !== undefined &&
                        item.validatorRes.ticket !== undefined && item.validatorRes.transfer_id !== undefined) {
                        res =  {
                            ticket : item.validatorRes.ticket,
                            transfer_id : item.validatorRes.transfer_id
                        }
                    }
                    this.setState({ticket: res.ticket});
                    this.setState({transfer_id: res.transfer_id});
                }
            }
        }
    }

    claimEth(bridgeItem) {
        let dstChain = this.availableNetworksUtils.getChainById(bridgeItem.lock.dst_network);

        if (this.props.pubkey !== undefined &&
            this.props.nonNativeConnection.web3ExtensionAccountId !== undefined &&
            dstChain !== undefined) {            
            let that = this;
            let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
            let ABI = dstChain.bridgeContractABI;
            let spaceBridgeContractAddress = dstChain.bridgeContractAddress;
            let bridgeProvider = new spaceBridgeProvider(dataProvider, ABI, spaceBridgeContractAddress);
            
            if (bridgeItem !== undefined && bridgeItem.hasOwnProperty('validatorRes') && bridgeItem.validatorRes?.ticket !== undefined) {
                bridgeProvider.send_claim_init(bridgeItem.validatorRes, [], this.props.nonNativeConnection.web3ExtensionAccountId, bridgeItem.lock.transactionHash).then(function(claimTx) {
                    console.log('claim result', claimTx);
                }, function(err) {
                    console.log('Claim intit method\'s response error:', err)
                });
            }
        }
    }

    claimInitEnq(bridgeItem, stateId) {
        if (this.props.pubkey !== undefined && this.props.nonNativeConnection.web3ExtensionAccountId !== undefined) {
            let that = this;
            let pubkey = this.props.pubkey;
            let claimInitData = bridgeItem.validatorRes.encoded_data.enq.init;
            if (!(pubkey && claimInitData))
                return
            extRequests.claimInitTest(pubkey, claimInitData).then(result => {
                console.log('Success', result.hash);
                let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
                let updatedHistory = bridgeHistoryArray.map(elem => {
                    if (elem.initiator.includes(pubkey) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === bridgeItem.lock.transactionHash) {
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
                console.log(error)
            });
        } 
    } 

    claimConfirmEnq(bridgeItem, stateId) {
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
                    if (elem.initiator.includes(pubkey) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === bridgeItem.lock.transactionHash) {
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
                console.log(error)
            });
        } 
    }

    async encodeDataAndLock() {
        let that = this;
        let chain = this.props.toBlockchain;
        let address = undefined;
        if (chain !== undefined) {
            if (chain.type === 'enq')
                address = this.props.pubkey;
            else if (chain.type === 'eth')
                address = this.props.nonNativeConnection.web3ExtensionAccountId;
        }

        let URL =  'https://bridge.enex.space/api/v1/encode_lock';
        let token_decimals = Number(this.props.srcTokenDecimals);
        let amount = this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, token_decimals).value;
        let data = {
            "src_network": this.props.fromBlockchain.id, //11
            "dst_address": address,
            "dst_network": this.props.toBlockchain.id,
            "amount": amount,
            "src_hash": this.props.srcTokenHash,
            "src_address": this.props.pubkey
        }

        let lockInfo = {...data, ...{token_decimals : token_decimals, ticker : this.props.srcTokenTicker}};
           
        return fetch(URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json','Accept': 'application/json'}
        }).then(function(response) {            
            response.json().then(res => {
                if (res.hasOwnProperty('encoded_data'))
                    that.enqLock(res.encoded_data, lockInfo);
            }, err => {
                console.log(err)                
            })
        }, function(err) {
            console.log(err)                        
        })
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
                    if (elem.initiator.includes(pubkey) && elem.lock?.transactionHash === result.hash)
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
            let srcNetworkObj = this.availableNetworksUtils.getChainById(srcId);
            if (srcNetworkObj !== undefined && srcNetworkObj.name !== undefined)
                srcNetwork = srcNetworkObj.name;
        }

        if (bridgeTxInfo.lock?.dst_network !== undefined) {
            let dstId = Number(bridgeTxInfo.lock.dst_network);            
            let dstNetworkObj = this.availableNetworksUtils.getChainById(dstId);
            if (dstNetworkObj !== undefined && dstNetworkObj.name !== undefined)
                dstNetwork = dstNetworkObj.name;
        }

        res = `From ${srcNetwork} to ${dstNetwork}`;
        
        return res
    }

    getControl(item) {
        let res = 'Waiting...'
        if (item.lock?.status !== undefined && item.lock?.status === true) {
            res = 'Locked successfully. Waiting for validation...';

            let dstNetwork = this.availableNetworksUtils.getChainById(item.lock.dst_network);
            if (dstNetwork !== undefined && dstNetwork.type !== undefined) {
                if (dstNetwork.type === 'eth') {
                    if (item.validatorRes !== undefined && item.validatorRes?.ticket !== undefined && item.claimTxHash === undefined)
                        res = this.getClaimEthButton(item);
                    else if (item.validatorRes !== undefined && item.validatorRes?.ticket !== undefined && item.claimTxHash !== undefined && item.claimTxStatus == undefined)
                        res = 'Waiting for claim confirmation...';
                    else if (item.validatorRes !== undefined && item.validatorRes?.ticket !== undefined && item.claimTxHash !== undefined && item.claimTxStatus !== undefined)
                        res = this.getButtonLinkToEtherscan(item);                
                } else if (dstNetwork.type === 'enq') {
                    if (item.validatorRes !== undefined && item.validatorRes?.encoded_data?.enq !== undefined)
                        res = this.getClaimEnqButton(item);
                }                
            }
        } else if (item.lock.status !== undefined && item.lock.status !== true) 
            res = 'Failed on lock stage';
        return res    
    }

    getClaimEnqButton(item) {
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
                        onClick={this.claimInitEnq.bind(this, item, stateId)}>
                        Claim</Button>
                    }    
                    {stateId === 4 &&
                        <Button
                        className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                        onClick={this.claimConfirmEnq.bind(this, item, stateId)}>
                        Confirm</Button>
                    }
                    {stateId === 1 && <>
                        <div className="mb-2">
                            {this.getResetBridgeButton()}
                        </div>
                        <a
                            href={`https://bit.enecuum.com/#!/tx/${item.claimConfirmTxHash}`} 
                            className="d-block w-100 btn btn-info px-4"
                            target="_blank">
                            Info</a>
                    </>    
                    }        
                </>
           );  
    }

    getResetBridgeButton() {
        return(
            <Button
                className="bridge-reset-button w-100 btn btn-secondary px-4 button-bg-3"
                onClick={this.resetBridge.bind(this)}>
                Finish</Button>
        )
    }

    getClaimEthButton(item) {
        let dstNetworkHexId = `0x${Number(item.lock.dst_network).toString(16)}`;
        let chain = this.availableNetworksUtils.getChainById(Number(item.lock.dst_network));
        let chainId = undefined;
        if (chain !== undefined)
            chainId = chain.id
        return (
                <>
                    <div className="mb-2">Validated successfully</div>
                    {dstNetworkHexId === this.props.nonNativeConnection.web3ExtensionChain &&
                        <Button
                            className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                            onClick={this.claimEth.bind(this, item)}>
                            Claim</Button>
                    }
                    {dstNetworkHexId !== this.props.nonNativeConnection.web3ExtensionChain && chainId !== undefined &&
                        <Button
                            className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                            onClick={this.requestSwitchEthChain.bind(this, dstNetworkHexId)}>
                            Set chain</Button>
                    }
                </>
           );        
    }

    async requestSwitchEthChain(zeroXhexId) {
        let that = this;
        let requestData = {
            method: 'wallet_switchEthereumChain',
            params: [
                {
                    chainId: zeroXhexId
                }
            ]
        };

        try {
            await ethereum.request(requestData).then(function(res) {
            }, function(res) {                
                that.closeAction();
            });
        } catch (error) {
          console.log(error)          
        }
    }

    resetBridge() {
        this.resetStore();
        this.props.updateFromBlockchain(undefined);
        this.props.updateToBlockchain(undefined);
        this.props.updateCurrentBridgeTx(undefined);
    }

    getButtonLinkToEtherscan(item) {        
        let resume = 'Claim';
        if (item.claimTxStatus === true)
            resume = 'Done';
        else if (item.claimTxStatus === false)
            resume = 'Failed';

        let txPageUrl = '';
        let chain = this.availableNetworksUtils.getChainById(item.lock.dst_network);

        if (chain !== undefined && chain.txPageUrl !== undefined)
            txPageUrl = `${chain.txPageUrl}${item.claimTxHash}`


        return (
                <>
                    <div className="mb-2">{resume}</div>
                    <div className="mb-2">
                        {this.getResetBridgeButton()}
                    </div>
                    <a
                        href={txPageUrl} 
                        className="d-block w-100 btn btn-info px-4"
                        target="_blank">
                        Info</a>
                </>
           );        
    }

    toggleHistoryBridge() {
        this.props.updateShowHistory(!this.props.showHistory);
    }

    getBridgeCardContent() {
        let history = this.state.history;
        let currentBridgeTx = this.props.currentBridgeTx;
        if (currentBridgeTx === undefined && this.props.showHistory === false) {
            return this.getBridgeForm()
        } else if (this.props.currentBridgeTx !== undefined && this.props.showHistory === false) {
            let currentBridgeTxItem = history.find(elem => (elem.lock.transactionHash !== undefined && elem.lock.transactionHash == this.props.currentBridgeTx));
            if (currentBridgeTxItem !== undefined) {
                return (
                    <>
                        <div
                            className="d-flex justify-content-between pb-3 mb-3 px-4">
                            <div className="mr-3">                                                                   
                                <div>
                                    {this.getBridgeTxDirectionStr(currentBridgeTxItem)}
                                </div>
                                <div className="text-color4">
                                    <span className="mr-2">Amount:</span>
                                    <span>{this.getBridgeTxAmountStr(currentBridgeTxItem)}</span>                                                
                                </div>                                            
                            </div>
                            <div className="bridge-resume-wrapper">
                                {this.getControl(currentBridgeTxItem)}
                            </div>                                        
                        </div>
                        
                    </>
                )
            }
        } else if (this.props.showHistory === true) {
            return this.getBridgeHistory()
        }
    }

    getBridgeForm() {
        return (
            <>
                <div>{this.getFromSection()}</div>
                <div className="my-4">{this.getFromToToggler()}</div>
                <div>{this.getToSection()}</div>
                <div className="mt-4">{this.getButtonByCurrentState()}</div>
            </>
        )
    }

    getFromSection() {
        return (
            <div>
                <div className="row">
                    <div className="col col-xl-3">From</div>
                    <div className="col col-xl-9">
                        <div className="d-flex align-items-center justify-content-start">
                            <div className="mr-2">
                                Balance                                
                            </div>
                            <div>
                                {this.getSelectedTokenBalance()}
                            </div>
                        </div>
                    </div>                    
                </div>
                <div className="row">
                    <div className="col col-xl-3">{this.getChainsDropdown('from')}</div>
                    <div className="col col-xl-3">{this.getTokenInput()}</div>
                    <div className="col col-xl-6">{this.getTokenAmountInput()}</div>
                </div>
                {this.props.fromBlockchain?.type == 'eth' && this.props.srcTokenHash !== undefined &&
                    <div className="row mt-3">
                        <div className="col col-xl-9 offset-xl-3">
                            { this.props.srcTokenHash !== undefined &&
                              this.props.srcTokenTicker !== undefined &&
                              this.props.srcTokenBalance !== undefined &&
                              this.props.srcTokenDecimals !== undefined &&
                              this.props.srcTokenAllowance !== undefined &&
                              this.props.nonNativeConnection.web3ExtensionAccountId !== undefined &&
                              this.props.pubkey !== undefined &&
                                <>  
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span>Approved balance: {this.props.srcTokenAllowance / Math.pow(10, this.props.srcTokenDecimals)}</span>                                                    
                                        <button
                                            className="d-block btn btn-info mb-2 p-1"
                                            onClick={this.approveSrcTokenBalance.bind(this)}>Set new allowance</button>
                                            
                                    </div>
                                </>
                            }    
                        </div>                    
                    </div>
                }
            </div>
        )
    }

    getToSection() {
        return (
            <div>
                <div className="row">
                    <div className="col col-xl-3">
                        <div>To</div>
                        <div>{this.getChainsDropdown('to')}</div>
                    </div>
                    <div className="col col-xl-9">
                        <div>Destination Address</div>
                        <div>{this.showDestinationAddress()}</div>
                    </div>            
                </div>
            </div>
        )
    }

    getSelectedTokenBalance() {
        let balance = '---';
        if (this.props.srcTokenBalance !== undefined &&
            this.props.srcTokenDecimals !== undefined &&
            this.props.srcTokenTicker !== undefined) {
            let decimals = Number(this.props.srcTokenDecimals);
            balance = this.valueProcessor.usCommasBigIntDecimals(BigInt(this.props.srcTokenBalance), decimals, decimals) + ' ' + this.props.srcTokenTicker;                        
        }
        return balance
    }

    getChainsDropdown(directionString) {
        let direction = (directionString === 'from' || directionString === 'to') ? directionString : undefined;
        return (
            <ChainsDropdown
                direction={direction}                
            />
        )
    }

    getTokenInput() {
        let chain = this.props.fromBlockchain;
        let title = 'Choose token';       
        if (chain !== undefined) {
            let chainType = chain.type;
            if (chainType === 'enq') {
                if (this.props.srcTokenTicker !== undefined)
                    title = this.props.srcTokenTicker;
                return (
                    <button
                        className="d-block btn btn-info p-1 w-100 h-100"
                        onClick={this.toggleShowTokensList.bind(this)}
                        disabled={this.props.pubkey === undefined}>{title}</button>
                )
            } else if (chainType === 'eth') {
                return (
                    <Form.Group className="mb-0 w-100" controlId="inputSrcTokenHash">        
                        <Form.Control
                            type="text"
                            placeholder="Token address"
                            autoComplete="off"
                            value={this.props.srcTokenHash}
                            onChange={this.handleInputTokenHashChange.bind(this)}
                            disabled={this.props.nonNativeConnection.web3ExtensionAccountId === undefined}/>       
                    </Form.Group>                    
                )
            }
        } else {
            return (
                <button
                    className="d-block btn btn-info w-100 h-100"                   
                    onClick={this.showSelectChainWarning.bind(this)}
                    >Choose token</button>                
            )
        }
    }

    getTokenAmountInput() {
        let chain = this.props.fromBlockchain;
        return (
            <Form.Group className="mb-0" controlId="inputSrcTokenAmount">
                <Form.Control
                    type="text"
                    placeholder="Amount"
                    autoComplete="off"
                    value={this.props.srcTokenAmountToSend || undefined}
                    onChange={this.handleInputTokenAmountChange.bind(this)} 
                    disabled={chain === undefined}/> 
            </Form.Group>            
        )
    }

    showSelectChainWarning() {
        alert('Select a network first');
    }

    showDestinationAddress() {
        let chain = this.props.toBlockchain;
        let address = '---';
        if (chain !== undefined) {
            if (chain.type === 'enq')
                address = this.props.pubkey || address;
            else if (chain.type === 'eth')
                address = this.props.nonNativeConnection.web3ExtensionAccountId || address;
        }
        return (
            <Form.Group className="mb-0" controlId="inputDstUserAddress">
                <Form.Control
                    type="text"
                    placeholder="---"
                    autoComplete="off"
                    value={address}                 
                    disabled={true}/> 
            </Form.Group>
        )        
    }

    getFromToToggler() {
        return (
            <div
                id="exch"
                className="d-flex justify-content-center align-items-center mx-auto mt-3 c-border-radius2"
                onClick={this.toggleFromTo.bind(this)}>                
                <i className="fas fa-exchange-alt text-color3"></i>
            </div>
        )
    }

    toggleFromTo() {
        let fromBlockchain = this.props.fromBlockchain;        
        this.props.updateFromBlockchain(this.props.toBlockchain);
        this.props.updateToBlockchain(fromBlockchain);
    }    

    renderBridgeHistoryToggleButton() {
        let phrase = 'History';
        let disabled = true;        

        if (this.props.showHistory === true) {
            phrase = 'Bridge';
            disabled = false;
        } else if  (this.props.showHistory === false && this.state.history.length > 0) {
            phrase = 'History';
            disabled = false;
        }

        if (this.props.nonNativeConnection.web3ExtensionAccountId) {                                                                                   
            return (
                <button
                disabled={disabled}
                className="d-block btn btn-secondary mt-2 px-4 button-bg-3"
                onClick={this.toggleHistoryBridge.bind(this)}>{phrase}</button>
            )
        } else {
            return (
                <></>
            )
        }       
    }

    renderCardHeader() {
        return (
            <div className="p-4 bottom-line-1">                                
                <div>
                    <div className="d-flex align-items-center justify-content-between w-100 mb-2">
                        <div className="h4 text-nowrap nowrap mb-0">Space Bridge</div>
                        {this.renderBridgeHistoryToggleButton()}
                    </div>
                    <div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
                </div>
            </div>
        )
    }

    getButtonByCurrentState() {
        let that = this;
        let enqExtUserId = this.props.pubkey;
        let web3ExtUserId = this.props.nonNativeConnection.web3ExtensionAccountId;
        let history = this.state.history;
        let currentBridgeTxItem = undefined;

        let disabled = true;
        let action = undefined;
        let title = 'Confirm';
        
        currentBridgeTxItem = history.find(elem => (elem.lock.transactionHash !== undefined && elem.lock.transactionHash == this.props.currentBridgeTx));
        if (currentBridgeTxItem == undefined) {
            if (this.props.nonNativeConnection.web3Extension === undefined && this.props.nonNativeConnection.web3Extension?.provider === undefined) {
                return (
                    <a className="link-primary transition-item" href="https://metamask.io/download/">
                        <Button                        
                            className="d-flex align-items-center justify-content-center w-100 btn btn-secondary mb-2 px-4 button-bg-3 mt-4">
                            <div className="mr-2">Install Metamask</div>
                            <img src={metamaskLogo} width="24" height="24"/>
                        </Button>
                  </a>                    
                )
            }

            if (!this.props.nonNativeConnection.web3ExtensionAccountId &&
               (this.props.fromBlockchain?.type === 'eth' || this.props.toBlockchain?.type === 'eth')) {
                disabled = false;
                action = this.connectWeb3Ext.bind(this);
                title = 'Connect Ethereum Wallet';
            } else if (this.props.nonNativeConnection.web3ExtensionAccountId && this.props.fromBlockchain?.type === 'eth') {
                disabled = this.props.pubkey === undefined ||
                           this.props.nonNativeConnection.web3ExtensionAccountId === undefined ||
                           this.props.nonNativeConnection.web3Extension?.provider?.chainId !== this.props.fromBlockchain?.web3ExtensionChainId;
                action = this.lockEth.bind(this);
            } else if (this.props.fromBlockchain?.type === 'enq') {
                disabled = this.props.pubkey === undefined;
                action = this.encodeDataAndLock.bind(this);
            }            
        }

        return(
            <>
                <button
                    className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3 mt-4"
                    onClick={action}
                    disabled={disabled}>
                    {title}</button>
            </>
        )
    }

    getBridgeHistory() {
        let that = this;        
        return (
            <>
                <div className="mb-3 pt-2">
                    <div className="h5">History</div>
                </div>                
                <>
                    {this.state.history.map((item, index) => (
                        <div
                            className="d-flex justify-content-between bottom-line-1 pb-3 mb-3"
                            data-resume={`${index}-lockHash-${item.lock.transactionHash}-direction-${item.lock.src_network}-${item.lock.dst_network}`}
                            key={`${index}-lock-${item.lock.transactionHash}`}>
                            <div className="mr-3">                                                                   
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
                    <div>
                        <button
                            disabled={this.props.currentBridgeTx !== undefined}
                            className="d-block btn btn-danger mt-2 mb-4 px-4 mx-auto"
                            onClick={this.clearHistory.bind(this)}>Clear history</button>                                                            
                    </div>
                </>                
            </>       
        )
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
                            <div className="row w-100 mb-5">
                                <div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>                
                                    <Card className="swap-card">
                                      <Card.Body className="p-0">
                                        {this.renderCardHeader()}
                                        <Card.Text as="div" className="p-4">
                                            {this.getBridgeCardContent()}
                                        </Card.Text>
                                      </Card.Body>
                                    </Card>                
                                </div>
                            </div>
                        </div>
                    </>
                }
            </>    
        );
    };
};

const WSpaceBridge = connect(mapStoreToProps(components.SPACE_BRIDGE), mapDispatchToProps(components.SPACE_BRIDGE))(withTranslation()(SpaceBridge));

export default WSpaceBridge;   