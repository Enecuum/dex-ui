let trustedTokens = [
    {
        "chainId": 1,
        "address": "0000000000000000000000000000000000000000000000000000000000000001",
        "name": "BIT",
        "symbol": "BIT",
        "decimals": 10,
        "logoURI": "/bit/bit-black.png",
        "extensions": {
            "bridgeInfo": {
                "1": {
                    "tokenAddress": "0xd0d7a9f2021958e51d60d6966b7bbed9d1cb22b5"
                }
            },
        }
    },
    {
        "chainId": 0,
        "address": "0000000000000000000000000000000000000000000000000000000000000000",
        "name": "ENQ",
        "symbol": "ENQ",
        "decimals": 10,
        "logoURI": "/enq/enq-color.png",
        "extensions": {
            "bridgeInfo": {
                "1": {
                    "tokenAddress": "",
                }
            }
        }
    },
    {
        "chainId": 1,
        "address": "824e7b171c01e971337c1b25a055023dd53c003d4aa5aa8b58a503d7c622651e",
        "name": "ENX",
        "symbol": "ENX",
        "decimals": 10,
        "logoURI": "/bit/ENEX-orange.svg",
        "extensions": {
            "bridgeInfo": {
                "1": {
                    "tokenAddress": "",
                }
            }
        }
    },
]

module.exports = trustedTokens