import React from 'react'
import {Modal, DropdownButton, Dropdown} from "react-bootstrap"
import { withTranslation } from "react-i18next"
import Form from "react-bootstrap/Form"

import CommonModal from "../elements/CommonModal"
import RecentTransactions from "./RecentTransactions"

import '../../css/history.css'

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
            <div className="d-flex justify-content-begin mx-4 mb-4 history-filters">
                <DropdownButton
                    variant="info"
                    title="farms"
                    className="d-flex mr-3"
                    size="sm"
                >
                    <Dropdown.Item eventKey="1">Action</Dropdown.Item>
                    <Dropdown.Item eventKey="2">Another action</Dropdown.Item>
                    <Dropdown.Item eventKey="3" active>
                        Active Item
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item eventKey="4">Separated link</Dropdown.Item>
                </DropdownButton>
                <DropdownButton
                    variant="info"
                    title="1h ago"
                    size="sm"
                >
                    <Dropdown.Item eventKey="1">Action</Dropdown.Item>
                    <Dropdown.Item eventKey="2">Another action</Dropdown.Item>
                    <Dropdown.Item eventKey="3" active>
                        Active Item
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item eventKey="4">Separated link</Dropdown.Item>
                </DropdownButton>
            </div>
            <RecentTransactions />
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