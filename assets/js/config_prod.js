import erc20TokenABI from './../ABI/abi_erc20';
import vaultABI from './../ABI/vault';
import spaceBridgeABI from './../ABI/abi_spaceBridge.json';
import wethABI from './../ABI/abi_weth.json';

export const defaultParams = {
    chain : '0x1'
}

export const availableNetworks = [
    {
        id                    : 0, // Number, hex ???
        web3ExtensionChainId  : undefined, //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : 'https://pulse3.enecuum.com/',
        name                  : 'Pulse', //string
        type                  : 'enq', //'eth', 'enq'
        testnet               : false, //true false 
        available             : true, //true false 
        bridgeContractAddress : undefined, //strig, undefined if not used
        vaultContractAddress  : '', //strig, undefined if not used
        bridgeContractABI     : undefined, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://pulse3.enecuum.com/', // url to explorer mainpage
        txPageUrl             : 'https://pulse3.enecuum.com/#!/tx/'  // url to tx page without tx hash
    },
    {
        id                    : 1, // Number, hex ???
        web3ExtensionChainId  : '0x1', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'Ethereum', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : false, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0xdEF8D9e6FB07b7295657F494f9A01E68dC09922D', //strig, undefined if not used
        vaultContractAddress  : '0xD2d23E884b19E3C76dA3607B201BebDcE78F16C8', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://etherscan.io', // url to explorer mainpage
        txPageUrl             : 'https://etherscan.io/tx/'  // url to tx page without tx hash
    },
    {
        id                    : 137, // Number, hex ???
        web3ExtensionChainId  : '0x89', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'Polygon', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : false, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0xc121545Df72941dDf11a5F23D19B54a6c09a85DF', //strig, undefined if not used
        vaultContractAddress  : '0xA069dd1aaaA1B55241c7437bbB023A0020897d5B', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://polygonscan.com', // url to explorer mainpage
        txPageUrl             : 'https://polygonscan.com/tx/'  // url to tx page without tx hash
    },
    {
        id                    : 10, // Number, hex ???
        web3ExtensionChainId  : '0xa', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'Optimism', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : false, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0x968B813cE7f35eaba1DCa323ABd12FC29d166FEF', //strig, undefined if not used
        vaultContractAddress  : '0x02e8A71ad496efca18b2522427096Fb0D849f3Ec', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://optimistic.etherscan.io', // url to explorer mainpage
        txPageUrl             : 'https://optimistic.etherscan.io/tx/'  // url to tx page without tx hash
    },
    {
        id                    : 42161, // Number, hex ???
        web3ExtensionChainId  : '0xa4b1', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'Arbitrum One', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : false, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0xdEF8D9e6FB07b7295657F494f9A01E68dC09922D', //strig, undefined if not used
        vaultContractAddress  : '0xD2d23E884b19E3C76dA3607B201BebDcE78F16C8', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://arbiscan.io', // url to explorer mainpage
        txPageUrl             : 'https://arbiscan.io/tx/'  // url to tx page without tx hash
    },
    {
        id                    : 56, // Number, hex ???
        web3ExtensionChainId  : '0x38', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'BNB Smart Chain', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : false, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0xdEF8D9e6FB07b7295657F494f9A01E68dC09922D', //strig, undefined if not used
        vaultContractAddress  : '0xD2d23E884b19E3C76dA3607B201BebDcE78F16C8', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://bscscan.com', // url to explorer mainpage
        txPageUrl             : 'https://bscscan.com/tx/'  // url to tx page without tx hash
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