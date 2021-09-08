import React from 'react'
import { Modal } from "react-bootstrap"
import { withTranslation } from "react-i18next"

import CommonModal from "../elements/CommonModal"
import Form from "react-bootstrap/Form";

class History extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            historyVisibility : false
        }
    }

    renderModalHeader () {
        return(<>
            <Modal.Title id="example-custom-modal-styling-title">
                <div className="d-flex align-items-center justify-content-start">
                    <span className="mr-3">
                        {this.props.t('trade.swapCard.history.header')}
                    </span>
                </div>
            </Modal.Title>
        </>)
    }

    renderModalBody () {
        return(<>
            <div className="mb-4">
                <Form.Control
                    // onChange={}
                    className='text-input-1 form-control'
                    type='text'
                    autoFocus/>
            </div>
            {}
        </>)
    }

    openAction () {
        this.setState({historyVisibility : true})
    }

    closeAction () {
        this.setState({historyVisibility : false})
    }

    renderHistory () {
        return (
            <CommonModal
                closeAction={this.closeAction.bind(this)}
                renderHeader={this.renderModalHeader.bind(this)}
                renderBody={this.renderModalBody.bind(this)}
            />
        )
    }

    render () {
        return (
            <>
                <span className='icon-Icon16 swap-card-top-items' onClick={this.openAction.bind(this)}/>
                {this.state.historyVisibility && this.renderHistory()}
            </>
        )
    }
}

const WHistory = withTranslation()(History)

export default WHistory