/** 
 *  @fileoverview Minimal amount of API methods.
 */

class SwapApi {
    constructor () {
        this.url = location.href.replace('/#', '/');
    }

    getTokens () {
        return fetch(`${this.url}tokens`,
            {
                method : 'GET'
            }
        );
    };
    getPairs () {
        return fetch(`${this.url}pools`,
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