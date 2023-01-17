import erc20TokenABI from './../ABI/abi_erc20';
import spaceBridgeABI from './../ABI/abi_spaceBridge.json';
import wethABI from './../ABI/abi_weth.json';

export const defaultParams = {
    chain : '0x1'
}

export const bridgeNets = [
    {
        id : 11,
        name : 'f3-dev'
    },
    {
        id : 1,
        name : 'BIT',
        url : 'https://bit.enecuum.com/'
    },
    {
        id : 5,
        name : 'Goerly'
    }
]

// export const bridgeTxStatuses = [
//     {}
// ]

export const netProps = {
    '0x1' : {
        name              : 'Ethereum mainnet',
        alias             : 'Ethereum',
        explorer          : 'https://etherscan.io',
        nativeTokenTicker : 'ETH',
        infuraURL         : 'https://mainnet.infura.io/v3/17879373fe7149679706d5d2cd1e55da',
        //wethAddr          : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    },
    '0x5' : {
        name              : 'Goerli test network',
        alias             : 'Görli',
        explorer          : 'https://goerli.etherscan.io',
        nativeTokenTicker : 'görETH',
        infuraURL         : 'https://goerli.infura.io/v3/97db9b69e4594bc196f95bc02dfbd076',
        wethAddr          : '0xd050e000eEF099179D224cCD3964cc4B683383F1',
        usdcAddr          : '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C'
        //0xFb2878B9967BA13e467cEDb722E2496112F78722
    },
    'unknown' : undefined
}

export const smartContracts = {
    erc20token : {
        ABI :  erc20TokenABI
    },
    weth : {        
        ABI  : wethABI
    },
    spaceBridge : {
        address : '0x2987A5490c974211A216C48b00620dA45e6C3C99',
        ABI : spaceBridgeABI
    }
}