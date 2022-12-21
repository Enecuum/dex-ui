import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import {Buffer} from 'buffer';
Buffer.from('anything','base64');
window.Buffer = window.Buffer || require("buffer").Buffer;
import {poolsArr, smartContracts, netProps, defaultParams} from './../../config';
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

        //this.subscribeToEvents();
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
            const { chainId, accounts } = this.connector;
            console.log(chainId, accounts)
            this.setWcSessionParams(chainId, accounts);            
        }        
    };

    async sessionUpdateHandler(error, payload) {
        console.log(`connector.on("session_update")`, payload);

        if (error) {
            console.log('session_update error: ', error)
            throw error;
        }

        const { chainId, accounts } = payload.params[0];
        this.setWcSessionParams(chainId, accounts);        
    }
    async connectHandler(error, payload) {
        console.log(`connector.on("connect")`, payload);

        if (error) {
            throw error;
        }
        const { chainId, accounts } = payload.params[0];
        this.setWcSessionParams(chainId, accounts);       
    }
    async disconnectHandler(error, payload) {
        console.log(`connector.on("disconnect")`, payload);

        if (error) {
            throw error;
        }
        
        this.onDisconnect();     
    }

    // onConnect(chainId, accounts) {        
    //     this.setSessionParams(chainId, accounts);
    //     console.log('connect!!!', chainId, accounts);
    // }

    // onSessionUpdate(chainId, accounts) {       
    //     this.setSessionParams(chainId, accounts);
    //     console.log('SessionUpdate!!! ', chainId, accounts);
    // }

    async onDisconnect() {
        this.setAppStoreToDefault();
        this.appStoreMethods.updConnectionType(undefined);
        this.appStoreMethods.updShowAccountModal(false);
        if (this.connector.connected) {
            this.connector.killSession({message : 'killSession by onDisconnect'});
        }       
        console.log('disconnect!!!');
    }

    setWcSessionParams(chainId, accounts) {
        // console.log(chainId, accounts)
        this.appStoreMethods.updConnectData({fieldName : 'chain', value : `0x${chainId}`});
        this.appStoreMethods.updAccountId({fieldName : 'id', value : accounts[0]});
        if (netProps.hasOwnProperty(`0x${chainId}`)) {
            this.appStoreMethods.updProvider({fieldName : 'infura', value : netProps[`0x${chainId}`].infuraURL});                        
        } else {            
            this.appStoreMethods.updProvider({fieldName : 'infura', value : netProps[defaultParams.chain].infuraURL});            
        }
        
        this.appStoreMethods.updConnectionType('connectViaWalletConnect');        
    }

    setAppStoreToDefault() {
        this.appStoreMethods.updAccountId({fieldName : 'id', value : ''});
        this.appStoreMethods.updConnectData({fieldName : 'chain', value : defaultParams.chain});
        this.appStoreMethods.updProvider({fieldName : 'infura', value : netProps[defaultParams.chain].infuraURL});                
    }
}

export default WalletConnectManager