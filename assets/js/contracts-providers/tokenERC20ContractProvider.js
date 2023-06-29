class tokenERC20ContractProvider {
	constructor(provider, abi, tokenHash) {
		this.web3 = new window.Web3(provider);
		this.tokenHash = tokenHash || '';

		try {
			this.tokenContract = new this.web3.eth.Contract(abi, tokenHash);
		} catch (err) {			
			this.tokenContract = undefined;
		}		
	}

	async getBalanceOf(accountId) {
		console.log('query tokenERC20ContractProvider getBalanceOf', this.tokenHash);
		let res = await this.tokenContract.methods.balanceOf(accountId).call();
		return res.toString();
	}

	async getSymbol() {
		console.log('query tokenERC20ContractProvider getSymbol', this.tokenHash);
		let res = await this.tokenContract.methods.symbol().call();
		return res
	}

	async getDecimals() {
		console.log('query tokenERC20ContractProvider getDecimals', this.tokenHash);
		let res = await this.tokenContract.methods.decimals().call()
		return Number(res);
	}

	async getAllowance(accountId, smartContractAddress) {
		console.log('query tokenERC20ContractProvider getAllowance', this.tokenHash, accountId, smartContractAddress);
		let res = await this.tokenContract.methods.allowance(accountId, smartContractAddress).call();
		return res.toString();
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
		return this.tokenContract.methods.approve(smartContractAddress, amount).send({ from: accountId });
	}

	async deposit(accountId, amount) {
		return this.tokenContract.methods.deposit().send({
				from  : accountId,
				value : amount
			});
	}

	async withdraw(accountId, amount) {
		return this.tokenContract.methods.withdraw(amount).send({from: accountId});
	}
}

export default tokenERC20ContractProvider