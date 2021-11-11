import {cookieProcessor as cp} from "../utils/cookieProcessor";
import lsdp from "../utils/localStorageDataProcessor";
import {Modal} from "react-bootstrap";
import img from "../../img/logo.png";
import CommonModal from "../elements/CommonModal";
import React from "react";
import {withTranslation} from "react-i18next";
import {connect} from "react-redux";
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps";


class WalletList extends React.Component {

    connectToEnq () {
        if (!this.props.connectionStatus) {
            ENQweb3lib.connect()
            ENQweb3lib.enable()
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
        }
    }

    renderModalHeader () {
        return (
            <Modal.Title id="custom-modal-styling-title">
                {this.props.t('navbars.top.connectionCard.header')}
            </Modal.Title>
        )
    }

    renderModalBody () {
        const t = this.props.t
        return (
            <>
                <div onClick={this.connectToEnq.bind(this)} className='enq-wallet d-flex align-items-center'>
                    <p className='col-6 text-nowrap'>{t('tokenWallet', {'token' : 'ENQ'})}</p>
                    <div className='col-6 d-flex justify-content-end align-items-center' >
                        <div className='c-circle'/>
                        <img src={img} alt="wallet img"/>
                    </div>
                </div>
                <a href='https://chrome.google.com/webstore/detail/enecuum/oendodccclbjedifljnlkapjejklgekf'
                   className='d-flex justify-content-center c-clue'
                >
                    <span className='icon-Icon4'/>
                    {t('navbars.top.connectionCard.clue')}
                </a>
            </>
        )
    }

    render () {
        return (
            <CommonModal
                renderHeader={this.renderModalHeader.bind(this)}
                renderBody={this.renderModalBody.bind(this)}
                closeAction={this.props.closeConList}
            />
        )
    }
}

const WWalletList = connect(
    mapStoreToProps(components.WALLET_LIST),
    mapDispatchToProps(components.WALLET_LIST)
)(withTranslation()(WalletList))

export default WWalletList