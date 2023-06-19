import BridgeHistoryProcessor from "./../utils/BridgeHistoryProcessor";

class SpaceBridgeProvider {
	constructor(provider, abi, contractAddress) {
		this.web3 = new Web3(provider);
		this.spaceBridgeContract = new this.web3.eth.Contract(abi, contractAddress);
		this.bridgeHistoryProcessor = new BridgeHistoryProcessor();
	}

	async lock(src_address, src_network, dst_address, dst_network, token_amount, token_hash, token_decimals, ticker, callback = undefined) {
		console.log('query SpaceBridgeProvider lock');
		let that = this;

		const receipt = await this.spaceBridgeContract.methods.lock(that.web3.utils.asciiToHex(dst_address), dst_network, token_amount, token_hash).send({ from: src_address });
		const transactionHash = receipt.transactionHash;
		if (transactionHash) {
			let accountInteractToBridgeItem = {
				initiator : `${src_address}_${dst_address}`,
				lock 	  : {
								transactionHash : transactionHash,
								src_address,
								src_network,
								dst_address,
								dst_network,
								token_amount,
								token_hash,
								token_decimals,
								ticker,
                                timestamp : Date.now()
							}					
			};

			let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
			if (bridgeHistoryArray.length > 0) {
				let itemIsExist = bridgeHistoryArray.find(function(elem) {
					if ((elem.initiator.toUpperCase().includes(src_address.toUpperCase()) || elem.initiator.toUpperCase().includes(dst_address.toUpperCase())) && elem.lock?.transactionHash === transactionHash)
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
		console.log("send: " + transactionHash);
		if (callback !== undefined) {
			callback(transactionHash)
		}		
	}

	async send_claim_init(params, from_address, elemLockTransactionHash) {
		console.log('query SpaceBridgeProvider send_claim_init');
		let that = this;

		let ticket = [
				params.ticket.dst_address,
				params.ticket.dst_network,
				BigInt(params.ticket.amount),
				params.ticket.src_hash,
				params.ticket.src_address,
				params.ticket.src_network,
				params.ticket.origin_hash,
				params.ticket.origin_network,
				params.ticket.nonce,
				params.ticket.name,
				params.ticket.ticker
			];

		const receipt = await this.spaceBridgeContract.methods.claim(ticket, [[params.validator_sign.v, params.validator_sign.r, params.validator_sign.s]]).send({ from: from_address });
		const transactionHash = receipt.transactionHash;
		if (transactionHash) {
			let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
			let updatedHistory = bridgeHistoryArray.map(elem => {
				if ((elem.initiator.toUpperCase().includes(params.ticket.dst_address.toUpperCase()) || elem.initiator.toUpperCase().includes(params.ticket.src_address.toUpperCase())) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === elemLockTransactionHash) {
					elem.claimTxHash = transactionHash;
					elem.claimTxTimestamp = Date.now();
				}
				return elem
			});

			localStorage.setItem('bridge_history', JSON.stringify(updatedHistory));
		}
		console.log("send: " + transactionHash);		
	}
}

export default SpaceBridgeProvider