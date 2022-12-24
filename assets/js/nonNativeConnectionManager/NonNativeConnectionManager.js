import WalletConnectManager from './../connectors/WalletConnectManager';
import MetamaskConnectManager from './../connectors/MetamaskConnectManager';
import chainsConfig from './chainsConfig';

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

        const walletConnectManager = new WalletConnectManager(rootStoreMethodsWC);
        walletConnectManager.subscribeToEvents();
        rootStoreMethodsWC.updateWalletConnect(walletConnectManager);///

        walletConnectManager.connector.on("disconnect", (error, payload) => {
            (async () => {
                //this.launchMetamask(rootStoreMethodsWeb3Ext);
            })();            
        });

        walletConnectManager.connector.on("session_update", (error, payload) => {
            (async () => {
                //this.launchMetamask(rootStoreMethodsWeb3Ext);
            })();            
        });

        if (walletConnectManager.connector.connected) {
            const walletConnectManager = new WalletConnectManager(rootStoreMethodsWC);
            walletConnectManager.subscribeToEvents();
            rootStoreMethodsWC.updateWalletConnect(walletConnectManager);///
            //this.launchWalletConnect(walletConnectManager);
        } else {
            //this.launchMetamask(rootStoreMethodsWeb3Ext);
        }                       
    }

    launchWalletConnect(walletConnectManager) {
        walletConnectManager.subscribeToEvents();
    }
};

export default NonNativeConnectionManager;