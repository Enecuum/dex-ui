import BridgeHistoryProcessor from "./../utils/BridgeHistoryProcessor";
import Web3 from "web3"

class SpaceBridgeProvider {
	constructor(provider, abi, contractAddress) {
		this.web3 = new Web3(provider);
		this.spaceBridgeContract = new this.web3.eth.Contract(abi, contractAddress);
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

	async lock(src_address, dst_address, dst_network, token_amount, token_hash, callback = undefined) {
		console.log('query SpaceBridgeProvider lock');
		let that = this;
		return this.spaceBridgeContract.methods.lock(dst_address, dst_network, token_amount, token_hash).send(
			{ from: src_address },
			function (err, res) {
			if (err) {
				console.log("An error occured", err)
				return
			} else {
				let accountInteractToBridgeItem = {
					initiator : `${src_address}_${dst_address}`,
					lock 	  : {
									transactionHash : res
								}					
				};

				let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
				if (bridgeHistoryArray.length > 0) {
					let itemIsExist = bridgeHistoryArray.find(function(elem) {
						if (elem.initiator === src_address && elem.lock?.transactionHash === res)
							return true
					});

					if (itemIsExist !== undefined)
						return
					else
						that.bridgeHistoryProcessor.addBridgeHistoryItem(accountInteractToBridgeItem);
				} else {
					that.bridgeHistoryProcessor.initiateHistoryStorage(accountInteractToBridgeItem);
				}
			}
			console.log("send: " + res)
			console.log(callback)
			if (callback !== undefined) {
				callback(res)
			}
		})
	}



}

export default SpaceBridgeProvider