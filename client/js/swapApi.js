class SwapApi {
    constructor () {
        this.url = 'http://localhost';
        this.port = 1234;
    }

    getTokens () {
        return fetch(`${this.url}:${this.port}/getTokens`,
            {
                method : 'GET'
            }
        );
    };
    getPairs () {
        return fetch(`${this.url}:${this.port}/getPairs`,
            {
                method : 'GET'
            }
        );
    }
};

const swapApi = new SwapApi();