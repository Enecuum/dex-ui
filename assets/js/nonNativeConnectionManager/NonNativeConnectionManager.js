import WalletConnectManager from './../connectors/WalletConnectManager';
import MetamaskConnectManager from './../connectors/MetamaskConnectManager';

class NonNativeConnectionManager {
    constructor (rootStoreMethods) {
        this.rootStoreMethods = rootStoreMethods;
    };

    async initializeProviders() {        
        let rootStoreMethodsWC = {
            updateWalletConnectAccountId   : this.rootStoreMethods.updateWalletConnectAccountId,
            updateWalletConnect            : this.rootStoreMethods.updateWalletConnect,
            updateWalletConnectChain       : this.rootStoreMethods.updateWalletConnectChain,
            updateWalletConnectIsConnected : this.rootStoreMethods.updateWalletConnectIsConnected,
            updateWalletConnectWalletTitle : this.rootStoreMethods.updateWalletConnectWalletTitle               
        }

        let rootStoreMethodsWeb3Ext = {
            updateWeb3ExtensionAccountId   : this.rootStoreMethods.updateWeb3ExtensionAccountId,
            updateWeb3Extension            : this.rootStoreMethods.updateWeb3Extension,
            updateWeb3ExtensionChain       : this.rootStoreMethods.updateWeb3ExtensionChain,
            updateWeb3ExtensionIsConnected : this.rootStoreMethods.updateWeb3ExtensionIsConnected,
            updateWeb3ExtensionWalletTitle : this.rootStoreMethods.updateWeb3ExtensionWalletTitle
        }

        this.launchMetamask(rootStoreMethodsWeb3Ext);

        return

        const walletConnectManager = new WalletConnectManager(rootStoreMethodsWC);
        walletConnectManager.subscribeToEvents();
        rootStoreMethodsWC.updateWalletConnect(walletConnectManager);///

        walletConnectManager.connector.on("disconnect", (error, payload) => {
            (async () => {
                this.launchMetamask(rootStoreMethodsWeb3Ext);
            })();            
        });

        walletConnectManager.connector.on("session_update", (error, payload) => {
            (async () => {

                                            // const walletConnectManager = new WalletConnectManager(rootStoreMethodsWC);
                                            // walletConnectManager.subscribeToEvents();
                                            // rootStoreMethodsWC.updateWalletConnect(walletConnectManager);
                //this.launchMetamask(rootStoreMethodsWeb3Ext);
            })();            
        });

        if (walletConnectManager.connector.connected) {
            const walletConnectManager = new WalletConnectManager(rootStoreMethodsWC);
            walletConnectManager.subscribeToEvents();
            rootStoreMethodsWC.updateWalletConnect(walletConnectManager);///
            //this.launchWalletConnect(walletConnectManager);
        } else {
            this.launchMetamask(rootStoreMethodsWeb3Ext);
        }                       
    }

    launchWalletConnect(walletConnectManager) {
        walletConnectManager.subscribeToEvents();
    }

    async launchMetamask(rootStoreMethodsWeb3Ext) {
        console.log('Execute launchMetamask');
        let that = this;
        let timer = undefined;
        let web3ExtensionConnectManager = await new MetamaskConnectManager(rootStoreMethodsWeb3Ext);            
        let sessionState = await web3ExtensionConnectManager.getSessionState();
        console.log(sessionState);            
        let appIsConnected = sessionState !== null ? web3ExtensionConnectManager.appIsConnected(sessionState.account_id) : false;
        rootStoreMethodsWeb3Ext.updateWeb3Extension(web3ExtensionConnectManager);
        console.log('App connected to metamask ', appIsConnected);
        if (appIsConnected) {
            if (timer != undefined)
                clearTimeout(timer);
            this.rootStoreMethods.updateWeb3ExtensionAccountId(sessionState.account_id);
            this.rootStoreMethods.updateWeb3ExtensionChain(sessionState.chain_id);
            this.rootStoreMethods.updateWeb3ExtensionIsConnected(true);
            await web3ExtensionConnectManager.subscribeToEvents();
        } else if (sessionState == null) {
            console.log('-----------------------------------------');
            console.log('Attemt to execute launchMetamask again...');
            console.log('-----------------------------------------');
            timer = setTimeout(() => that.launchMetamask(rootStoreMethodsWeb3Ext), 3000);
        }        
    }
};

export default NonNativeConnectionManager;