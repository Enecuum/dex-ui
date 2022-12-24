
export const defaultParams = {
    chain : '0x1'
}

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
        //wethAddr          : '0xd050e000eEF099179D224cCD3964cc4B683383F1'
    },
    'unknown' : undefined
}