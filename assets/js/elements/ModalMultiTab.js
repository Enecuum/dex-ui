import React from "react"

import CommonModal from "../elements/CommonModal"
import {Modal} from "react-bootstrap"


class ModalMultiTab extends React.Component {
    constructor(props) {
        super(props)

        this.tabs = (typeof this.props.tabs === "object" && this.props.tabs !== null) ? this.props.tabs : {"main" : <></>}
    }

    openMainTab () {
        this.props.updPointer("main")
    }

    renderHeader () {
        return (
            <>
                <Modal.Title className="w-100">
                    {this.props.pointer === "main" && this.tabs[this.props.pointer].header ||
                        <>
                            <div className="row">
                                <span className="mx-2 icon-Icon13 back-button"
                                      onClick={() => this.openMainTab()}
                                />
                                <div className="col d-flex justify-content-center">
                                    {this.tabs[this.props.pointer].header}
                                </div>
                            </div>
                        </>
                    }
                </Modal.Title>
            </>
        )
    }

    renderBody () {
        return this.tabs[this.props.pointer].body
    }

    render () {
        return (
            <CommonModal renderHeader={this.renderHeader.bind(this)}
                         renderBody={this.renderBody.bind(this)}
                         closeAction={this.props.closeAction.bind(this.props)}
            />
        )
    }
}

export default ModalMultiTab