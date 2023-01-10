
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


    // approve1Token() {
    //  let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
 //     let ABI = smartContracts.erc20token.ABI;
 //     //let token_hash = netProps['0x5'].wethAddr;
 //     let token_hash = netProps['0x5'].usdcAddr;
 //     let assetProvider = new tokenERC20ContractProvider(dataProvider, ABI, token_hash);

    //  let account_id = this.props.nonNativeConnection.web3ExtensionAccountId;
    //  let spaceBridgeContractAddress = smartContracts.spaceBridge.address;

    //  assetProvider.approveBalance(spaceBridgeContractAddress, '1000000000000000000', account_id).then(function(approveTx) {
    //      console.log(approveTx)
    //  });
    // }



  //   lock001Token() {
  //    let that = this;
        // let dataProvider = this.props.nonNativeConnection.web3Extension.provider;
  //    let ABI = smartContracts.spaceBridge.ABI;
  //    let spaceBridgeContractAddress = smartContracts.spaceBridge.address;
  //    //let token_hash = netProps['0x5'].wethAddr;
  //    let token_hash = netProps['0x5'].usdcAddr;
  //    console.log(spaceBridgeProvider, ABI, spaceBridgeContractAddress)
  //    let bridgeProvider = new spaceBridgeProvider(dataProvider, ABI, spaceBridgeContractAddress);
  //    let src_address = this.props.nonNativeConnection.web3ExtensionAccountId;
  //    let dst_address = window.Buffer.from('03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8')
        // bridgeProvider.lock(src_address, dst_address, '11', '2', token_hash).then(function(lockTx) {
        //  console.log('lock responce: ', lockTx)
        //  // let rawHistory = localStorage.getItem('bridge_history');
        //  // let neItem = {};
        //  // if (rawHistory !== undefined) {          
        //  //  let tmp = JSON.parse(rawHistory);
        //  //  tmp['03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8'].push({lock : lockTx})             
        //  //  localStorage.setItem('bridge_history', JSON.stringify(lockTx));
        //  // } else {

        //  // }
        //  //localStorage.setItem('lockTx_1', JSON.stringify(lockTx));
        // });
  //   }



  //   claimInitEnecuum() {
  //    let parameters = {
  //        dst_address    : "03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8",
  //           dst_network    : "1",
  //           amount         : "1000000000000000",
  //           src_hash       : "d050e000eEF099179D224cCD3964cc4B683383F1",
  //           src_address    : "1E4d77e8cCd3964ad9b10Bdba00aE593DF1112A1",
  //           src_network    : "5",
  //           origin_hash    : "d050e000eEF099179D224cCD3964cc4B683383F1",
  //           origin_network : "5",
  //           nonce          : "1",
  //           transfer_id    : "fd7fda80663a9d28810a1d2c312e3d2c1a9a8377d312c66e3d7c3c1dd4b9e4c6",
  //           ticker         : "BWETH"
  //    }

        // extRequests.claimInit("03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8", 0, parameters)
  //       .then(result => {
  //           console.log('Success', result.hash)
  //           let interpolateParams, txTypes = presets.pending.allowedTxTypes;
  //           let actionType = presets.pending.allowedTxTypes.claim_init;
  //           interpolateParams = {                    
  //                   ticker : '???'
  //               }
  //           lsdp.write(result.hash, 0, actionType, interpolateParams);
  //           this.props.updCurrentTxHash(result.hash);
  //       },
  //       error => {
  //           console.log('Error')
  //           //this.props.changeWaitingStateType('rejected');
  //       });
  //   }

    // claimInitEnecuumTest() {
    //  extRequests.claimInitTest("03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8",'01772400016f0f0000170d00compressed_data01500700G6oBQJwHdiyYBpt56QppqZO2t22JyqM7sgH5U7jqv0CC7C6WvhSJmTp3dKAHyO92eEsKMAyoBbEF2Ly1tsBtSHR1dTcMTTNyVaBC/P0/iJMF4NkxW+tWxXSKuJOv9MGj1RiZkX2Ece2KAxKmAy3nBUtckrxBRQG0vfj7nU9urhbOVnevm8JOV73MYFltW+t6yV7pqscuxxH9KHe9tGd4SdSabR7B3cSjD4Q9hgP4pZ3PGxFpwzUBlRbSiPlbPj7h7NtsVdwjvn96Sq9qDvJTzOe0pZgVwh2hDh66cqAt60RBWmOGRgurAO6YPWEau6hgqx2uowQ=').then(result => {
    //         console.log('Success', result.hash);
    //         let interpolateParams, txTypes = presets.pending.allowedTxTypes;
    //         let actionType = presets.pending.allowedTxTypes.claim_init;
    //         lsdp.write(result.hash, 0, actionType);
    //         this.props.updCurrentTxHash(result.hash);
    //     },
    //     error => {
    //         console.log('Error')
    //         //this.props.changeWaitingStateType('rejected');
    //     });
    // }

  //   claimConfirmEnecuum() {
  //    let parameters = {
  //        "validator_id"   : "",
  //           "validator_sign" : "",
  //           "transfer_id"    : ""
  //    }

        // extRequests.claimConfirm("03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8", 0, parameters)
  //       .then(result => {
  //           console.log('Success', result.hash)
  //           let interpolateParams, txTypes = presets.pending.allowedTxTypes;
  //           let actionType = presets.pending.allowedTxTypes.claim_confirm;
  //           interpolateParams = {                    
  //                   ticker : '???'
  //               }
  //           lsdp.write(result.hash, 0, actionType, interpolateParams);
  //           this.props.updCurrentTxHash(result.hash);
  //       },
  //       error => {
  //           console.log('Error')
  //           //this.props.changeWaitingStateType('rejected');
  //       });
  //   }    


  //   claimConfirmTest() {
        // extRequests.claimConfirmTest("03c91e88967465c44aa2afeab3b87dbeede9bd63dbe4a0121ea02fa3f0f4a4e2a8",'01472500013f0f0000170d00compressed_data01200700G0kB4B2JcayEGyfYKXXS9laXifgB5DEZejketFKLpc8pB8y1gIIEOJCufPCQRandmCx/T4dX//5/zecDYteKbOnxckG4voS2hyITtCXRwJs22cz6jI2cAdxxzSn5Y8SI0A6DGBAhwCu7LWL0K8jAN7qaLN7PBBuWzDE1RlmOmdB9EXbrJokMvXCwmNhHTM0R7LDRCiTjUnKi2K9zg1DGnkpdglsuPrZ4jZ9vGXUtr53iOkwVgj9+evvQzpJoSH16dGLMAapwc6GNS1QwPAHwFw==').then(result => {
  //           console.log('Success', result.hash);
  //       },
  //       error => {
  //           console.log('Error')
  //           //this.props.changeWaitingStateType('rejected');
  //       });      
  //   }

  


    // handleInputENQTokenHashChange(item) {
    //     let that = this;
    //     if (!this.props.pubkey) {
    //         console.log('No Enecuum user id!')
    //         alert('Please, connect to your Enecuum wallet')
    //     } else {            
    //         let token_hash = '0000000000000000000000000000000000000000000000000000000000000000'//item.target.value;
    //         let account_id = this.props.pubkey;

    //         let accountBalancesAll = networkApi.getAccountBalancesAll(this.props.pubkey);

    //         accountBalancesAll.then(result => {           
    //             result.json().then(balancesAll => {                    
    //                 console.log(balancesAll) 
    //                 this.setState({balancesAll: res.init});                                   
    //             });                
    //         }, () => {
    //             console.log('getAccountBalancesAll error')
    //         })

    //         // assetProvider.getAssetInfo(account_id).then(function(assetInfo) {
    //         //     console.log(assetInfo)
    //         //     that.props.updateSrcTokenHash(assetInfo.token);                
    //         //     that.props.updateSrcTokenBalance(assetInfo.amount);
    //         //     that.props.updateSrcTokenDecimals(assetInfo.decimals);
    //         //     that.props.updateSrcTokenTicker(assetInfo.ticker);
    //         // }, function(assetInfo) {
    //         //     alert('Error');
    //         // });

    //         // assetProvider.getAllowance(account_id, spaceBridgeContractAddress).then(function(allowance) {
    //         //     console.log(allowance);
    //         //     that.props.updateSrcTokenAllowance(allowance);
    //         // },function(err) {
    //         //     console.log(`Can\'t get allowance for asset ${token_hash}`);
    //         //     alert('Error');                    
    //         // });            
    //     }
    // }
