import React from 'react'
import {Modal} from 'react-bootstrap'
import {withTranslation} from "react-i18next";


class BlockTheWindow extends React.Component {
    constructor (props) {
        super(props)
    }

    render() {
        return (
            <Modal
                show={true}
                aria-labelledby="custom-modal-styling-title"
                centered
                animation={false}
            >
                <Modal.Header className="pb-0 d-flex justify-content-center">
                    {this.props.t('blockWindow.header')}
                </Modal.Header>
                <Modal.Body>
                    <div className="tx-state-icon-wrapper bordered d-flex align-items-center justify-content-center mx-auto">
                        <span className="tx-state-icon icon-Icon1"/>
                    </div>
                    <div className="d-flex small justify-content-center mt-4">
                        {this.props.t('blockWindow.text')}
                    </div>
                </Modal.Body>
            </Modal>
        )
    }
}

const WBlockTheWindow = withTranslation()(BlockTheWindow)

export default WBlockTheWindow