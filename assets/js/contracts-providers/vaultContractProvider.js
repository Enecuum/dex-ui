class vaultContractProvider {
	constructor(provider, abi, tokenHash) {
		this.web3 = new window.Web3(provider);
		this.tokenHash = tokenHash || '';

		try {
			this.vaultContract = new this.web3.eth.Contract(abi, tokenHash);
		} catch (err) {			
			this.vaultContract = undefined;
		}		
	}

	async getAllowance(accountId, smartContractAddress) {
		console.log('query vaultContractProvider getAllowance', this.tokenHash, accountId, smartContractAddress);
		return this.vaultContract.methods.allowance(accountId, smartContractAddress).call();
	}

	async approveBalance(smartContractAddress, amount, accountId) {
		return this.vaultContract.methods.approve(smartContractAddress, amount).send({ from: accountId });
	}
}

export default vaultContractProvider