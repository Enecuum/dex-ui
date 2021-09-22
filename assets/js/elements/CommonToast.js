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
                    <Toast.Header className="toast-header">
                        {this.props.renderHeader()}
                    </Toast.Header>
                    <Toast.Body>
                        {this.props.renderBody()}
                    </Toast.Body>
              </Toast>
        )
    }
}

export default CommonToast