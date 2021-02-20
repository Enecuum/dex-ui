class SwapApi {
    constructor () {
        this.url = `https://${location.host}`;
    }

    getTokens () {
        return fetch(`${this.url}/getTokens`,
            {
                method : 'GET'
            }
        );
    };
    getPairs () {
        return fetch(`${this.url}/getPairs`,
            {
                method : 'GET'
            }
        );
    }
};

const swapApi = new SwapApi();