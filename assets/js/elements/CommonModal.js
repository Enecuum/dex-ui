import React from 'react'
import { Modal } from 'react-bootstrap'


class CommonModal extends React.Component {
    constructor (props) {
        super(props);
    };

    render() {
        return (
            <Modal
                show={(this.props.showMode) ? this.props.showMode : true}
                className={(this.props.modalClassName) ? this.props.modalClassName : ''}
                aria-labelledby="custom-modal-styling-title"
                onHide={this.props.closeAction.bind(this.props)}
                centered
                animation={false}
            >
                <Modal.Header closeButton className="pb-0">
                    {this.props.renderHeader()}
                </Modal.Header>
                <Modal.Body>
                    {this.props.renderBody()}
                </Modal.Body>
            </Modal>
        );
    };
}

export default CommonModal