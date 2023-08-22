/**
 *  @fileoverview Requests to Validator
 */
import {bridgeApiURL} from './../config.js';

class ValidatorRequests { 
    constructor () {
        this.url = `${bridgeApiURL}/notify`;
    }

    async postToValidator(txHash, srcNetwork = undefined) {
        let URL = this.url;      
        return fetch(URL, {
            method: 'POST',
            body: JSON.stringify({networkId : srcNetwork, txHash : txHash}),
            headers: {'Content-Type': 'application/json','Accept': 'application/json'},
            mode: 'cors'
        }).then(function(response) {            
            return response.json().then(res => {
                //console.log(txHash, res);
                return res
            }, err => {
                console.log('Parse notify response failed');
                return null
            })
        }, function(err) {
            console.log('Get notify response failed');
            return null            
        })    
    }   

}

const validatorRequests = new ValidatorRequests();

export default validatorRequests;