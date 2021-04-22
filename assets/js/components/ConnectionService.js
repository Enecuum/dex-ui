import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import img from '../../img/logo.png';
import '../../css/close-button.css';
import '../../css/index.css';
import '../../css/wallet-connection.css';
import '../../css/font-style.css';

class ConnectionService extends React.Component {
    constructor (props) {
        super(props);
        this.showModal = true;
    }

    async connectToEnq () {
        if (!this.props.connectionStatus)
            await ENQweb3lib.connect();
        await ENQweb3lib.enable()
        .then(res => {
            this.props.assignPubkey(res.pubkey);
            this.props.setConStatus(true);
        },
        () => {
            this.props.setConStatus(false);
        });
        this.props.closeConList();
    };

    render () {
        return (
            <>
              <Modal
                show={this.props.connecionListOpened}
                aria-labelledby="custom-modal-styling-title"
                onHide={this.props.closeConList.bind(this.props)}
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title id="custom-modal-styling-title">
                    {this.props.langData.header}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div onClick={this.connectToEnq.bind(this)} className='enq-wallet d-flex align-items-center'>
                        <p className='col-6'>ENQ Wallet</p>
                        <div className='col-6 d-flex justify-content-end align-items-center' >
                            <div className='c-circle'></div>
                            <img src={img}></img>
                        </div>
                    </div>
                    <div href='#' className='d-flex justify-content-center c-clue'>
                        <span className='icon-Icon4'></span>
                        {this.props.langData.clue}
                    </div>
                </Modal.Body>
              </Modal>
            </>
        );
    }
};

const WConnectionService = connect(mapStoreToProps(components.CONNECTION_SERVICE), mapDispatchToProps(components.CONNECTION_SERVICE))(ConnectionService);

export default WConnectionService;