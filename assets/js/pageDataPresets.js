const startToken = '...';

class Presets {
    constructor () {
        this.network = {
            genesisPubKey : '029dd222eeddd5c3340e8d46ae0a22e2c8e301bfee4903bcf8c899766c8ceb3a7d',
            nativeToken : {
                name : 'ENQ',
                hash : '0000000000000000000000000000000000000000000000000000000000000000',
                fee : 100000000
            },
            defaultNet : 'BIT'
        };

        this.langData = {
            siteLocales : ['rus', 'eng'],
            langTitles : {
                eng : {
                    full : 'English',
                    short : 'En'
                },
                rus : {
                    full : 'Русский',
                    short : 'Ru'
                }
            },
            preferredLocale : ['eng'],
            navbars : {
                left : [],
                top : {
                    connectionCard : {}
                }
            },
            trade : {
                switch : {},
                swapCard : {
                    exchange : {},
                    liquidity : {},
                    submitButton : {}
                },
                tokenCard : {}
            }
        };
    };
};

export default Presets;