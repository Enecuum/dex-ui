import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import {Buffer} from 'buffer';
Buffer.from('anything','base64');
window.Buffer = window.Buffer || require("buffer").Buffer;
                                            //import {poolsArr, smartContracts, netProps, defaultParams} from './../../config';
const bridge = "https://bridge.walletconnect.org";

class WalletConnectManager {
    constructor(appStoreMethods) {     
        this.connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });
        this.appStoreMethods = appStoreMethods;
    }

    async walletConnectInit() {
        if (!this.connector.connected) {           
            await this.connector.connect().catch(() => { this.connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal }) });                   
        }
    };

    subscribeToEvents() {

        if (!this.connector) {
            return;
        }

        this.connector.on('session_update', this.sessionUpdateHandler.bind(this));
        this.connector.on('connect', this.connectHandler.bind(this));
        this.connector.on('disconnect', this.disconnectHandler.bind(this));

        if (this.connector.connected) {
            console.log('connector.connected');
            const { chainId, accounts} = this.connector;
            this.setWcSessionParams(chainId, accounts);            
        }        
    };

    async sessionUpdateHandler(error, payload) {
        console.log(`connector.on("session_update")`, payload);

        if (error) {
            console.log('session_update error: ', error)
            throw error;
        }

        const { chainId, accounts} = payload.params[0];
        this.setWcSessionParams(chainId, accounts);
        this.appStoreMethods.updateWalletConnectIsConnected(true)        
    }
    async connectHandler(error, payload) {
        console.log(`connector.on("connect")`, payload);

        if (error) {
            throw error;
        }
        const { chainId, accounts} = payload.params[0];
        this.setWcSessionParams(chainId, accounts);       
    }
    async disconnectHandler(error, payload) {
        console.log(`connector.on("disconnect")`, payload);

        if (error) {
            throw error;
        }
        
        this.onDisconnect();     
    }

    async onDisconnect() {
        this.setAppStoreToDefault();  
        if (this.connector.connected) {
            this.connector.killSession({message : 'killSession by onDisconnect'});
        }
     
        console.log('disconnect!!!');
    }

    setWcSessionParams(chainId, accounts, walletTitle = undefined) {
        if (accounts[0] !== undefined && chainId !== undefined) {
            this.appStoreMethods.updateWalletConnectIsConnected(true);
            this.appStoreMethods.updateWalletConnectChain(`0x${chainId}`);
            this.appStoreMethods.updateWalletConnectAccountId(accounts[0]);
            this.appStoreMethods.updateWalletConnectWalletTitle(walletTitle);
        } else {
            this.setAppStoreToDefault();

                                        // if (netProps.hasOwnProperty(`0x${chainId}`)) {
                                        //     this.appStoreMethods.updProvider({fieldName : 'infura', value : netProps[`0x${chainId}`].infuraURL});                        
                                        // } else {            
                                        //     this.appStoreMethods.updProvider({fieldName : 'infura', value : netProps[defaultParams.chain].infuraURL});            
                                        // }        
        }
        
    }

    setAppStoreToDefault() {
        this.appStoreMethods.updateWalletConnectIsConnected(false)          
        this.appStoreMethods.updateWalletConnectChain(undefined)       
        this.appStoreMethods.updateWalletConnectWalletTitle(undefined) 
        this.appStoreMethods.updateWalletConnectAccountId(undefined) 
                        //this.appStoreMethods.updProvider({fieldName : 'infura', value : netProps[defaultParams.chain].infuraURL});                
    }
}

export default WalletConnectManager