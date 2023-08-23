import React from 'react';
import CommonModal from "../elements/CommonModal"
import {Button } from 'react-bootstrap'
class ConfirmActionBridge extends React.Component {
	constructor(props) {
		super(props);
		// this.state = {
		// 	confirmActionVisibility : true
		// }
	}

	renderModalHeader() {
		let action = 'Unknown action';

		return 'Action'
	}

	getActionTitle() {
		let method = this.props.context.state.bridgeActionType;
		let res = 'Unknown Method';
		if (this.props.context.allowedMethods.includes(method)) {
			if (method === 'connectWeb3Ext')
				res = 'Connect Web3 Extension';
			else if (method === 'approveSrcTokenBalance')
				res = 'Approve Balance';
			else if (method === 'lockEth' || method === 'encodeDataAndLock')
				res = 'Lock';
			else if (method === 'claimEth' || method === 'reClaimEth' || method === 'claimInitEnq' || method === claimConfirmEnq)
				res = 'Claim';
		}
		return res
	}

	renderModalBody() {
		return (
			<>
				<Button
                        className='btn-secondary mx-auto mt-5'
                        onClick={this.props.context[this.props.context.state.bridgeActionType].bind(this.props.context, this.props.context.state.bridgeActionParams)}
                    >
                        Confirm 
                    </Button>
			</>
		)//{ this.props.context.state.bridgeActionType }
	}

	closeConfirmCard () {
        this.props.context.setState({showBridgeActionConfirmModal : false});
    }

	render () {
		return(
			<>
				{this.props.context.state.showBridgeActionConfirmModal && <CommonModal
	                renderHeader={this.getActionTitle.bind(this)}
	                renderBody={this.renderModalBody.bind(this)}
	                closeAction={this.closeConfirmCard.bind(this)}/>}
            </>    
		)
	}
}

export default ConfirmActionBridge;