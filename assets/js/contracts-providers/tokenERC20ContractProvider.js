import Web3 from "web3"

class tokenERC20ContractProvider {
	constructor(provider, abi, tokenHash) {
		this.web3 = new Web3(provider);
		this.tokenHash = tokenHash || '';
		this.tokenContract = new this.web3.eth.Contract(abi, tokenHash);
	}

	async getBalanceOf(accountId) {
		console.log('query tokenERC20ContractProvider getBalanceOf', this.tokenHash);
		return this.tokenContract.methods.balanceOf(accountId).call(function (err, res) {
            if (err) {
                console.log("An error occured", err, ` Can't get account ${accountId} balance.`)
                return undefined
            }

			return res
		})
	}

	async getSymbol() {
		console.log('query tokenERC20ContractProvider getSymbol', this.tokenHash);
		let that = this;
		return this.tokenContract.methods.symbol().call(function (err, res) {
            if (err) {
                console.log("An error occured", err, ` Can't get token ${that.tokenHash} symbol.`)
                return undefined
            }

			return res
		})
	}

	async getDecimals() {
		console.log('query tokenERC20ContractProvider getDecimals', this.tokenHash);
		let that = this;
		return this.tokenContract.methods.decimals().call(function (err, res) {
            if (err) {
                console.log("An error occured", err, ` Can't get token ${that.tokenHash} decimals.`)
                return undefined
            }

			return res
		})
	}

	async getAllowance(accountId, smartContractAddress) {
		console.log('query tokenERC20ContractProvider getAllowance', this.tokenHash);
		let token = this.tokenHash;
		return this.tokenContract.methods.allowance(accountId, smartContractAddress).call(function (err, res) {
            if (err) {
                console.log("An error occured", err, ` Can't get token ${token} allowance for smart contract ${smartContractAddress}`)
                return
            }
		})
	}

	async getAssetInfo(accountId) {
		let token = this.tokenHash;
		let amount = 0
		if(accountId)
			amount = await this.getBalanceOf(accountId);
		let ticker = await this.getSymbol();
		let decimals = await this.getDecimals();
		return {
			token,   
			amount,  
			ticker,  
			decimals
		}
	}

	async approveBalance(smartContractAddress, amount, accountId) {
		return this.tokenContract.methods.approve(smartContractAddress, amount).send({ from: accountId }, function (err, res) {
			if (err) {
				console.log("An error occured", err)
				return
			}
			console.log("send: " + res)
		})
	}

	async deposit(accountId, amount) {
		return this.tokenContract.methods.deposit().send({
				from  : accountId,
				value : amount
			},
			function (err, res) {
			if (err) {
				console.log("An error occured", err)
				return
			}
			console.log("send: " + res)
		})
	}

	async withdraw(accountId, amount) {
		return this.tokenContract.methods.withdraw(amount).send({from: accountId}, function (err, res) {
			if (err) {
				console.log("An error occured", err)
				return
			}
			console.log("send: " + res)
		})
	}
}

export default tokenERC20ContractProvider