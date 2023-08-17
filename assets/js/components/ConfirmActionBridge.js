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

	renderModalBody() {
		return (
			<>
				 <Button
                        className='btn-secondary mx-auto mt-5'
                        onClick={this.props.context[this.props.context.state.bridgeActionType].bind(this.props.context)}
                    >
                        { this.props.context.state.bridgeActionType }
                    </Button>
			</>
		)
	}

	closeConfirmCard () {
        this.props.context.setState({showBridgeActionConfirmModal : false});
    }

	render () {
		return(
			<>
				{this.props.context.state.showBridgeActionConfirmModal && <CommonModal
	                renderHeader={this.renderModalHeader.bind(this)}
	                renderBody={this.renderModalBody.bind(this)}
	                closeAction={this.closeConfirmCard.bind(this)}/>}
            </>    
		)
	}
}

export default ConfirmActionBridge;