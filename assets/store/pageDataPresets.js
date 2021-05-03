const presets =  {
    network : {
        genesisPubKey: '029dd222eeddd5c3340e8d46ae0a22e2c8e301bfee4903bcf8c899766c8ceb3a7d',
        nativeToken: {
            ticker: 'BIT',
            hash: '0000000000000000000000000000000000000000000000000000000000000001',
            fee: 1000000000
        },
        defaultNet: {
            name : 'BIT',
            url : 'http://bit.enecuum.com/'
        }
    },

    swapTokens : {
        emptyToken: {
            ticker: 'Select a token',
            hash: undefined,
            caption: ''
        },
        emptyBalance: {
            amount: '-',
            token : undefined,
            ticker: 'Select a token',
            decimals: 0,
            minable: 0,
            reissuables: 0
        }
    },

    langData : {
        siteLocales: ['ru', 'en'],
        langTitles: {
            en: {
                full: 'English',
                short: 'En'
            },
            ru: {
                full: 'Русский',
                short: 'Ru'
            }
        },
        preferredLocale: ['en'],
        navbars: {
            left: [],
            top: {
                connectionCard: {}
            }
        },
        trade: {
            switch: {},
            swapCard: {
                exchange: {},
                liquidity: {},
                submitButton: {}
            },
            tokenCard: {},
            confirmCard : {
                waitingForConfirmationInternals : {
                    swap : {
                    },
                    addLiquidity : {
                    },
                    createPool : { 
                    }
                }
            },
        }
    }
};

export default presets;