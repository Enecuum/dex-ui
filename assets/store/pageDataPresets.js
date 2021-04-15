const presets =  {
    network : {
        genesisPubKey: '029dd222eeddd5c3340e8d46ae0a22e2c8e301bfee4903bcf8c899766c8ceb3a7d',
        nativeToken: {
            ticker: 'ENQ',
            hash: 'b07932c60f6499c7aff2ada0583ee157',
            fee: 100000000
        },
        defaultNet: 'BIT'
    },

    swapTokens : {
        emptyToken: {
            ticker: 'Select a token',
            hash: undefined
        },
        defaultToken: {
            ticker: 'ENQ',
            hash: '123'
        }
    },

    langData : {
        siteLocales: ['rus', 'eng'],
        langTitles: {
            eng: {
                full: 'English',
                short: 'En'
            },
            rus: {
                full: 'Русский',
                short: 'Ru'
            }
        },
        preferredLocale: ['eng'],
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