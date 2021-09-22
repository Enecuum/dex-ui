import React from 'react';
import { Toast } from 'react-bootstrap';

import '../../css/common-toast.css';

class CommonToast extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            show : true
        }
    }

    closeAction () {
        this.setState({show : false})
        this.props.closeAction()
    }

    render() {
        return (
              <Toast
                  show={this.state.show}
                  className="common-toast"
                  onClose={this.closeAction.bind(this)}
                  delay={(this.props.delay) ? this.props.delay : 3000}
                  autohide={this.props.autoHide}>
                    <Toast.Header className="toast-header" closeButton >
                        {this.props.renderHeader()}
                    </Toast.Header>
                    <Toast.Body className={`${this.props.bodyClass}`}>
                        {this.props.renderBody()}
                    </Toast.Body>
              </Toast>
        )
    }
}

export default CommonToast