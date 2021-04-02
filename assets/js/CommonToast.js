import React from 'react';
import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import { connect } from 'react-redux';
import { mapStoreToProps, components } from '../store/storeToProps';
// import ToastHeader from 'react-bootstrap/ToastHeader';
// import ToastBody from 'react-bootstrap/ToastBody';
// import '../css/toast.css';



class CommonToast extends React.Component {
    constructor (props) {
        super(props);        
    };

    render() {
        return (
          <Toast show="true">
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