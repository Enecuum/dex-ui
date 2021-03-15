class SwapApi {
    constructor () {
        this.url = location.href;
    }

    getTokens () {
        return fetch(`${this.url}getTokens`,
            {
                method : 'GET'
            }
        );
    };
    getPairs () {
        return fetch(`${this.url}getPairs`,
            {
                method : 'GET'
            }
        );
    };
    getLanguage (language) {
        return fetch(`${this.url}getLanguage/${language}`,
            {
                method : 'GET'
            }
        );
    };
    getEnqLib () {
        return fetch(`${this.url}enqlib`,
            {
                method : 'GET'
            }
        );
    };
};

export default SwapApi;