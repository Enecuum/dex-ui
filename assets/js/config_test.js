import erc20TokenABI from './../ABI/abi_erc20';
import vaultABI from './../ABI/vault';
import spaceBridgeABI from './../ABI/abi_spaceBridge.json';
import wethABI from './../ABI/abi_weth.json';

export const maxEnqValue = BigInt('18446744073709551615'); //amount in cents
export const bridgeApiURL = 'https://bridge.enex.space/api/v1';

export const availableNetworks = [
    {
        id                    : 111, // Number, hex ???
        web3ExtensionChainId  : undefined, //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : 'https://bit.enecuum.com/',
        name                  : 'BIT', //string
        type                  : 'enq', //'eth', 'enq'
        testnet               : true, //true false 
        available             : true, //true false 
        bridgeContractAddress : undefined, //strig, undefined if not used
        vaultContractAddress  : '', //strig, undefined if not used
        bridgeContractABI     : undefined, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://bit.enecuum.com/', // url to explorer mainpage
        txPageUrl             : 'https://bit.enecuum.com/#!/tx/'  // url to tx page without tx hash
    },
    // {
    //     id                    : 5, // Number, hex ???
    //     web3ExtensionChainId  : '0x5', //strig as in Metamask, undefined if not used,
    //     enqExtensionChainId   : undefined,
    //     name                  : 'Goerli', //string
    //     type                  : 'eth', //'eth', 'enq'
    //     testnet               : true, //true false 
    //     available             : true, //true false 
    //     bridgeContractAddress : '0x0966BF83Ef887ba057B101B109fA491a0C592034', //strig, undefined if not used
    //     vaultContractAddress  : '0x34fFe18F7Cb7367B20947E5968F728e93C66DBE5', //strig, undefined if not used
    //     bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
    //     logo                  : undefined, //image, undefined if not used
    //     explorerURL           : 'https://goerli.etherscan.io', // url to explorer mainpage
    //     txPageUrl             : 'https://goerli.etherscan.io/tx/'  // url to tx page without tx hash
    // },
    {
        id                    : 97, // Number, hex ???
        web3ExtensionChainId  : '0x61', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'BNB Smart Chain Testnet', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : true, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0xB887Add45ff97785b7f99707A1E14D564e8bA65f', //strig, undefined if not used
        vaultContractAddress  : '0x2C8a3a9d360b00e95Bf89e8aA23012fB581a9f95', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://testnet.bscscan.com', // url to explorer mainpage
        txPageUrl             : 'https://testnet.bscscan.com/tx/'  // url to tx page without tx hash
    },
   /* {
        id                    : 80001, // Number, hex ???
        web3ExtensionChainId  : '0x13881', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'Mumbai', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : true, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0x124de276Ac6C4fADe5ec9255ccb27c1d0e9d0826', //strig, undefined if not used
        vaultContractAddress  : '0x748C3924Bc4268cbB6cc1BD0200Cf00c7ea222FC', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://mumbai.polygonscan.com', // url to explorer mainpage
        txPageUrl             : 'https://mumbai.polygonscan.com/tx/'  // url to tx page without tx hash
    },*/
    {
        id                    : 11155111, // Number, hex ???
        web3ExtensionChainId  : '0xaa36a7', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'Sepolia', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : true, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0xE42Bd380502Ea6eccf9CfF440045D2432cCdF2cE', //strig, undefined if not used
        vaultContractAddress  : '0x788F2FCa3366b8DDa4f7A83efA92d4679112976b', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://sepolia.etherscan.io/', // url to explorer mainpage
        txPageUrl             : 'https://sepolia.etherscan.io//tx/'  // url to tx page without tx hash
    }
]


export const smartContracts = {
    erc20token : {
        ABI : erc20TokenABI
    },
    vault : {
        ABI : vaultABI
    },
    // weth : {        
    //     ABI  : wethABI
    // }
}