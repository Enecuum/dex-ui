import erc20TokenABI from './../ABI/abi_erc20';
import spaceBridgeABI from './../ABI/abi_spaceBridge.json';
import spaceBridgeABI_BNB from './../ABI/abi_spaceBridge_BNB.json';
import wethABI from './../ABI/abi_weth.json';

export const defaultParams = {
    chain : '0x1'
}

export const availableNetworks = [
    {
        id                    : 1, // Number, hex ???
        web3ExtensionChainId  : undefined, //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : 'https://bit.enecuum.com/',
        name                  : 'BIT', //string
        type                  : 'enq', //'eth', 'enq'
        testnet               : true, //true false 
        available             : true, //true false 
        bridgeContractAddress : undefined, //strig, undefined if not used
        bridgeContractABI     : undefined, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://bit.enecuum.com/', // url to explorer mainpage
        txPageUrl             : 'https://bit.enecuum.com/#!/tx/'  // url to tx page without tx hash
    },
    {
        id                    : 5, // Number, hex ???
        web3ExtensionChainId  : '0x5', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'Goerli', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : true, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0x9e400571e3D6d5aFA7e99064B30B2D826Ca4cBbb', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://goerli.etherscan.io', // url to explorer mainpage
        txPageUrl             : 'https://goerli.etherscan.io/tx/'  // url to tx page without tx hash
    },
    {
        id                    : 97, // Number, hex ???
        web3ExtensionChainId  : '0x61', //strig as in Metamask, undefined if not used,
        enqExtensionChainId   : undefined,
        name                  : 'BNB Smart Chain Testnet', //string
        type                  : 'eth', //'eth', 'enq'
        testnet               : true, //true false 
        available             : true, //true false 
        bridgeContractAddress : '0x6286d28B5a5A85f282B95b48C76322Abd11391E1', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI_BNB, //JSON, undefined if not used
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
        bridgeContractAddress : '0xC431CEe35227934fD84732234Af9239C110283Ff', //strig, undefined if not used
        bridgeContractABI     : spaceBridgeABI, //JSON, undefined if not used
        logo                  : undefined, //image, undefined if not used
        explorerURL           : 'https://mumbai.polygonscan.com', // url to explorer mainpage
        txPageUrl             : 'https://mumbai.polygonscan.com/tx/'  // url to tx page without tx hash
    }
]

// export const netProps = {
//     '0x1' : {
//         wethAddr          : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
//     },
//     '0x5' : {
//         wethAddr          : '0xd050e000eEF099179D224cCD3964cc4B683383F1',
//         usdcAddr          : '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C'
//     },
    //'0x13881' {
    //     VV1           : '0xf315Be501b01A7a91D6Bda750CB5168f20f1f2A0',
    //        VV2          : '0x306276B45eB14BfB821170D75619418698fEe535',
    // },
    // '0x61' : { 
    //     'VV3' : '0x85b904cF9e5c8c6a4F525b2a6f67891CF0a05f48',
    //     'VV4' : '0xee8c43810AA04CF225f9eafA2b0F60F8AAb1A31D'
    // }    

// }

export const smartContracts = {
    erc20token : {
        ABI :  erc20TokenABI
    },
    // weth : {        
    //     ABI  : wethABI
    // }
}