import React from 'react';
import { Button, Toast } from 'react-bootstrap';

import '../../css/common-toast.css';

class CommonToast extends React.Component {
    constructor (props) {
        super(props);        
    };

    render() {
        return (
          <Toast show="true" className="common-toast">
            <Toast.Header>
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