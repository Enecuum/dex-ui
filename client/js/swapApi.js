class SwapApi {
    getTokens () {
        return [
            'ENQ',
            'BTC',
            'ETH',
            'TKN',
            'SVG',
            'RGB',
            'ADT',
            'ADB',
            'USD',
            'DDT',
            'VTB',
            'UPD',
            'UVC',
            'POP',
            'TOP',
            'FAR'
        ];
    };
    getPairs () {
        return [
            {
                token_0 : {
                    name : 'ENQ',
                    volume : 560
                },
                token_1 : {
                    name : 'ETH',
                    volume : 1.4
                }
            }
        ]
    }
};

const swapApi = new SwapApi();