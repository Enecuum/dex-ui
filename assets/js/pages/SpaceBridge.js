import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';

import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import presets from '../../store/pageDataPresets';

import Steps from './../elements/bridge/Steps';
import BridgeForm from './../elements/bridge/BridgeForm';
import ClaimControl from './../elements/bridge/ClaimControl';
import ChainsDropdown from './../elements/bridge/ChainsDropdown';

import TokenCardBridge from './../components/TokenCardBridge';

import '../../css/bridge.css';

import tokenERC20ContractProvider from './../contracts-providers/tokenERC20ContractProvider';
import vaultContractProvider from './../contracts-providers/vaultContractProvider';
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
            history : [],
            showFormInputWarning : false,
            formInputWarningCause : undefined,
            formInputWarningMsg : '',
            blockConfirmByAmount : true
        }
        setInterval(() => {
            this.updateUserHistory();
            this.getValidatorRes();
        }, 5000)
    }

    componentDidUpdate(prevProps) {
        let that = this;

        if (prevProps.pubkey !== this.props.pubkey  ||
            prevProps.net.url !== this.props.net.url ||
            prevProps.nonNativeConnection?.web3Extension?.provider?.isMetaMask !== this.props.nonNativeConnection?.web3Extension?.provider?.isMetaMask ||
            prevProps.nonNativeConnection.web3ExtensionAccountId !== this.props.nonNativeConnection.web3ExtensionAccountId  ||
            prevProps.nonNativeConnection.web3ExtensionChain  !== this.props.nonNativeConnection.web3ExtensionChain ||
            prevProps.bridgeDirection !== this.props.bridgeDirection ||
            prevProps.fromBlockchain?.id !== this.props.fromBlockchain?.id) {

            this.setState({showFormInputWarning : false});
            this.setState({sformInputWarningCause : undefined});
            this.setState({sformInputWarningMsg : ''});
            this.setState({sblockConfirmByAmount : true});

            if(prevProps.nonNativeConnection?.web3Extension?.provider?.isMetaMask !== this.props.nonNativeConnection?.web3Extension?.provider?.isMetaMask) {
                console.log('isMetamask status changed', this.props.nonNativeConnection?.web3Extension?.provider?.isMetaMask);
            }

            if (this.props.currentBridgeTx === undefined) {
                this.resetStore();
                this.setState({initData: undefined});
                this.setState({confirmData: undefined});
                this.setState({ticket: undefined});
                this.setState({transfer_id: undefined});
                this.setState({history: []});

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
        if ((prevProps.fromBlockchain?.id !== this.props.fromBlockchain?.id) ||
            (prevProps.toBlockchain?.id !== this.props.toBlockchain?.id) ||
            (prevProps.srcTokenHash !== this.props.srcTokenHash)) {
            
            if (this.props.fromBlockchain?.id !== undefined  && this.props.toBlockchain?.id !== undefined && this.props.srcTokenHash !== undefined) {
                this.getDstDecimalsFromValidator(this.props.fromBlockchain.id, this.props.toBlockchain.id, this.props.srcTokenHash)
                .then(function(validatorRes) {
                    if ((validatorRes.hasOwnProperty('err') && validatorRes.err == 0) && !isNaN(validatorRes.result.dst_decimals)) {
                        that.props.updateDstDecimals(Number(validatorRes.result.dst_decimals));
                        that.handleInputTokenAmountChange({target : {value : that.props.srcTokenAmountToSend}});                       
                    } else {
                        that.props.updateDstDecimals(undefined);
                        that.handleInputTokenAmountChange({target : {value : that.props.srcTokenAmountToSend}});
                        console.log('Validator get_dst_decimals response error')
                    }                       
                }, function(err) {
                    that.props.updateDstDecimals(undefined);
                    that.handleInputTokenAmountChange({target : {value : that.props.srcTokenAmountToSend}});
                    console.log('Can\'t get get_dst_decimals response ', err);
                });                                    
                
            } else {
                that.props.updateDstDecimals(undefined);
                that.handleInputTokenAmountChange({target : {value : that.props.srcTokenAmountToSend}});
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
                let srcNetworkType = that.availableNetworksUtils.getChainById(elem.lock?.src_network);
                let dstNetworkType = that.availableNetworksUtils.getChainById(elem.lock?.dst_network);                
                srcNetworkType = srcNetworkType !== undefined ? srcNetworkType.type : undefined;
                dstNetworkType = dstNetworkType !== undefined ? dstNetworkType.type : undefined;

                if (!elem.lock.hasOwnProperty('status')) {
                    if (srcNetworkType === 'eth'  && that.props.nonNativeConnection.web3Extension?.provider) {
                        let dataProvider = that.props.nonNativeConnection.web3Extension.provider;
                        let web3Provider = new web3LibProvider(dataProvider);
                        web3Provider.getTxReceipt(elem.lock.transactionHash, 'Lock').then(function(res) {
                            if (res !== null && res !== undefined && res.status !== undefined) {
                                elem.lock.status = Number(res.status) === 1 ? true : false;
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
                                            console.log('Undefined lock transaction status', elem.lock.transactionHash);
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
                                if (res !== null && res !== undefined && res.status !== undefined) {
                                    elem.claimTxStatus = Number(res.status) === 1 ? true : false;
                                    localStorage.setItem('bridge_history', JSON.stringify(array));
                                    that.setState({history: array});
                                } else {
                                    console.log('Undefined claim transaction status', elem.lock.transactionHash);
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
                                                console.log('7777777777777777777')
                                            } else {
                                                console.log('Undefined claim confirm transaction status', elem.lock.transactionHash);
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
                
                //if (!elem.hasOwnProperty('validatorRes') || elem.validatorRes.transfer_id == undefined) {
    			if (!elem.hasOwnProperty('validatorRes')) {
                    that.postToValidator(elem.lock.transactionHash, elem.lock.src_network).then(function(validatorRes) {
    					if (validatorRes === null || validatorRes.hasOwnProperty('err')) {
                            console.log('Validator_notify response is null for lock transaction', elem.lock.transactionHash)
    						return
                        }
    					elem.validatorRes = validatorRes;
    					localStorage.setItem('bridge_history', JSON.stringify(array));
                        that.setState({history: array});
                        console.log('888888888888888')
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
        console.log('9999999999999999')
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

	async approveSrcTokenBalance() {
		if (this.props.srcTokenHash && this.props.nonNativeConnection.web3ExtensionAccountId) {
			let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
	    	let ABI = smartContracts.erc20token.ABI;
	    	let token_hash = this.props.srcTokenHash;
	    	let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

			let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;

            let that = this;
            let vaultContractAddress = this.props.fromBlockchain.vaultContractAddress;
			assetProvider.approveBalance(vaultContractAddress, '100000000000000000000000000000000000000000000000000000', account_id).then(function(approveTx) {
                if (approveTx.status === 1n) {
                    let web3Provider = new web3LibProvider(dataProvider);
                    web3Provider.getTxReceipt(approveTx.transactionHash, `Approve ${token_hash} for vault contract ${vaultContractAddress}`).then(function(res) {
                        if (res !== null && res !== undefined && res.status !== undefined && res.logs[0].data !== undefined) {
                            let strOutput = res.logs[0].data.toString();
                            that.props.updateSrcTokenAllowance(strOutput);
                            that.handleInputTokenAmountChange({target : {value : that.props.srcTokenAmountToSend}});
                        } else {
                            console.log('Undefined approve balance transaction status', approveTx.transactionHash);
                        }
                    }, function(err) {
                        console.log('Can\'t get receipt for approve balance transaction', approveTx.transactionHash, err);
                    });
                }
                // if (approveTx.status === 1n &&
                //     approveTx.from !== undefined && 
                //     approveTx.from.toLowerCase() == that.props.nonNativeConnection.web3ExtensionAccountId.toLowerCase() &&
                //     approveTx.events?.Approval?.returnValues?.spender !== undefined && 
                //     approveTx.events?.Approval?.returnValues?.spender.toLowerCase() == that.props.fromBlockchain?.vaultContractAddress.toLowerCase() &&
                //     approveTx.to !== undefined && 
                //     approveTx.to.toLowerCase() == that.props.srcTokenHash.toLowerCase()) {
                //         that.props.updateSrcTokenAllowance(approveTx.events?.Approval?.returnValues?.value);
                //         that.handleInputTokenAmountChange({target : {value : that.props.srcTokenAmountToSend}});
                // }
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
                //console.log(txHash, res);
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

    async getDstDecimalsFromValidator(src_network_id, dst_network_id, src_token_hash) {
        let URL = `https://bridge.enex.space/api/v1/get_dst_decimals?src_network_id=${src_network_id}&dst_network_id=${dst_network_id}&hash=${src_token_hash}`;        
        return fetch(URL, {
            method: 'GET'
        }).then(function(response) {            
            return response.json().then(res => {
                return res
            }, err => {
                console.log('Parse get_dst_decimals response failed');
                return null
            })
        }, function(err) {
            console.log('Get get_dst_decimals response failed');
            return null            
        })    
    }

    handleInputTokenHashChange(item) {
    	let that = this;
    	if (!this.props.nonNativeConnection.web3ExtensionAccountId) {
    		console.log('No metamask user id!');
            showSelectChainWarning('no-metamask-user-id');    		
    	} else {
            if (this.props.fromBlockchain !== undefined && this.props.fromBlockchain.type === 'eth') {
                let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
    			let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
    	    	let erc20ABI = smartContracts.erc20token.ABI;
    	    	let token_hash = item.target.value;
                this.props.updateSrcTokenHash(token_hash);
    	    	let assetProvider = new tokenERC20ContractProvider(dataProvider, erc20ABI, token_hash);

    			
    			let vaultContractAddress = this.props.fromBlockchain.vaultContractAddress;

    			assetProvider.getAssetInfo(account_id).then(function(assetInfo) {
    				that.props.updateSrcTokenBalance(assetInfo.amount);
    				that.props.updateSrcTokenDecimals(assetInfo.decimals);
    				that.props.updateSrcTokenTicker(assetInfo.ticker);
    			}, function(assetInfo) {
                    console.log(`Can\'t get info for asset ${token_hash}`);                
                    that.resetTokenInfo(that);      
                    that.props.updateSrcTokenAmountToSend(0);
    			});

    			assetProvider.getAllowance(account_id, vaultContractAddress).then(function(allowance) {
    				that.props.updateSrcTokenAllowance(allowance);
    			},function(err) {
    				console.log(`Can\'t get allowance for asset ${token_hash}`);                
    				that.resetTokenInfo(that);      
                    that.props.updateSrcTokenAmountToSend(0);					
    			});
            }        		
    	}
    }

    processSrcTokenAmountToSend(amount) {
        let satisfyCommonConditions = this.props.srcTokenHash !== undefined &&                               
                                      this.props.srcTokenDecimals !== undefined &&
                                      this.props.srcTokenBalance !== undefined &&
                                      this.props.dstDecimals !== undefined;
        let satisfyExtraConditions = true;
        let ethType = this.props.fromBlockchain?.type === 'eth';        
        if (ethType)
            satisfyExtraConditions = this.props.srcTokenAllowance !== undefined;        
        let readyForProcess = satisfyCommonConditions && satisfyExtraConditions;                               

        if (readyForProcess) {
            this.setState({blockConfirmByAmount : false});
            let bigIntAmount = this.valueProcessor.valueToBigInt(amount, this.props.srcTokenDecimals);
            if (ethType && (bigIntAmount.value >= this.props.srcTokenAllowance)) {
                this.setState({blockConfirmByAmount : true});
                this.showAmountWarning('low-allowance');        
                console.log('Amount less than allowance');
            } else if (bigIntAmount.value > this.props.srcTokenBalance) {
                this.setState({blockConfirmByAmount : true});
                this.showAmountWarning('exeeds-balance');        
                console.log('Amount more than balance');
            } else if (bigIntAmount.rawFractionalPart.length > Number(this.props.srcTokenDecimals)) {
                this.setState({blockConfirmByAmount : true});
                this.showAmountWarning('exeeds-decimals');        
                console.log('Too long fractional part');
            } else if (bigIntAmount.rawFractionalPart.length > Number(this.props.dstDecimals)) {
                this.setState({blockConfirmByAmount : true});
                this.showAmountWarning('exeeds-dst-decimals');        
                console.log('Fractional part is longer than dst_decimals');
            }
        } else {
            this.setState({blockConfirmByAmount : true});
            this.showAmountWarning('incorrect-token-info');        
            console.log('Incorrect token Info');
        }

    }

    handleInputTokenAmountChange(item) {
		if (!isNaN(item.target.value)) {
            let value = item.target.value;            
			this.props.updateSrcTokenAmountToSend(value);
            this.processSrcTokenAmountToSend(value);
        }
    }

    async lockEth() {    	
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
                let src_address_0x = src_address !== undefined ? src_address.substring(0, 2) : undefined;
                let src_address_trim_0x =  src_address_0x === '0x' ? src_address.slice(2).toLowerCase() : undefined;

                let token_hash_0x = token_hash !== undefined ? token_hash.substring(0, 2) : undefined;
                let token_hash_trim_0x =  token_hash_0x === '0x' ? token_hash.slice(2).toLowerCase() : undefined;
             
                let nonce = await bridgeProvider.getTransfer(src_address_trim_0x, token_hash_trim_0x, this.props.fromBlockchain.id, dst_address, this.props.toBlockchain.id);
                nonce = !isNaN(nonce) ? nonce + 1 : nonce;
    			bridgeProvider.lock(src_address, this.props.fromBlockchain.id, dst_address, this.props.toBlockchain.id /*11*/, amount, token_hash, nonce, token_decimals, ticker, that.props.updateCurrentBridgeTx).then(function(lockTx) {
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
                bridgeProvider.send_claim_init(bridgeItem.validatorRes, this.props.nonNativeConnection.web3ExtensionAccountId, bridgeItem.lock.transactionHash).then(function(claimTx) {
                    console.log('claim result', claimTx);
                }, function(err) {
                    console.log('Claim intit method\'s response error:', err)
                });
            }
        }
    }

    claimInitEnq(bridgeItem) {
        if (this.props.pubkey !== undefined) {
            let that = this;
            let pubkey = this.props.pubkey;
            let claimInitData = bridgeItem.validatorRes.encoded_data.enq.init;
            if (!(pubkey && claimInitData))
                return
            extRequests.claimInit(pubkey, claimInitData).then(result => {
                console.log('Success', result.hash);
                let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
                let updatedHistory = bridgeHistoryArray.map(elem => {
                    if (elem.initiator.toUpperCase().includes(pubkey.toUpperCase()) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === bridgeItem.lock.transactionHash) {
                        elem.claimInitTxTimestamp = Date.now();
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

    claimConfirmEnq(bridgeItem) {
        if (this.props.pubkey !== undefined) {
            let that = this;
            let pubkey = this.props.pubkey;
            let claimConfirmData = bridgeItem.validatorRes.encoded_data.enq.confirm;
            if (!(pubkey && claimConfirmData))
                return
            extRequests.claimConfirm(pubkey, claimConfirmData).then(result => {
                console.log('Success', result.hash);

                let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
                let updatedHistory = bridgeHistoryArray.map(elem => {
                    if (elem.initiator.toUpperCase().includes(pubkey.toUpperCase()) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === bridgeItem.lock.transactionHash) {
                        elem.claimConfirmTxTimestamp = Date.now();
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
        } else {
            console.log('Error: try to lock in undefined chain');
            return
        }

        let response = await networkApi.getBridgeLastLockTransfer(address, this.props.pubkey, this.props.toBlockchain.id, this.props.srcTokenHash);



        let nonce = await response.json();
        if (nonce !== undefined && nonce !== null)
            nonce = Number(nonce);

        nonce++;
        
        URL =  'https://bridge.enex.space/api/v1/encode_lock';
        let token_decimals = Number(this.props.srcTokenDecimals);
        let amount = this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, token_decimals).value;
        let data = {
            "src_network": this.props.fromBlockchain.id,
            "dst_address": address,
            "dst_network": this.props.toBlockchain.id,
            "amount": amount,
            "src_hash": this.props.srcTokenHash,
            "src_address": this.props.pubkey,
            "nonce" : nonce
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
                                    ticker : lockInfo.ticker,
                                    timestamp : Date.now()
                                }                    
                };

            let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
            if (bridgeHistoryArray.length > 0) {
                let itemIsExist = bridgeHistoryArray.find(function(elem) {
                    if (elem.initiator.toUpperCase().includes(pubkey.toUpperCase()) && elem.lock?.transactionHash === result.hash)
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
                res = `${res} ${bridgeTxInfo.lock.ticker}`
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
                        if (item.claimTxStatus == true)
                            res = this.getButtonLinkToEtherscan(item);
                        else
                            res = this.getClaimEthButton(item);                                        
                } else if (dstNetwork.type === 'enq') {
                    if (item.validatorRes !== undefined && item.validatorRes?.encoded_data?.enq !== undefined)
                        res = this.getClaimEnqButton(item);
                }                
            }
        } else if (item.lock.status !== undefined && item.lock.status !== true) {
            res = this.getFailTxResult(item);
        }
        return res    
    }

    getFailTxResult(item) {
        let dstNetworkId = Number(item.lock.src_network);
        let chain = this.availableNetworksUtils.getChainById(Number(dstNetworkId));
        let link = '';
        let resume = 'Failed on lock stage';
        if (chain !== undefined) {
            link = `${chain.txPageUrl}${item.lock.transactionHash}`;
            return(           
                <>
                    <div className="mb-2">{resume}</div>
                    <div className="mb-2">
                        {this.getResetBridgeButton()}
                    </div>
                    {item.lock?.transactionHash !== undefined && <>
                        <a
                            href={link} 
                            className="d-block w-100 btn btn-info px-4"
                            target="_blank">
                            Info</a>
                    </>}                                          
                </>
            )
        } else
            return (
                <>
                    <div className="mb-2">{resume}</div>
                    <div className="mb-0">
                        {this.getResetBridgeButton()}
                    </div>
                </>    
            )       
    }

    getClaimEnqButton(item) {
        let dstNetworkId = Number(item.lock.dst_network);
        let chain = this.availableNetworksUtils.getChainById(Number(dstNetworkId));
        let chainId = undefined;
        if (chain !== undefined)
            chainId = chain.enqExtensionChainId;
        let matchChains = chainId === this.props.net.url ? true : false;
        let matchDstAddress = false;

        if (item.lock?.dst_address !== undefined && this.props.pubkey !== undefined)
            matchDstAddress = item.lock.dst_address.toUpperCase() === this.props.pubkey.toUpperCase() ? true : false;

        let resume = 'Validated successfully';
        let stateId = 0;
        let txHash = undefined;
        let claimType = 'claimInit';
        let actionStr = 'Claim';
        let resetCurrent = false;
        let showResetBridge = undefined;    

        if (item.claimConfirmTxStatus === true) {
            resume = 'Done';
            stateId = 1;
            txHash = item.claimConfirmTxHash;
            showResetBridge = true;
        } else if (item.claimConfirmTxStatus === false) {
            resume = 'Claim confirmation failed';
            stateId = 2;
            txHash = item.claimConfirmTxHash;
            claimType = 'claimConfirm';
            actionStr = 'Retry';
            resetCurrent = true;
            showResetBridge = true;
        } else if (item.claimConfirmTxHash !== undefined) {
            resume = 'Claim confirmation initialized';
            stateId = 3;
        } else {
            if (item.claimInitTxStatus === true) {
                if (item.hasOwnProperty('claimConfirmAttemptsList') && Array.isArray(item.claimConfirmAttemptsList) && item.claimConfirmAttemptsList.length > 0) {
                    resume = 'Claim confirmation failed';
                    stateId = 4;
                    actionStr = 'Retry';
                    claimType = 'claimConfirm';
                    resetCurrent = true;
                    showResetBridge = true;
                } else {
                    resume = 'Claim is ready';
                    stateId = 5;
                    actionStr = 'Confirm';
                    claimType = 'claimConfirm';
                    resetCurrent = false;                 
                }
            } else if (item.claimInitTxStatus === false || (item.claimInitTxStatus === undefined && (item.hasOwnProperty('claimInitAttemptsList') && Array.isArray(item.claimInitAttemptsList) && item.claimInitAttemptsList.length > 0))) {
                if (item.claimInitTxHash !== undefined && item.claimInitTxStatus === undefined) {
                    resume = 'Claim initialized';
                    stateId = 7;
                } else {
                    resume = 'Claim inititalization failed';
                    stateId = 6;
                    txHash = item.claimInitTxHash;
                    claimType = 'claimInit';
                    actionStr = 'Retry';
                    resetCurrent = true;
                    showResetBridge = true;                        
                }
            } else if (item.claimInitTxHash !== undefined) {
                resume = 'Claim initialized';
                stateId = 7;
            }
        } 


        //  else (item.claimInitTxHash !== undefined) {
        //     resume = 'Claim initialized';
        //     stateId = 6;
        // }   
        // } else if (item.claimInitTxStatus === true) {

        // } else if (item.claimInitTxStatus !== true) {
        //     if ()
        // } 





        // else if (item.claimConfirmTxHash !== undefined) {
        //     resume = 'Claim confirmation initialized';
        //     stateId = 3;
        // } else if () {

        // }




        //  else if (item.claimInitTxStatus === true) {
        //     resume = 'Claim is ready';
        //     stateId = 4;
        //     actionStr = 'Confirm';
        //     if ((item.hasOwnProperty('claimConfirmAttemptsList') && Array.isArray(item.claimConfirmAttemptsList) && item.claimConfirmAttemptsList.length > 0) || item.claimConfirmTxStatus == false) {
        //         resume = 'Claim confirmation failed';
        //         actionStr = 'Retry';
        //     }
        // } else if (item.hasOwnProperty('claimInitAttemptsList') && Array.isArray(item.claimInitAttemptsList) && item.claimInitAttemptsList.length > 0 && item.claimInitTxStatus !== true) {            
        //     stateId = 5;
        //     txHash = item.claimInitTxHash;
        //     claimType = 'claimInit';
        //     resume = 'Claim inititalization failed';
        //     actionStr = 'Retry';              
        //     //if (item.hasOwnProperty('claimInitAttemptsList') && Array.isArray(item.claimInitAttemptsList) && item.claimInitAttemptsList.length > 0) {
              


        // } else if (item.claimInitTxHash !== undefined) {
        //     resume = 'Claim initialized';
        //     stateId = 6;
        // }

        return (
                <>
                    <div className="mb-2">{resume}</div>
                    {showResetBridge === true &&
                        <div className="mb-2">
                            {this.getResetBridgeButton()}
                        </div>
                    }
{/*
                    {stateId === 0 && matchChains &&
                        <Button
                        className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                        onClick={this.claimEnq.bind(this, item, claimType, resetCurrent)}>                        
                        {actionStr}</Button>
                    }*/}

                    {[0,2,4,5,6].includes(stateId) && !matchChains &&
                        <div className="text-color3"> {`Set ${chain.name} as current network in your ENQ extension for continue`}</div>
                    }

                    {[0,2,4,5,6].includes(stateId) && matchChains && !matchDstAddress &&
                        <div className="text-color3"> {`Set ${utils.packHashString(item.lock.dst_address)} as current account in your ENQ extension for continue`}</div>
                    }

                    {[0,2,4,5,6].includes(stateId) && matchChains && matchDstAddress &&
                        <>
                            <Button
                                className="d-block w-100 btn btn-secondary px-3 button-bg-3"
                                onClick={this.claimEnq.bind(this, item, claimType, resetCurrent)}>
                                    {actionStr}                     
                            </Button>
                        </>    
                    }

                    {stateId === 1 &&
                        <a
                            href={`${chain.txPageUrl}${txHash}`} 
                            className="d-block w-100 btn btn-info px-4"
                            target="_blank">
                            Info</a>
                    }





{/*                    <div className="mb-2">{resume}</div>
                    {stateId === 0 && matchChains &&
                    <Button
                        className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                        onClick={this.claimInitEnq.bind(this, item)}>
                        {actionStr}</Button>
                    }    
                    {stateId === 4 && matchChains &&
                        <Button
                        className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                        onClick={this.claimConfirmEnq.bind(this, item)}>
                        {actionStr}</Button>
                    }
                    {stateId !== 1 && !matchChains &&
                        <div className="text-color3"> {`Set ${chain.name} as current network in your ENQ extension for continue`}</div>
                    }
                    {(stateId === 1 || stateId === 2 || stateId === 5) && matchChains && <>
                        
                        <div className="mb-2">
                            {this.getResetBridgeButton()}
                        </div>
                        
                        {stateId !== 1 &&
                            <div className="d-flex align-items-center justify-content-between">
                                <Button
                                    className="d-block w-100 btn btn-secondary px-3 button-bg-3"
                                    onClick={this.reClaimEnq.bind(this, item, claimType)}>
                                        {actionStr}                     
                                </Button>    
                            </div>
                        }
                        {stateId === 1 &&
                            <a
                                href={`${chain.txPageUrl}${txHash}`} 
                                className="d-block w-100 btn btn-info px-4"
                                target="_blank">
                                Info</a>
                        }                        
                    </>    
                    }   */}     
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

    claimEnq(item, claimType, resetCurrent) {
        if (resetCurrent === true)
            this.passDataToResetClaimModal(item, claimType);
        this[`${claimType}Enq`](item);
    }

    reClaimEth(item) {
        this.passDataToResetClaimModal(item, 'claim');
        this.claimEth(item);
    }

    getClaimEthButton(item) {
        let action = undefined;
        let resume = 'Validated successfully';
        let title = '';
        let addr = this.props.nonNativeConnection.web3ExtensionAccountId;
        if (this.props.nonNativeConnection.web3ExtensionAccountId !== undefined) {           
            let dstNetworkHexId = `0x${Number(item.lock.dst_network).toString(16)}`;
            let chain = this.availableNetworksUtils.getChainById(Number(item.lock.dst_network));
            let chainId = chain !== undefined ? chain.id : undefined;

            if (item.lock.dst_address.toUpperCase() !== addr.toUpperCase()) {
                action = this.connectMMAcc.bind(this);
                title = `Connect address ${utils.packAddressString(item.lock.dst_address)}`;
            } else if (dstNetworkHexId === this.props.nonNativeConnection.web3ExtensionChain) {                
                if (item.claimTxStatus === false) {
                    action = this.reClaimEth.bind(this, item);
                    resume = 'Failed';
                    title = 'Retry';
                } else if (item.hasOwnProperty('claimAttemptsList') && Array.isArray(item.claimAttemptsList) && item.claimAttemptsList.length > 0) {
                    action = this.claimEth.bind(this, item);
                    resume = 'Failed';
                    title = 'Retry';
                } else {
                    action = this.claimEth.bind(this, item);
                    title = 'Claim';
                }
            } else if (dstNetworkHexId !== this.props.nonNativeConnection.web3ExtensionChain && chainId !== undefined) {
                action = this.requestSwitchEthChain.bind(this, dstNetworkHexId);
                title = 'Set chain';
            }
        } else if (this.props.nonNativeConnection.web3Extension?.provider !== undefined && addr == undefined) {
            action = this.connectWeb3Ext.bind(this);
            title = 'Connect Ethereum Wallet';
        } else if (this.props.nonNativeConnection.web3Extension === undefined || this.props.nonNativeConnection.web3Extension?.provider === undefined) {
            return (
                <a className="link-primary transition-item" href="https://metamask.io/download/">
                    <Button                        
                        className="d-flex align-items-center justify-content-center w-100 btn btn-secondary px-4 button-bg-3">
                        <div className="mr-2">Install Metamask</div>
                        <img src={metamaskLogo} width="24" height="24"/>
                    </Button>
              </a>                    
            )
        }

        return (
            <>
                <div className="mb-2">{resume}</div>
                 <Button
                    className="d-block w-100 btn btn-secondary px-4 button-bg-3"
                    onClick={action}>
                        {title}                     
                </Button>
            </>
        );        
    }

    async connectMMAcc() {
        let that = this;
        let requestData = {
            method: "wallet_requestPermissions",
            params: [
                {
                    eth_accounts: {}
                }
            ]
        }
        try {
            await ethereum.request(requestData);
        } catch (error) {
          console.log(error)          
        }
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

        console.log(requestData)

        try {
            await ethereum.request(requestData).then(function(res) {
            }, function(res) {                
                
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

    passDataToResetClaimModal(item, claimType) {        
        if (!(claimType === 'claim' || claimType === 'claimInit' || claimType === 'claimConfirm'))
            return

        let attemptsListPropStr = `${claimType}AttemptsList`;
        let claimTxHashPropStr = `${claimType}TxHash`;
        let claimTxStatusPropStr = `${claimType}TxStatus`;
        let claimTxTimestampPropStr = `${claimType}TxTimestamp`;

        let userHistory = this.bridgeHistoryProcessor.getBridgeHistoryArray();
        let itemIndexInHistory = userHistory.findIndex(elem => elem[claimTxHashPropStr] === item[claimTxHashPropStr] && elem.lock.transactionHash === item.lock.transactionHash);

        if (itemIndexInHistory !== -1) {            
            let itemInHistory = userHistory[itemIndexInHistory];
            let claimAttemptsList = [];
            if (itemInHistory.hasOwnProperty(attemptsListPropStr) && itemInHistory[attemptsListPropStr].length > 0) {
                claimAttemptsList = itemInHistory[attemptsListPropStr];                
            }
            let attempt = {};
            attempt[claimTxHashPropStr] = item[claimTxHashPropStr];
            attempt[claimTxStatusPropStr] = item[claimTxStatusPropStr];
            attempt[claimTxTimestampPropStr] = item[claimTxTimestampPropStr];
            claimAttemptsList.push(attempt);
            itemInHistory[attemptsListPropStr] = claimAttemptsList;
            itemInHistory[claimTxHashPropStr] = undefined;
            itemInHistory[claimTxStatusPropStr] = undefined;
            itemInHistory[claimTxTimestampPropStr] = undefined;
            userHistory[itemIndexInHistory] = itemInHistory
            localStorage.setItem('bridge_history', JSON.stringify(userHistory));
            this.setState({history: userHistory});
            console.log('aaaaaaaaaaaaaa')
        } 
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
                    <div className="d-flex align-items-center justify-content-between">
                        <a
                            href={txPageUrl} 
                            className="d-block w-100 btn btn-info px-4"
                            target="_blank">
                            Info</a>
                        {/*<Button
                            className="d-block btn btn-secondary px-3 button-bg-3 ml-2"
                            onClick={this.passDataToResetClaimModal.bind(this, item, 'claim')}>
                                <i className="fas fa-redo-alt"/>                     
                        </Button> */}   
                    </div>    
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
                    <div className="current-tx-resume">
                        {this.getBridgeHistory('current', [currentBridgeTxItem])}
                    </div>
                    // <>
                    //     <div
                    //         className="d-flex justify-content-between pb-3 mb-3 px-4">
                    //         <div className="mr-3">                                                                   
                    //             <div>
                    //                 {this.getBridgeTxDirectionStr(currentBridgeTxItem)}
                    //             </div>
                    //             <div className="text-color4">
                    //                 <span className="mr-2">Amount:</span>
                    //                 <span>{this.getBridgeTxAmountStr(currentBridgeTxItem)}</span>                                                
                    //             </div>                                            
                    //         </div>
                    //         <div className="bridge-resume-wrapper">
                    //             {this.getControl(currentBridgeTxItem)}
                    //         </div>                                        
                    //     </div>
                        
                    // </>
                )
            }
        } else if (this.props.showHistory === true) {
            return this.getBridgeHistory('all')
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
                <>
                    {this.getWarningElem()}
                </>
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
                              (this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, this.props.srcTokenDecimals).value >= BigInt(this.props.srcTokenAllowance)) &&
                                <>  
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span>Approved balance: {this.props.srcTokenAllowance / Math.pow(10, this.props.srcTokenDecimals)}</span>                                                    
                                        <button
                                            className="d-block btn btn-info mb-2 p-1"
                                            onClick={this.approveSrcTokenBalance.bind(this)}>Approve</button>
                                            
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
                    onClick={this.showSelectChainWarning.bind(this, 'undefined-from-chain')}
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
                    value={this.props.srcTokenAmountToSend}
                    onChange={this.handleInputTokenAmountChange.bind(this)} 
                    disabled={chain === undefined}/> 
            </Form.Group>            
        )
    }

    showSelectChainWarning(cause) {
        if (cause == 'undefined-from-chain') {
            this.setState({'formInputWarningCause' : cause});
            this.setState({'showFormInputWarning' : true});        
            this.setState({'formInputWarningMsg' : 'Select a network first'});            
        } else if (cause == 'no-metamask-user-id') {
            this.setState({'formInputWarningCause' : cause});
            this.setState({'showFormInputWarning' : true});        
            this.setState({'formInputWarningMsg' : 'Please, connect to your Ethereum wallet and check the current network is Available'});            
        }
    }

    showAmountWarning(cause) {
        if (cause == 'incorrect-token-info') {
            this.setState({'formInputWarningCause' : cause});
            this.setState({'showFormInputWarning' : true});        
            this.setState({'formInputWarningMsg' : 'Incorrect token info'});            
        } else if (cause == 'low-allowance') {
            this.setState({'formInputWarningCause' : cause});
            this.setState({'showFormInputWarning' : true});        
            this.setState({'formInputWarningMsg' : 'Amount less than appoved balance'});
        } else if (cause == 'exeeds-balance') {
            this.setState({'formInputWarningCause' : cause});
            this.setState({'showFormInputWarning' : true});        
            this.setState({'formInputWarningMsg' : 'Amount more than balance'});
        } else if (cause == 'exeeds-decimals') {
            this.setState({'formInputWarningCause' : cause});
            this.setState({'showFormInputWarning' : true});        
            this.setState({'formInputWarningMsg' : `This token has decimals ${this.props.srcTokenDecimals}`});
        } else if (cause == 'exeeds-dst-decimals') {
            this.setState({'formInputWarningCause' : cause});
            this.setState({'showFormInputWarning' : true});        
            this.setState({'formInputWarningMsg' : `Decimals in destination network for this token can\`t exeeds ${this.props.dstDecimals}`});
        }
    }

    getWarningElem() {
        let cause = this.state.formInputWarningCause;
        if (cause == 'undefined-from-chain' &&
            this.props.fromBlockchain !== undefined) 
                return
        if (cause == 'no-metamask-user-id' &&
            this.props.this.props.nonNativeConnection.web3ExtensionAccountId !== undefined &&
            this.props.fromBlockchain?.web3ExtensionChainId !== undefined &&
            this.props.fromBlockchain?.web3ExtensionChainId === this.props.this.props.nonNativeConnection.web3ExtensionChain) 
                return
        else if (cause == 'incorrect-token-info') {
            let satisfyCommonConditions = this.props.srcTokenHash !== undefined &&                               
                                          this.props.srcTokenDecimals !== undefined &&
                                          this.props.srcTokenBalance !== undefined;
            let satisfyExtraConditions = true;
            let ethType = this.props.fromBlockchain?.type === 'eth';        
            if (ethType)
                satisfyExtraConditions = this.props.srcTokenAllowance !== undefined;        
            let readyForProcess = satisfyCommonConditions && satisfyExtraConditions;
            if (readyForProcess)
                return
        } else if (cause == 'low-allowance' &&
            this.props.fromBlockchain?.type === 'eth' &&            
            (this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, this.props.srcTokenDecimals).value <= this.props.srcTokenAllowance)) {            
                return
        } else if (cause == 'exeeds-balance' &&                
            (this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, this.props.srcTokenDecimals).value <= this.props.srcTokenBalance)) {
                return
        } else if (cause == 'exeeds-decimals' &&                
            (this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, this.props.srcTokenDecimals).rawFractionalPart.length <= Number(this.props.srcTokenDecimals))) {
                return
        } else if (cause == 'exeeds-dst-decimals' &&                
            (this.valueProcessor.valueToBigInt(this.props.srcTokenAmountToSend, this.props.srcTokenDecimals).rawFractionalPart.length <= Number(this.props.dstDecimals))) {
                return
        } else if (this.state.showFormInputWarning === true && this.state.formInputWarningMsg !== undefined && this.state.formInputWarningCause !== undefined) {       
            return(
                <div className="err-msg d-block form-text">
                    {this.state.formInputWarningMsg}
                </div>
            )
        }    
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
                                                                                           
        return (
            <button
            disabled={disabled}
            className="d-block btn btn-secondary mt-2 px-4 button-bg-3"
            onClick={this.toggleHistoryBridge.bind(this)}>{phrase}</button>
        )              
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
            if (this.props.nonNativeConnection.web3Extension === undefined || this.props.nonNativeConnection.web3Extension?.provider === undefined) {
                return (
                    <a className="link-primary transition-item" href="https://metamask.io/download/">
                        <Button                        
                            className="d-flex align-items-center justify-content-center w-100 btn btn-secondary mb-2 px-4 button-bg-3 mt-4">
                            <div className="mr-2">Install Metamask</div>
                            <img src={metamaskLogo} width="24" height="24"/>
                        </Button>
                  </a>                    
                )
            } else if (!this.props.nonNativeConnection.web3ExtensionAccountId &&
               (this.props.fromBlockchain?.type === 'eth' || this.props.toBlockchain?.type === 'eth')) {
                disabled = false;
                action = this.connectWeb3Ext.bind(this);
                title = 'Connect Ethereum Wallet';
            } else if (
                this.props.nonNativeConnection.web3ExtensionAccountId && this.props.fromBlockchain?.type === 'eth') {
                disabled = this.props.pubkey === undefined ||
                           this.props.nonNativeConnection.web3ExtensionAccountId === undefined ||
                           this.props.nonNativeConnection.web3Extension?.provider?.chainId !== this.props.fromBlockchain?.web3ExtensionChainId ||
                           this.props.srcTokenAllowance == undefined ||
                           this.props.srcTokenBalance == undefined ||
                           this.props.srcTokenDecimals == undefined ||
                           this.props.srcTokenAmountToSend == undefined ||
                           (this.props.srcTokenAmountToSend != undefined && (isNaN(this.props.srcTokenAmountToSend) || !(this.props.srcTokenAmountToSend > 0))) ||
                           this.props.toBlockchain == undefined ||
                           this.state.blockConfirmByAmount ||
                           this.props.dstDecimals === undefined;
                action = this.lockEth.bind(this);
            } else if (this.props.fromBlockchain?.type === 'enq') {
                disabled = this.props.net.url !== this.props.fromBlockchain?.enqExtensionChainId || 
                           this.props.pubkey === undefined ||
                           this.props.srcTokenHash == undefined ||
                           this.props.srcTokenBalance == undefined ||
                           this.props.srcTokenDecimals == undefined ||
                           this.props.srcTokenAmountToSend == undefined ||
                           (this.props.srcTokenAmountToSend != undefined && (isNaN(this.props.srcTokenAmountToSend) || !(this.props.srcTokenAmountToSend > 0))) ||
                           this.props.toBlockchain == undefined ||
                           this.state.blockConfirmByAmount ||
                           this.props.dstDecimals === undefined;
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

    getTxStatusString(status) {
        let str = undefined;
        if (status === true)
            str = 'Success';
        else if (status === false)
            str = 'Failed';
        return str
    }

    getTxPageUrl(chainId, txHash) {
        let txPageUrl = undefined;
        if (txHash !== undefined && chainId !== undefined && !isNaN(chainId)) {
            let chain = this.availableNetworksUtils.getChainById(chainId);
            if (chain !== undefined && chain.txPageUrl !== undefined)
                txPageUrl = `${chain.txPageUrl}${txHash}`;            
        }

        return txPageUrl;
    }

    getChainName(chainId) {
        let chainName = undefined;
        if (chainId !== undefined && !isNaN(chainId)) {
            let chain = this.availableNetworksUtils.getChainById(chainId);
            if (chain !== undefined && chain.name !== undefined)
                chainName = chain.name;            
        }

        return chainName;
    }

    getTxDateTime(timestamp) {
        let txDateTime = '---';
        if (timestamp !== undefined) {
            txDateTime = new Date(timestamp).toLocaleString();
        }

        return txDateTime;
    }

    refineLockData(item) {
        let txPageUrl, txStatusStr, txNetworkName, txDateTime, txHashTrimmed, originTicker;
        let lock = item.lock;
        if (lock !== undefined) {
            txNetworkName = this.getChainName(lock.src_network);
            txPageUrl = this.getTxPageUrl(lock.src_network, lock.transactionHash);
            txStatusStr = this.getTxStatusString(lock.status);
            txDateTime = this.getTxDateTime(lock.timestamp);
            txHashTrimmed = utils.packHashString(lock.transactionHash);
            originTicker = lock.ticker != undefined ? lock.ticker.toUpperCase() : '';                   
        }
        return {
            txNetworkName,
            txPageUrl,
            txStatusStr,
            txDateTime,
            txHashTrimmed,
            originTicker
        }
    }

    refineClaimData(item) {
        let that = this;
        let claimData = {};
        let chainType = undefined;
        let claimInitAlias = undefined;
        let lock = item.lock;        
        let resultTicker = item.validatorRes?.ticket?.ticker !== undefined ? item.validatorRes.ticket.ticker.toUpperCase() : '';
        //console.log(resultTicker)
        if (lock !== undefined) {
            let chain = this.availableNetworksUtils.getChainById(Number(lock.dst_network));
            if (chain !== undefined && chain.type !== undefined) {            
                chainType = chain.type;
                if (chainType === 'eth')
                    claimInitAlias = 'claim';
                else if (chainType === 'enq')
                    claimInitAlias = 'claimInit';
                else 
                    return undefined
            } else 
                return undefined
        } else
            return undefined

            
        if (item[`${claimInitAlias}AttemptsList`] !== undefined && item[`${claimInitAlias}AttemptsList`].length > 0) {
            
            claimData[`${claimInitAlias}List`] = item[`${claimInitAlias}AttemptsList`].map(function(attemptItem) {
                return {
                    txDateTime : that.getTxDateTime(attemptItem[`${claimInitAlias}TxTimestamp`]),
                    claimNetworkName : that.getChainName(lock.dst_network),
                    claimType : claimInitAlias === 'claim' ? 'Claim' : 'Claim Init',
                    txHashTrimmed : utils.packHashString(attemptItem[`${claimInitAlias}TxHash`]),
                    txPageUrl : that.getTxPageUrl(lock.dst_network, attemptItem[`${claimInitAlias}TxHash`]),
                    txStatusStr : that.getTxStatusString(attemptItem[`${claimInitAlias}TxStatus`]),
                    resultTicker
                }
            });
        }

        if (item[`${claimInitAlias}TxHash`] !== undefined) {
            if (claimData[`${claimInitAlias}List`] == undefined)
                claimData[`${claimInitAlias}List`] = [];
            claimData[`${claimInitAlias}List`].push({
                txDateTime : that.getTxDateTime(item[`${claimInitAlias}TxTimestamp`]),
                claimNetworkName : that.getChainName(lock.dst_network),
                claimType : claimInitAlias === 'claim' ? 'Claim' : 'Claim Init',
                txHashTrimmed : utils.packHashString(item[`${claimInitAlias}TxHash`]),
                txPageUrl : that.getTxPageUrl(lock.dst_network, item[`${claimInitAlias}TxHash`]),
                txStatusStr : that.getTxStatusString(item[`${claimInitAlias}TxStatus`]),
                resultTicker
            });
        }

        if (item.claimConfirmAttemptsList !== undefined && item.claimConfirmAttemptsList.length > 0) {
            claimData.claimConfirmList = item.claimConfirmAttemptsList.map(function(attemptItem) {
                return {
                    txDateTime : that.getTxDateTime(attemptItem.claimConfirmTxTimestamp),
                    claimNetworkName : that.getChainName(lock.dst_network),
                    claimType : 'Claim Confirm',
                    txHashTrimmed : utils.packHashString(attemptItem.claimConfirmTxHash),
                    txPageUrl : that.getTxPageUrl(lock.dst_network, attemptItem.claimConfirmTxHash),
                    txStatusStr : that.getTxStatusString(attemptItem.claimConfirmTxStatus),
                    resultTicker
                }
            });
        }

        if (item.claimConfirmTxHash !== undefined) {
            if (claimData.claimConfirmList == undefined)
                claimData.claimConfirmList = [];
            claimData.claimConfirmList.push({
                txDateTime : that.getTxDateTime(item.claimConfirmTxTimestamp),
                claimNetworkName : that.getChainName(lock.dst_network),
                claimType : 'Claim Confirm',
                txHashTrimmed : utils.packHashString(item.claimConfirmTxHash),
                txPageUrl : that.getTxPageUrl(lock.dst_network, item.claimConfirmTxHash),
                txStatusStr : that.getTxStatusString(item.claimConfirmTxStatus),
                resultTicker
            });
        }

        return claimData   
    }

    getBridgeExtendedInfo(item) {
        let lockData = undefined;
        let claimData = undefined;

        if (item !== undefined) {
            return {
                lockData : this.refineLockData(item),
                claimData : this.refineClaimData(item) 
            }
            
        } else
            return undefined
    }

    getBridgeExtendedInfoWidget(item) {
        let info = this.getBridgeExtendedInfo(item);
//console.log(info)
        return (
            <table className="table table-dark table-hover w-100 mt-4" style={{backgroundColor: 'transparent'}}>
                <thead style={{backgroundColor: 'transparent'}}>
                    <th className="font-weight-normal">Action</th>
                    <th>Asset</th>
                    <th className="font-weight-normal">Time</th>
                    <th className="font-weight-normal">Chain</th>                    
                    <th className="font-weight-normal">Tx</th>
                    <th className="font-weight-normal text-right">Status</th>
                </thead>
                {info.lockData !== undefined &&
                    <tr style={{backgroundColor: 'transparent'}} className="text-color4">
                        <td>Lock</td>
                        <td>{info.lockData.originTicker}</td>
                        <td>{info.lockData.txDateTime}</td>
                        <td>{info.lockData.txNetworkName}</td>                        
                        <td>
                            <a
                            href={info.lockData.txPageUrl} 
                            className="text-color3"
                            target="_blank">
                                {info.lockData.txHashTrimmed}</a>
                        </td>
                        <td className="text-right">{info.lockData.txStatusStr}</td>
                    </tr>
                }

                {info.claimData !== undefined && info.claimData.claimList !== undefined && info.claimData.claimList.map((item, index) => (
                        <tr style={{backgroundColor: 'transparent'}} className="text-color4">
                            <td>Claim</td>
                            <td>{item.resultTicker}</td>
                            <td>{item.txDateTime}</td>
                            <td>{item.claimNetworkName}</td>                            
                            <td>
                                <a
                                href={item.txPageUrl} 
                                className="text-color3"
                                target="_blank">
                                    {item.txHashTrimmed}</a>
                            </td>        
                            <td className="text-right">{item.txStatusStr}</td>
                        </tr>
                    ))
                }
                {info.claimData !== undefined && info.claimData.claimInitList !== undefined && info.claimData.claimInitList.map((item, index) => (
                        <tr style={{backgroundColor: 'transparent'}} className="text-color4">
                            <td>Claim Init</td>
                            <td>{item.resultTicker}</td>
                            <td>{item.txDateTime}</td>
                            <td>{item.claimNetworkName}</td>                            
                            <td>
                                <a
                                href={item.txPageUrl} 
                                className="text-color3"
                                target="_blank">
                                    {item.txHashTrimmed}</a>
                            </td>
                            <td className="text-right">{item.txStatusStr}</td>
                        </tr>
                    ))
                }
                {info.claimData !== undefined && info.claimData.claimConfirmList !== undefined && info.claimData.claimConfirmList.map((item, index) => (
                        <tr style={{backgroundColor: 'transparent'}} className="text-color4">
                            <td>Claim Confirm</td>
                            <td>{item.resultTicker}</td>
                            <td>{item.txDateTime}</td>
                            <td>{item.claimNetworkName}</td>                            
                            <td>
                                <a
                                href={item.txPageUrl} 
                                className="text-color3"
                                target="_blank">
                                    {item.txHashTrimmed}</a>
                            </td>
                            <td className="text-right">{item.txStatusStr}</td>
                        </tr>
                    ))
                }
            </table>
        )

    }

    toggleVisibility(item) {
        let active;
        let itemVisibility = {};
        active =  (this.state.hasOwnProperty(item) && this.state[item] === true) ? false : true;
        itemVisibility[item] = active;
        this.setState(itemVisibility);
    }

    getBridgeHistory(layoutContext, historyArr = this.state.history) { //layoutContext all - for whole history, current - for current bridge workflow. Now used only 'all'
        let that = this;

        return (
            <>
                {layoutContext === 'all' &&
                    <div className="mb-3 pt-2">
                        <div className="h5">History</div>
                    </div>
                }                
                <>
                    {historyArr.map((item, index) => (
                        <div
                        data-resume={`${index}-lockHash-${item.lock.transactionHash}-direction-${item.lock.src_network}-${item.lock.dst_network}`}
                        key={`${index}-lock-${item.lock.transactionHash}`}
                        className="bottom-line-1 pb-3 mb-3 bridge-history-item">
                            <div className="d-flex justify-content-between">
                                <div className="mr-3">                                                                   
                                    <div>
                                        {that.getBridgeTxDirectionStr(item)}
                                    </div>
                                    <div className="text-color4">
                                        <span className="mr-2">Amount:</span>
                                        <span>{that.getBridgeTxAmountStr(item)}</span>                                                
                                    </div>
                                    <button
                                    data-link={`${index}-lockHash-${item.lock.transactionHash}-details-active`}
                                    onClick={that.toggleVisibility.bind(that, `${index}-lockHash-${item.lock.transactionHash}-details-active`)}
                                    className="btn btn-info p-1 mt-1 bg-transparent no-focus-effect"
                                    style={{minWidth : '125px'}}>
                                        {that.state.hasOwnProperty(`${index}-lockHash-${item.lock.transactionHash}-details-active`) &&
                                        that.state[`${index}-lockHash-${item.lock.transactionHash}-details-active`] === true ? 'Hide details' : 'Show details'}

                                        <i
                                        className={`fas ml-2 ${(that.state.hasOwnProperty(`${index}-lockHash-${item.lock.transactionHash}-details-active`) &&
                                        that.state[`${index}-lockHash-${item.lock.transactionHash}-details-active`] === true) ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                                        style={{fontSize : '14px'}}/> 
                                    </button>                                            
                                </div>
                                <div className="bridge-history-resume-wrapper">
                                    {that.getControl(item)}
                                </div>                                                                        
                            </div>

                            <div
                                className={that.state.hasOwnProperty(`${index}-lockHash-${item.lock.transactionHash}-details-active`) && that.state[`${index}-lockHash-${item.lock.transactionHash}-details-active`] === true ? 'd-block' : 'd-none'}>
                            {that.getBridgeExtendedInfoWidget(item)}
                            </div>
                        </div>
                    ))}
                    <div className="clear-history-wrapper d-none">
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