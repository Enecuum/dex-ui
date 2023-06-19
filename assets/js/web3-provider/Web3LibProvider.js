import BridgeHistoryProcessor from "./../utils/BridgeHistoryProcessor";

class Web3LibProvider {
	constructor(provider) {
		this.web3 = new Web3(provider);
		this.bridgeHistoryProcessor = new BridgeHistoryProcessor();
	}

	// async lock(dst_address, dst_network, token_amount, token_hash) {
	// 	console.log('query SpaceBridgeProvider lock');
	// 	return this.spaceBridgeContract.methods.lock().send({
	// 			dst_address  : dst_address,
	// 			dst_network  : dst_network,
	// 			amount		 : token_amount,
	// 			hash         : token_hash
	// 		},
	// 		function (err, res) {
	// 		if (err) {
	// 			console.log("An error occured", err)
	// 			return
	// 		}
	// 		console.log("send: " + res)
	// 	})
	// }

	// async lock(src_address, src_network, dst_address, dst_network, token_amount, token_hash, token_decimals, ticker, callback = undefined) {
	// 	console.log('query SpaceBridgeProvider lock');
	// 	let that = this;
	// 	return this.spaceBridgeContract.methods.lock(dst_address, dst_network, token_amount, token_hash).send(
	// 		{ from: src_address },
	// 		function (err, res) {
	// 		if (err) {
	// 			console.log("An error occured", err)
	// 			return
	// 		} else {
	// 			let accountInteractToBridgeItem = {
	// 				initiator : `${src_address}_${dst_address}`,
	// 				lock 	  : {
	// 								transactionHash : res,
	// 								src_address,
	// 								src_network,
	// 								dst_address,
	// 								dst_network,
	// 								token_amount,
	// 								token_hash,
	// 								token_decimals,
	// 								ticker
	// 							}					
	// 			};

	// 			let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
	// 			if (bridgeHistoryArray.length > 0) {
	// 				let itemIsExist = bridgeHistoryArray.find(function(elem) {
	// 					if (elem.initiator === `${src_address}_${dst_address}` && elem.lock?.transactionHash === res)
	// 						return true
	// 				});

	// 				if (itemIsExist !== undefined)
	// 					return
	// 				else
	// 					that.bridgeHistoryProcessor.addBridgeHistoryItem(accountInteractToBridgeItem);
	// 			} else {
	// 				that.bridgeHistoryProcessor.initiateHistoryStorage(accountInteractToBridgeItem);
	// 			}
	// 		}
	// 		console.log("send: " + res)
	// 		console.log(callback)
	// 		if (callback !== undefined) {
	// 			callback(res)
	// 		}
	// 	})
	// }

	async getTxReceipt(txHash, txType = '') {
		return this.web3.eth.getTransactionReceipt(txHash).then(function(receipt) {
                    //console.log(receipt);
                    return receipt
                }, function(err) {
                	console.log(`Get ${txType} Tx receipt error: `, err );
                });
	}

	// async send_claim_init(params, signatures, src_address) {
	// 	console.log('query SpaceBridgeProvider send_claim_init');
	// 	let that = this;

	// 	let ticket = [
	// 			params.ticket.dst_address,
	// 			params.ticket.dst_network,
	// 			params.ticket.amount,
	// 			window.Buffer.from(params.ticket.src_hash, 'hex'),
	// 			window.Buffer.from(params.ticket.src_address, 'hex'),
	// 			params.ticket.src_network,
	// 			window.Buffer.from(params.ticket.origin_hash, 'hex'),
	// 			params.ticket.origin_network,
	// 			params.ticket.nonce,
	// 			"wrapped",
	// 			params.ticket.ticker
	// 		];


	// 	return this.spaceBridgeContract.methods.claim(ticket, signatures).send(
	// 		{ from: src_address },
	// 		function (err, res) {
	// 		if (err) {
	// 			console.log("An error occured", err)
	// 			return
	// 		}
	// 		console.log("send: " + res)			
	// 	})
	// }
}

export default Web3LibProvider