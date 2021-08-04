import extRequests from '../requests/extRequests';
class DropFarmProcessor {
	constructor() {
        this.operation = [
            'create_farm',
            'add_funds',
            'put_stake',
            'close_stake',
            'get_reward',
            'increase_stake'
        ];        
	}


    
    executeAction(actionType, pubkey, params) {
        // let farmParameters = {
        //     "stake_token": "1111111111111111111111111111111111111111111111111111111111111111",
        //     "reward_token": "1111111111111111111111111111111111111111111111111111111111111111",
        //     "block_reward": 1n,
        //     "emission": 100n            
        // }

        extRequests.sendTx(pubkey, actionType, params)
        .then(result => {
            console.log('Success', result.hash)
            this.props.updCurrentTxHash(result.hash);
            // this.props.changeWaitingStateType('submitted');
            // this.props.resetStore();
        },
        error => {
            console.log('Error')
            this.props.changeWaitingStateType('rejected');
        });
    }
}

export default DropFarmProcessor;    