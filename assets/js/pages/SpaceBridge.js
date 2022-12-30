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
import {netProps, smartContracts} from'./../config';
import presets from '../../store/pageDataPresets';
import extRequests from '../requests/extRequests';
import lsdp from "../utils/localStorageDataProcessor";
import BridgeHistoryProcessor from "./../utils/BridgeHistoryProcessor";

import utils from '../utils/swapUtils';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import networkApi from "../requests/networkApi";

class SpaceBridge extends React.Component {
	constructor(props) {
        super(props);
        this.bridgeHistoryProcessor = new BridgeHistoryProcessor();
        this.valueProcessor = new ValueProcessor;
        this.state = {
            initData : undefined,
            confirmData : undefined
        }
        setInterval(() => {
            this.updateUserHistory()
            this.getValidatorRes()
        }, 5000)       
    }


    componentDidUpdate(prevProps) {
        if (prevProps.pubkey !== this.props.pubkey ||
            prevProps.nonNativeConnection.web3ExtensionAccountId !== this.props.nonNativeConnection.web3ExtensionAccountId ||
            prevProps.bridgeDirection !== this.props.bridgeDirection) {
            this.resetStore();
        }
    }

    resetStore() {
        this.props.updCurrentTxHash(undefined);          
        this.props.updateSrcTokenHash('');      
        this.props.updateSrcTokenAllowance(undefined);   
        this.props.updateSrcTokenBalance(undefined);     
        this.props.updateSrcTokenDecimals(undefined);    
        this.props.updateSrcTokenTicker(undefined);      
        this.props.updateSrcTokenAmountToSend(0);
        this.props.updateCurrentBridgeTx(undefined);     
    }

    async updateUserHistory() {
    	let enqExtUserId = this.props.pubkey;
    	let web3ExtUserId = this.props.nonNativeConnection.web3ExtensionAccountId;
    	let userHistory = this.getUserHistory(enqExtUserId, web3ExtUserId);
    	let that = this;
    	if (userHistory.length > 0) {
    		userHistory.forEach(function(elem, index, array) {
    			if (!elem.hasOwnProperty('validatorRes')) {
    				that.postToValidator(elem.lock.transactionHash).then(function(validatorRes) {
    					if (validatorRes.hasOwnProperty('err'))
    						return
    					elem.validatorRes = validatorRes;
    					localStorage.setItem('bridge_history', JSON.stringify(array));
    				});   				
    			}
    		});
    	}
    }

    getUserHistory(enqExtUserId, web3ExtUserId) {
    	let userHistory = [];
    	if(enqExtUserId !== undefined && enqExtUserId !== '' &&
    		web3ExtUserId !== undefined && web3ExtUserId !== '') {
    		let rawHistory = this.bridgeHistoryProcessor.getBridgeHistoryArray();
    		if (rawHistory.length > 0) {
    			userHistory = rawHistory.filter(function(elem) {
    				return elem.initiator.includes(enqExtUserId) && elem.initiator.includes(web3ExtUserId) ? true : false;
    			});
    		}    		
    	}
    	return userHistory;
    }

    // getHistory(userId = '03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8') {
    // 	let userHistory = [];

    // 	let rawHistory = localStorage.getItem('bridge_history');
    // 	if (rawHistory !== undefined) {
    // 		let tmp = JSON.parse(rawHistory);
    // 		if ((typeof tmp === "object") &&
    // 			tmp !== null &&
    // 			tmp.hasOwnProperty(userId) &&
    // 			Array.isArray(tmp[userId]) &&
    // 			tmp[userId].length > 0) {
    // 			userHistory = tmp[userId]
    // 		}
    // 	}
    // 	console.log(userHistory)
    // 	//let userBridgeInteractionHistory = return JSON.parse(localStorage.getItem(concatenatedKey))
    // }

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

	approve1Token() {
		let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
    	let ABI = smartContracts.erc20token.ABI;
    	//let token_hash = netProps['0x5'].wethAddr;
    	let token_hash = netProps['0x5'].usdcAddr;
    	let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

		let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
		let spaceBridgeContractAddress = smartContracts.spaceBridge.address;

		assetProvider.approveBalance(spaceBridgeContractAddress, '1000000000000000000', account_id).then(function(approveTx) {
			console.log(approveTx)
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

    lock001Token() {
    	let that = this;
		let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
    	let ABI = smartContracts.spaceBridge.ABI;
    	let spaceBridgeContractAddress = smartContracts.spaceBridge.address;
    	//let token_hash = netProps['0x5'].wethAddr;
    	let token_hash = netProps['0x5'].usdcAddr;
    	console.log(spaceBridgeProvider, ABI, spaceBridgeContractAddress)
    	let bridgeProvider = new spaceBridgeProvider(dataProvider, ABI, spaceBridgeContractAddress);
    	let src_address = this.props.nonNativeConnection.web3ExtensionAccountId;
    	let dst_address = window.Buffer.from('03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8')
		bridgeProvider.lock(src_address, dst_address, '11', '2', token_hash).then(function(lockTx) {
			console.log('lock responce: ', lockTx)
			// let rawHistory = localStorage.getItem('bridge_history');
			// let neItem = {};
			// if (rawHistory !== undefined) {    		
			// 	let tmp = JSON.parse(rawHistory);
			// 	tmp['03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8'].push({lock : lockTx})				
			// 	localStorage.setItem('bridge_history', JSON.stringify(lockTx));
			// } else {

			// }
			//localStorage.setItem('lockTx_1', JSON.stringify(lockTx));
		});
    }

    async postToValidator(txHash) {
    	//let txHash = '0x2610c9fc3ff2a83b027a3caab63e28f18881466011fe7f271eddfd48c4444be2'; //1
    	//let txHash = '0x42d6a7ab9cbdfb072dc7c0e362ba829e87440610878d291e13397e9e828bf645'; //2
    	//0xf78097523b34087b777725b670be5000881e6bd869507f7b063e01c72d421cd7 //3
    	let src_network = '5';

    	let URL = 'http://95.216.207.173:8080/api/v1/notify';
    	
    	return fetch(URL, {
	        method: 'POST',
	        body: JSON.stringify({networkId : src_network, txHash : txHash}),
	        headers: {'Content-Type': 'application/json','Accept': 'application/json'}
	    }).then(function(response) {  
	        return response.json()
	    }).then(res => {
	    	console.log(res);
	    	localStorage.setItem('validator_notify_1', JSON.stringify(res));
	    	return res
	    });
    }

    claimInitEnecuum() {
    	let parameters = {
    		dst_address    : "03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8",
            dst_network    : "1",
            amount         : "1000000000000000",
            src_hash       : "d050e000eEF099179D224cCD3964cc4B683383F1",
            src_address    : "1E4d77e8cCd3964ad9b10Bdba00aE593DF1112A1",
            src_network    : "5",
            origin_hash    : "d050e000eEF099179D224cCD3964cc4B683383F1",
            origin_network : "5",
            nonce          : "1",
            transfer_id    : "fd7fda80663a9d28810a1d2c312e3d2c1a9a8377d312c66e3d7c3c1dd4b9e4c6",
            ticker         : "BWETH"
    	}

		extRequests.claimInit("03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8", 0, parameters)
        .then(result => {
            console.log('Success', result.hash)
            let interpolateParams, txTypes = presets.pending.allowedTxTypes;
            let actionType = presets.pending.allowedTxTypes.claim_init;
            interpolateParams = {                    
                    ticker : '???'
                }
            lsdp.write(result.hash, 0, actionType, interpolateParams);
            this.props.updCurrentTxHash(result.hash);
        },
        error => {
            console.log('Error')
            //this.props.changeWaitingStateType('rejected');
        });
    }

    claimInitEnecuumTest() {
    	extRequests.claimInitTest("03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8",'01772400016f0f0000170d00compressed_data01500700G6oBQJwHdiyYBpt56QppqZO2t22JyqM7sgH5U7jqv0CC7C6WvhSJmTp3dKAHyO92eEsKMAyoBbEF2Ly1tsBtSHR1dTcMTTNyVaBC/P0/iJMF4NkxW+tWxXSKuJOv9MGj1RiZkX2Ece2KAxKmAy3nBUtckrxBRQG0vfj7nU9urhbOVnevm8JOV73MYFltW+t6yV7pqscuxxH9KHe9tGd4SdSabR7B3cSjD4Q9hgP4pZ3PGxFpwzUBlRbSiPlbPj7h7NtsVdwjvn96Sq9qDvJTzOe0pZgVwh2hDh66cqAt60RBWmOGRgurAO6YPWEau6hgqx2uowQ=').then(result => {
            console.log('Success', result.hash);
            let interpolateParams, txTypes = presets.pending.allowedTxTypes;
            let actionType = presets.pending.allowedTxTypes.claim_init;
            lsdp.write(result.hash, 0, actionType);
            this.props.updCurrentTxHash(result.hash);
        },
        error => {
            console.log('Error')
            //this.props.changeWaitingStateType('rejected');
        });
    }

    claimConfirmEnecuum() {
    	let parameters = {
    		"validator_id"   : "",
            "validator_sign" : "",
            "transfer_id"    : ""
    	}

		extRequests.claimConfirm("03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8", 0, parameters)
        .then(result => {
            console.log('Success', result.hash)
            let interpolateParams, txTypes = presets.pending.allowedTxTypes;
            let actionType = presets.pending.allowedTxTypes.claim_confirm;
            interpolateParams = {                    
                    ticker : '???'
                }
            lsdp.write(result.hash, 0, actionType, interpolateParams);
            this.props.updCurrentTxHash(result.hash);
        },
        error => {
            console.log('Error')
            //this.props.changeWaitingStateType('rejected');
        });
    }    


    claimConfirmTest() {
		extRequests.claimConfirmTest("03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8",'01472500013f0f0000170d00compressed_data01200700G0kB4B2JcayEGyfYKXXS9laXifgB5DEZejketFKLpc8pB8y1gIIEOJCufPCQRandmCx/T4dX//5/zecDYteKbOnxckG4voS2hyITtCXRwJs22cz6jI2cAdxxzSn5Y8SI0A6DGBAhwCu7LWL0K8jAN7qaLN7PBBuWzDE1RlmOmdB9EXbrJokMvXCwmNhHTM0R7LDRCiTjUnKi2K9zg1DGnkpdglsuPrZ4jZ9vGXUtr53iOkwVgj9+evvQzpJoSH16dGLMAapwc6GNS1QwPAHwFw==').then(result => {
            console.log('Success', result.hash);
        },
        error => {
            console.log('Error')
            //this.props.changeWaitingStateType('rejected');
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
				
			//console.log(dataProvider, ABI, token_hash, assetProvider, account_id, spaceBridgeContractAddress)
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


    handleInputENQTokenHashChange(item) {
        //console.log(item.target.value)
        let that = this;
        console.log(that)
        if (!this.props.pubkey) {
            console.log('No Enecuum user id!')
            alert('Please, connect to your Enecuum wallet')
        } else {            
            let token_hash = '0000000000000000000000000000000000000000000000000000000000000000'//item.target.value;
            let account_id = this.props.pubkey;
            //let accountBalancesAll = networkApi.getAccountBalancesAll();

            networkApi.getAccountBalancesAll(account_id)
                .then(res => {
                    console.log(res)
                })

            // assetProvider.getAssetInfo(account_id).then(function(assetInfo) {
            //     console.log(assetInfo)
            //     that.props.updateSrcTokenHash(assetInfo.token);                
            //     that.props.updateSrcTokenBalance(assetInfo.amount);
            //     that.props.updateSrcTokenDecimals(assetInfo.decimals);
            //     that.props.updateSrcTokenTicker(assetInfo.ticker);
            // }, function(assetInfo) {
            //     alert('Error');
            // });

            // assetProvider.getAllowance(account_id, spaceBridgeContractAddress).then(function(allowance) {
            //     console.log(allowance);
            //     that.props.updateSrcTokenAllowance(allowance);
            // },function(err) {
            //     console.log(`Can\'t get allowance for asset ${token_hash}`);
            //     alert('Error');                    
            // });            
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
			bridgeProvider.lock(src_address, dst_address, '11', amount, token_hash, that.props.updateCurrentBridgeTx).then(function(lockTx) {
				console.log('lock result', lockTx);
				// let rawHistory = localStorage.getItem('bridge_history');
				// let neItem = {};
				// if (rawHistory !== undefined) {    		
				// 	let tmp = JSON.parse(rawHistory);
				// 	tmp['03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8'].push({lock : lockTx})				
				// 	localStorage.setItem('bridge_history', JSON.stringify(lockTx));
				// } else {

				// }
				//localStorage.setItem('lockTx_1', JSON.stringify(lockTx));
			});
    	} else {
    		alert('Wrong input data')
    	}
    }


    getValidatorRes () {
        let that = this;
        let userHistory = this.getUserHistory(this.props.pubkey, this.props.nonNativeConnection.web3ExtensionAccountId);
        let res = {
            init : undefined,
            confirm : undefined
        }
        if (this.props.currentBridgeTx !== undefined) {
            let item = userHistory.find(function(elem) {
                return (elem.lock.transactionHash === that.props.currentBridgeTx)
            });
            console.log(item)
            if (item !== undefined && item.validatorRes !== undefined && item.validatorRes.encoded_data?.enq.hasOwnProperty('confirm') && item.validatorRes.encoded_data?.enq.hasOwnProperty('init')) {
                res =  {
                    init : item.validatorRes.encoded_data.enq.init,
                    confirm : item.validatorRes.encoded_data.enq.confirm
                }
            } 
        }        
        this.setState({initData: res.init});
        this.setState({confirmData: res.confirm});
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
            //this.props.changeWaitingStateType('rejected');
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
            //this.props.changeWaitingStateType('rejected');
        });
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

    async encodeLock() {
        let URL =  'http://95.216.207.173:8080/api/v1/encode_lock'

        let src_network = '5';

        let data = {
            "src_network":1,
            "dst_address":"2301",
            "dst_network":23,
            "amount":"304",
            "src_hash":"1b5f5dc5662fabda34be7a24c0f74094a68a057b3427db21eb5f5823962cf9d2",
            "src_address":"02b227742759f854f012077216e205dc49b046ba65f5f4722d6a5d782ce5746d9c"
        }
           
        return fetch(URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json','Accept': 'application/json'}
        }).then(function(response) {  
            return response.json()
        }).then(res => {
            console.log(res);            
            return res
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

    render () {

  //   	let enqExtUserId = this.props.pubkey;
  //   	let web3ExtUserId = this.props.nonNativeConnection.web3ExtensionAccountId;

		// console.log(this.getUserHistory(enqExtUserId, web3ExtUserId));


        return (
            <div id="bridgeWrapper" className='d-flex flex-column justify-content-center align-items-center'>
            	<div className="mb-3 d-none">
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
                        <button onClick={this.encodeLock.bind(this)} className="mr-3">encode_lock</button>
                        {/*<button onClick={this.claimConfirmTest.bind(this)}>Claim confirm Enecuum</button>*/}
                    </div>
                    <div className="mb-5">
                        <button onClick={this.handleInputENQTokenHashChange.bind(this)} className="mr-3">get ENQ Balance</button>
                    </div>
            	</div>
            	

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