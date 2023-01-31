import Web3 from "web3"

class vaultContractProvider {
	constructor(provider, abi, tokenHash) {
		this.web3 = new Web3(provider);
		this.tokenHash = tokenHash || '';

		try {
			this.vaultContract = new this.web3.eth.Contract(abi, tokenHash);
		} catch (err) {			
			this.vaultContract = undefined;
		}		
	}

	async getAllowance(accountId, smartContractAddress) {
		console.log('query vaultContractProvider getAllowance', this.tokenHash, accountId, smartContractAddress);
		let token = this.tokenHash;
		return this.vaultContract.methods.allowance(accountId, smartContractAddress).call(function (err, res) {
            if (err) {
                console.log("An error occured", err, ` Can't get token ${token} allowance for smart contract ${smartContractAddress}`)
                return
            }
		})
	}

	async approveBalance(smartContractAddress, amount, accountId) {
		return this.vaultContract.methods.approve(smartContractAddress, amount).send({ from: accountId }, function (err, res) {
			if (err) {
				console.log("An error occured", err)
				return
			}
			console.log("send: " + res)
		})
	}
}

export default vaultContractProvider