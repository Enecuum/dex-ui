import React from 'react'
import {connect} from 'react-redux'
import { withTranslation } from "react-i18next"
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps'

import {cookieProcessor as cp} from "../utils/cookieProcessor"
import lsdp from "../utils/localStorageDataProcessor"

import WalletList from "./WalletList"

import '../../css/close-button.css'
import '../../css/index.css'
import '../../css/wallet-connection.css'
import '../../css/font-style.css'
import swapApi from "../requests/swapApi";

class Connect extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            connectionListVisibility : false
        }
    }

    componentDidMount() {
        this.descriptor = setInterval(() => {
            if (document.readyState === "complete") {
                clearInterval(this.descriptor)
                this.checkConnection()
            }
        }, 100)
        this.intervalConnection()
    }

    componentWillUnmount() {
        clearInterval(this.descriptor)
    }

    intervalConnection () {
        setTimeout(() => {
            if (this.connectionStatus)
                ENQweb3lib.enable().then(res => {
                    this.updPubkeys(res.pubkey)
                    this.intervalConnection()
                })
            else 
                this.intervalConnection()
        }, 1000)
    }

    updPubkeys (pubkey) {
        cp.updateSettings(pubkey, '/')
        lsdp.updPubKey(pubkey)
        this.props.assignPubkey(pubkey)
        this.props.updDexData(pubkey)
    }

    checkConnection () {
        ENQweb3lib.connect().then(res => {
            ENQweb3lib.reconnect()
            .then(res => {
                if (res.status === true) {
                    clearInterval(this.descriptor)
                    ENQweb3lib.enable()
                    .then(res => {
                        this.updPubkeys(res.pubkey)
                        this.connectionStatus = true
                        this.props.setConStatus(true)
                    })
                }
            })
        }).catch(() => {})
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

    closeConList () {
        this.setState({connectionListVisibility : false})
    }

    openConList () {
        this.setState({connectionListVisibility : true})
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
                {this.state.connectionListVisibility && <WalletList
                    closeConList = {this.closeConList.bind(this)}
                    updDexData = {this.props.updDexData.bind(this.props)}
                />}
            </>
        )
    }
}

const WConnect = connect(
    mapStoreToProps(components.CONNECT),
    mapDispatchToProps(components.CONNECT)
)(withTranslation()(Connect))

export default WConnect