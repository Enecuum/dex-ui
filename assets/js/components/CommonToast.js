import React from 'react';
import { Button, Toast } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, components } from '../../store/storeToProps';

import '../../css/common-toast.css';

class CommonToast extends React.Component {
    constructor (props) {
        super(props);        
    };

    render() {
        return (
          <Toast show="true" className="common-toast">
            <Toast.Header>
              {/* <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" /> */}
              <img src="#" className="rounded mr-2" alt="" />
              <strong className="mr-auto">Connected with Metamask</strong>
              <Button variant="outline-info" size="sm">{this.props.info}</Button>{' '}
            </Toast.Header>
            <Toast.Body>Hello, world! This is a toast message.</Toast.Body>
          </Toast>
        );
    };     
};

const WCommonToast = connect(mapStoreToProps(components.TOAST))(CommonToast);

export default WCommonToast;