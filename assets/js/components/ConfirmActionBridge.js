import React from 'react';
import CommonModal from "../elements/CommonModal"
import {Button } from 'react-bootstrap'
import ValueProcessor from '../utils/ValueProcessor';

class ConfirmActionBridge extends React.Component {
	constructor(props) {
		super(props);
		this.valueProcessor = new ValueProcessor;
		// this.state = {
		// 	confirmActionVisibility : true
		// }
	}

	renderModalHeader() {
		let action = 'Unknown action';

		return 'Action'
	}

	getActionTitle() {
		return 'Confirm action'
		// let method = this.props.context.state.bridgeActionType;
		// let res = 'Unknown Method';
		// if (this.props.context.allowedMethods.includes(method)) {
		// 	if (method === 'connectWeb3Ext')
		// 		res = 'Connect Web3 Extension';
		// 	else if (method === 'approveSrcTokenBalance')
		// 		res = 'Approve Balance';
		// 	else if (method === 'lockEth' || method === 'encodeDataAndLock')
		// 		res = 'Lock';
		// 	else if (method === 'claimEth' || method === 'reClaimEth' || method === 'claimInitEnq' || method === claimConfirmEnq)
		// 		res = 'Claim';
		// }
		// return res
	}

	getActionDescription() {
		let method = this.props.context.state.bridgeActionType;
		let res = 'Unknown Method';
		if (this.props.context.allowedMethods.includes(method)) {
			if (method === 'connectWeb3Ext')
				res = 'Connect Web3 Extension';
			else if (method === 'approveSrcTokenBalance') {
				res = `Approve ${this.props.context.props.srcTokenTicker} balance`;
			} else if (method === 'lockEth' || method === 'encodeDataAndLock') {
				let ticker = this.props.context.props.srcTokenTicker ? this.props.context.props.srcTokenTicker : undefined;
				let decimals = Number(this.props.context.props.srcTokenDecimals);
				let amountBI = this.valueProcessor.valueToBigInt(this.props.context.props.srcTokenAmountToSend, decimals);
				let amountFormatted;
				if (Number(amountBI.fractionalPart) > 0) {
					amountFormatted = this.valueProcessor.usCommasBigIntDecimals(amountBI.value, decimals, decimals).replace(/0*$/,"");
				} else
					amountFormatted = this.valueProcessor.usCommasBigIntDecimals(amountBI.value, decimals, 2)
				
				res = `Lock ${amountFormatted} ${ticker}`;
			} else if (method === 'claimEth' || method === 'reClaimEth' || method === 'claimInitEnq' || method === 'claimConfirmEnq') {
				let ticker = this.props.context.state.bridgeActionParams.lock?.ticker || this.props.context.state.bridgeActionParams.bridgeItem?.lock?.ticker;	
				if (method === 'claimEth' || method === 'reClaimEth' || method === 'claimConfirmEnq') {
					res = `Claim ${ticker} tokens`;
				} else if (method === 'claimInitEnq') {
					res = `Initialize claim ${ticker} tokens`;
				}
			}
		}
		return res
	}

	executeAction() {
		this.props.context[this.props.context.state.bridgeActionType](this.props.context.state.bridgeActionParams);
		this.closeConfirmCard();
	}

	renderModalBody() {
		return (
			<>

				<div className="text-center h5">{this.getActionDescription()}</div>
				<div>
					<Button
	                        className='btn-secondary mx-auto mt-5 d-block button-bg-3'
	                        onClick={this.executeAction.bind(this)}
	                    >
	                        Confirm 
	                    </Button>
                </div>    
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