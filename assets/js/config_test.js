import erc20TokenABI from './../ABI/abi_erc20';
import vaultABI from './../ABI/vault';
import spaceBridgeABI from './../ABI/abi_spaceBridge.json';
import wethABI from './../ABI/abi_weth.json';

export const defaultParams = {
    chain : '0x1'
}

export const maxEnqValue = BigInt('18446744073709551615'); //amount in cents

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
        bridgeContractAddress : '0xa994aa746ba106DEf866B4AA27cAC2C35b0A4678', //strig, undefined if not used
        vaultContractAddress  : '0x9bA80762F115e3A6f2396dB22d74e32E1B46184c', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://testnet.bscscan.com', // url to explorer mainpage
        txPageUrl             : 'https://testnet.bscscan.com/tx/'  // url to tx page without tx hash
    },
    {
        id                    : 80001, // Number, hex ???
        web3ExtensionChainId  : '0x13881', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'Mumbai', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : true, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0x9E7c6500244D2AF33B40Ae9df386f2Df8b188348', //strig, undefined if not used
        vaultContractAddress  : '0x745aA87F9e0cf367B3F603600aaE90E785b11993', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://mumbai.polygonscan.com', // url to explorer mainpage
        txPageUrl             : 'https://mumbai.polygonscan.com/tx/'  // url to tx page without tx hash
    },
    {
        id                    : 11155111, // Number, hex ???
        web3ExtensionChainId  : '0xaa36a7', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'Sepolia', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : true, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0x2F795ec61F302CbcaAc8142804245C649E4d6E49', //strig, undefined if not used
        vaultContractAddress  : '0x22CA93cd9ce9196722DfB1f28F317933eF43dbd0', //strig, undefined if not used
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