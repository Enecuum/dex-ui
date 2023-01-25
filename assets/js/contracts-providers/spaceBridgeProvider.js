import BridgeHistoryProcessor from "./../utils/BridgeHistoryProcessor";
import Web3 from "web3"

class SpaceBridgeProvider {
	constructor(provider, abi, contractAddress) {
		this.web3 = new Web3(provider);
		this.spaceBridgeContract = new this.web3.eth.Contract(abi, contractAddress);
		this.bridgeHistoryProcessor = new BridgeHistoryProcessor();
	}

	async lock(src_address, src_network, dst_address, dst_network, token_amount, token_hash, token_decimals, ticker, callback = undefined) {
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
									transactionHash : res,
									src_address,
									src_network,
									dst_address,
									dst_network,
									token_amount,
									token_hash,
									token_decimals,
									ticker
								}					
				};

				let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
				if (bridgeHistoryArray.length > 0) {
					let itemIsExist = bridgeHistoryArray.find(function(elem) {
						if ((elem.initiator.includes(src_address) || elem.initiator.includes(dst_address)) && elem.lock?.transactionHash === res)
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

	async send_claim_init(params, signatures, from_address, elemLockTransactionHash = undefined) {
		console.log('query SpaceBridgeProvider send_claim_init');
		let that = this;

		let ticket = [
				params.ticket.dst_address,
				params.ticket.dst_network,
				BigInt(params.ticket.amount),
				window.Buffer.from(params.ticket.src_hash, 'hex'),
				window.Buffer.from(params.ticket.src_address, 'hex'),
				params.ticket.src_network,
				window.Buffer.from(params.ticket.origin_hash, 'hex'),
				params.ticket.origin_network,
				params.ticket.nonce,
				"wrapped",
				params.ticket.ticker
			];


		return this.spaceBridgeContract.methods.claim(ticket, signatures).send(
			{ from: from_address },
			function (err, res) {
				console.log('SpaceBridgeProvider send_claim_init res', res)
			if (err) {
				console.log("An error occured", err)
				return
			} else {
				let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
				let updatedHistory = bridgeHistoryArray.map(elem => {
					if ((elem.initiator.includes(params.ticket.dst_address) || elem.initiator.includes(params.ticket.src_address)) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === elemLockTransactionHash) {
						elem.claimTxHash = res;
					}
					return elem
				});

				localStorage.setItem('bridge_history', JSON.stringify(updatedHistory));
			}
			console.log("send: " + res)			
		})
	}
}

export default SpaceBridgeProvider