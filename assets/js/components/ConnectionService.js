import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import {cookieProcessor as cp} from "../utils/cookieProcessor";
import lsdp from "../utils/localStorageDataProcessor";

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
            await ENQweb3lib.connect()
        await ENQweb3lib.enable()
        .then(res => {            
            cp.updateSettings(res.pubkey, '/')
            lsdp.updPubKey(res.pubkey)
            this.props.assignPubkey(res.pubkey)
            this.props.updDexData(res.pubkey)
            this.props.setConStatus(true)
            this.props.closeConList()
        },
        () => {
            this.props.closeConList()
            this.props.setConStatus(false)
        })
    };

    render () {
        const t = this.props.t;
        return (
            <>
              <Modal
                show={this.props.connectionListOpened}
                aria-labelledby="custom-modal-styling-title"
                onHide={this.props.closeConList.bind(this.props)}
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title id="custom-modal-styling-title">
                    {t('navbars.top.connectionCard.header')}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div onClick={this.connectToEnq.bind(this)} className='enq-wallet d-flex align-items-center'>
                        <p className='col-6 text-nowrap'>{t('tokenWallet', {'token' : 'ENQ'})}</p>
                        <div className='col-6 d-flex justify-content-end align-items-center' >
                            <div className='c-circle'/>
                            <img src={img} alt="wallet img"/>
                        </div>
                    </div>
                    <a href='https://chrome.google.com/webstore/detail/enecuum/oendodccclbjedifljnlkapjejklgekf' className='d-flex justify-content-center c-clue'>
                        <span className='icon-Icon4'/>
                        {t('navbars.top.connectionCard.clue')}
                    </a>
                </Modal.Body>
              </Modal>
            </>
        );
    }
}

const WConnectionService = connect(mapStoreToProps(components.CONNECTION_SERVICE), mapDispatchToProps(components.CONNECTION_SERVICE))(withTranslation()(ConnectionService));

export default WConnectionService;