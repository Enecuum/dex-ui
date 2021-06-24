import React from 'react';
import { Toast } from 'react-bootstrap';

import '../../css/common-toast.css';

class CommonToast extends React.Component {
    constructor (props) {
        super(props);        
    };

    render() {
        return (
              <Toast show="true" className="common-toast" onClose={this.props.closeAction.bind(this.props)}>
                    <Toast.Header className="toast-header">
                        {this.props.renderHeader()}
                    </Toast.Header>
                    <Toast.Body>
                        {this.props.renderBody()}
                    </Toast.Body>
              </Toast>
        );
    };     
}

export default CommonToast;