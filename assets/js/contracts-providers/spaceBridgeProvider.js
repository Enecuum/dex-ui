import BridgeHistoryProcessor from "./../utils/BridgeHistoryProcessor";

class SpaceBridgeProvider {
	constructor(provider, abi, contractAddress) {
		this.web3 = new window.Web3(provider);
		this.spaceBridgeContract = new this.web3.eth.Contract(abi, contractAddress);
		this.bridgeHistoryProcessor = new BridgeHistoryProcessor();
		this.contractHash = contractAddress;
	}

	async lock(src_address, src_network, dst_address, dst_network, token_amount, token_hash, nonce, token_decimals, ticker, callback = undefined) {
		console.log('query SpaceBridgeProvider lock');
		let that = this;
		let txHash;
		await this.spaceBridgeContract.methods.lock(that.web3.utils.asciiToHex(dst_address), dst_network, token_amount, token_hash, nonce).send({ from: src_address })
		.on('transactionHash', transactionHash => {
			console.log('Lock transactionHash ', transactionHash)
	        if (transactionHash) {
	        	txHash = transactionHash
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
									nonce,
	                                timestamp : Date.now()
								}					
				};
				localStorage.setItem(`bh_lock_${txHash}`, JSON.stringify(accountInteractToBridgeItem));

				let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
				// if (bridgeHistoryArray.length > 0) {
				// 	let itemIsExist = bridgeHistoryArray.find(function(elem) {
				// 		if ((elem.initiator.toUpperCase().includes(src_address.toUpperCase()) || elem.initiator.toUpperCase().includes(dst_address.toUpperCase())) && elem.lock?.transactionHash === transactionHash)
				// 			return true
				// 	});

				// 	if (itemIsExist !== undefined)
				// 		return
				// 	else {
				// 		that.bridgeHistoryProcessor.addBridgeHistoryItem(accountInteractToBridgeItem);
				// 	}
				// } else {
				// 	that.bridgeHistoryProcessor.initiateHistoryStorage(accountInteractToBridgeItem);
				// }
			}
    	});
		
		console.log("send: " + txHash);
		if (callback !== undefined) {
			callback(txHash)
		}		
	}

	async send_claim_init(params, from_address, elemLockTransactionHash) {
		console.log('query SpaceBridgeProvider send_claim_init');
		let that = this;
		let txHash;
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
				params.ticket.ticker,
				params.ticket.origin_decimals
			];

		let accountInteractToBridgeItem = {
					initiator : `${params.ticket.src_address}_${params.ticket.dst_address}`,
					validatorRes : params					
				};	

		await this.spaceBridgeContract.methods.claim(ticket, [[params.validator_sign.v, params.validator_sign.r, params.validator_sign.s]]).send({ from: from_address })
		.on('transactionHash', transactionHash => {
			console.log('Claim transactionHash ', transactionHash)
			if (transactionHash) {
				txHash = transactionHash;
				accountInteractToBridgeItem.claimTxHash = transactionHash;
				accountInteractToBridgeItem.claimTxTimestamp = Date.now();
				localStorage.setItem(`bh_claim_eth_${txHash}`, JSON.stringify(accountInteractToBridgeItem));
				// let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryArray();
				// let updatedHistory = bridgeHistoryArray.map(elem => {
				// 	if ((elem.initiator.toUpperCase().includes(params.ticket.dst_address.toUpperCase()) || elem.initiator.toUpperCase().includes(params.ticket.src_address.toUpperCase())) && elem.lock.transactionHash !== undefined && elem.lock.transactionHash === elemLockTransactionHash) {
				// 		console.log('UPDATE STORAGE AFTER CLAIM -----------------------------------')
				// 		elem.claimTxHash = transactionHash;
				// 		elem.claimTxTimestamp = Date.now();
				// 	}
				// 	return elem
				// });

				// localStorage.setItem('bridge_history', JSON.stringify(updatedHistory));
			}
		});
		console.log("send: " + txHash);		
	}

	async getTransfer(src_address, src_hash, src_network, dst_address, dst_network) {
		console.log(src_address, src_hash, src_network, dst_address, dst_network)
		try {
			console.log(`query SpaceBridgeProvider getTransfer on contract ${this.contractHash}`);
			let res = await this.spaceBridgeContract.methods.getChannelNonce(src_address, src_hash, src_network, dst_address, dst_network).call();
			return Number(res)
		} catch(e) {
			console.log(`query query SpaceBridgeProvider getTransfer on contract ${this.contractHash} error`, e);
			return undefined;
		}
	}
}

export default SpaceBridgeProvider