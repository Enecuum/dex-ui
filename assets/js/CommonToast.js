import React from 'react';
import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
// import ToastHeader from 'react-bootstrap/ToastHeader';
// import ToastBody from 'react-bootstrap/ToastBody';
// import '../css/toast.css';



class CommonToast extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;              
    };

    render() {
        return (
          <Toast show="true">
            <Toast.Header>
              <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
              <strong className="mr-auto">Connected with Metamask</strong>
              <Button variant="outline-info" size="sm">{this.mySwapPage.state.langData.info}</Button>{' '}
            </Toast.Header>
            <Toast.Body>Hello, world! This is a toast message.</Toast.Body>
          </Toast>
        );
    };     
};

export default CommonToast;