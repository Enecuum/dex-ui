import detectEthereumProvider from '@metamask/detect-provider';
                            //import {poolsArr, smartContracts, netProps, defaultParams} from './../../config';

async function detectProvider() {
	return window.okxwallet || detectEthereumProvider().then(async provider => {
		if (provider) {			
			return provider
		} else {
            console.log('Ethereum provider is not defined');
			return undefined
        }
	}, (error) => {
        console.log('Detect Ethereum provider error', error);
        return undefined
    });
}

class MetamaskConnectManager {
    constructor(appStoreMethods) {
        return (async () => {
        	this.appStoreMethods = appStoreMethods;
        	let provider = await detectProvider();        	
        	this.provider = provider;
        	return this
        })();
    }

    async getSessionState() {
        let sessionState = {
            chain_id   : undefined,
            account_id : undefined
        }

        if (this.provider) {
            await this.provider.request({ method: 'eth_chainId' }).then(function(chainID) {
                sessionState.chain_id = chainID;
            });

            await this.provider.request({ method: 'eth_accounts' }).then(function(res) {
                sessionState.account_id = res[0];
            });
        } else
            sessionState = null;
        console.log('sessionState', sessionState);    
        return sessionState;
    }

    appIsConnected(account_id) {
        if (this.provider) {            
            let user_id = localStorage.getItem('user_id');
            console.log('appIsConnected ', user_id !== undefined && user_id !== '' && account_id !== undefined && account_id === user_id);
            return (user_id !== undefined && user_id !== '' && account_id !== undefined && account_id === user_id) ? true : false;
        } else 
            return false
    }

    subscribeToEvents() {
        if (this.provider) {
            this.provider.on('connect', this.connectHandler.bind(this));
            this.provider.on('disconnect', this.disconnectHandler.bind(this));
            this.provider.on('chainChanged', this.chainChangedHandler.bind(this));
            this.provider.on('accountsChanged', this.accountsChangedHandler.bind(this));
            this.provider.on('message', this.messageHandler.bind(this));
        }
    }

    unsubscribeEvents() {
        if (this.provider) {
            console.log('Unsubscribe Metamask Events')
            this.provider.removeAllListeners('connect');
            this.provider.removeAllListeners('disconnect');
            this.provider.removeAllListeners('chainChanged');
            this.provider.removeAllListeners('accountsChanged');
            this.provider.removeAllListeners('message');
        }
    }

    connectHandler(info) {
        console.log('Metamask is connected ',info);
    }

    disconnectHandler(info) {
        console.log('Metamask is disconnected ', info);
        //this.unsubscribeEvents();
    }

    chainChangedHandler(chainID) {
        console.log('Metamask connected to chain ', chainID);
        this.appStoreMethods.updateWeb3ExtensionChain(chainID);
    }

    accountsChangedHandler(accounts) {
        console.log('Account was changed ', accounts[0]);
        if (accounts[0] != undefined) {            
            this.appStoreMethods.updateWeb3ExtensionAccountId(accounts[0]);
        } else if (accounts[0] == undefined) {
            this.unsubscribeEvents();
            this.resetSessionState();
        }
    }

    resetSessionState() {
        console.log('Reset to defaults')
        this.appStoreMethods.updateWeb3ExtensionIsConnected(false);
        this.appStoreMethods.updateWeb3ExtensionChain(undefined);
        this.appStoreMethods.updateWeb3ExtensionAccountId(undefined);
        this.appStoreMethods.updateWeb3ExtensionWalletTitle(undefined);
        localStorage.setItem('user_id', '');

                                                    //this.appStoreMethods.updConnectData({fieldName : 'chain', value : defaultParams.chain});
                                                    //this.appStoreMethods.updProvider({fieldName : 'infura', value : netProps[defaultParams.chain].infuraURL});
                                                    //this.appStoreMethods.updConnectionType(undefined);
    }

    messageHandler(message) {
        console.log('Metamask message ', message);
    }

    async requestAuth() {
        let that = this;
        if (this.provider) {
            return this.provider.request({ method: 'eth_requestAccounts' }).then(function(res) {                
                console.log(res);                
                return res[0];
            }, function(res) {
                console.log(res);
                return undefined;
            });
        } else {
            console.log('There is not Metamask provider. Auth in Metamask is impossible.');
            return undefined;
        }
    }

    disconnectApp() {
        if (this.provider) {
            this.unsubscribeEvents();
            this.resetSessionState();
        }
    }
}



export default MetamaskConnectManager