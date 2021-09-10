import { withTranslation } from "react-i18next";
import React, {Suspense} from 'react'
import {connect} from 'react-redux'
import {Modal} from 'react-bootstrap'
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps'

import CommonModal from '../elements/CommonModal'

import {cookieProcessor as cp} from "../utils/cookieProcessor"
import lsdp from "../utils/localStorageDataProcessor"

import img from "../../img/logo.png"

import '../../css/close-button.css'
import '../../css/index.css'
import '../../css/wallet-connection.css'
import '../../css/font-style.css'

class Connect extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            connectionListVisibility : false
        }
    }

    componentDidMount() {
        window.onload = this.checkConnection.bind(this)
    }

    checkConnection () {
        ENQweb3lib.connect()
        ENQweb3lib.reconnect()
            .then(res => {
                if (res.status === true)
                    ENQweb3lib.enable()
                        .then(res => {
                            cp.updateSettings(res.pubkey, '/')
                            lsdp.updPubKey(res.pubkey)
                            this.props.assignPubkey(res.pubkey)
                            this.props.updDexData(res.pubkey)
                            this.props.setConStatus(true)
                        })
            })
    }

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
                        this.closeConList()
                    },
                    () => {
                        this.closeConList()
                        this.props.setConStatus(false)
                    })
        }
    }

    renderConnectionButton() {
        const t = this.props.t
        return (
            <button onClick={this.openConList.bind(this)}
                className='btn btn-secondary my-2 my-sm-0 c-co connect-btn d-flex align-items-center justify-content-center'
                type='submit'
                style={{
                    backgroundColor: 'var(--color3)'
                }}
            >
                { t('navbars.top.connect') }
            </button>
        )
    }

    openConList () {
        this.setState({connectionListVisibility : true})
    }

    closeConList () {
        this.setState({connectionListVisibility : false})
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

    renderConnectionList () {
        return (
            <CommonModal
                renderHeader={this.renderModalHeader.bind(this)}
                renderBody={this.renderModalBody.bind(this)}
                closeAction={this.closeConList.bind(this)}
            />
        )
    }

    openConnectionListWhileReload () {
        let res = cp.get().note('reload', true)
        if (res && res['reload'] === "true") {
            cp.set('reload', false, true)
            this.openConList()
        }
    }

    render () {
        this.openConnectionListWhileReload()
        return (
            <>
                {this.renderConnectionButton()}
                {this.state.connectionListVisibility && this.renderConnectionList()}
            </>
        )
    }
}

const WConnect = connect(
    mapStoreToProps(components.CONNECT),
    mapDispatchToProps(components.CONNECT)
)(withTranslation()(Connect))

export default WConnect;