import React from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import AccountShortInfo from "./AccountShortInfo";

import extRequests from '../requests/extRequests';
import networkApi from "../requests/networkApi";
import swapApi from '../requests/swapApi';
import utils from '../utils/swapUtils';
import ValueProcessor from '../utils/ValueProcessor';
import lsdp from "../utils/localStorageDataProcessor";
import pageDataPresets from "../../store/pageDataPresets";
import BlockTheWindow from "./BlockTheWindow";
import CommonToast from '../elements/CommonToast';
import generateTxText from "../utils/txTextGenerator"
import {withTranslation} from "react-i18next";
import swapUtils from "../utils/swapUtils";

const txTypes = pageDataPresets.pending.allowedTxTypes

const vp = new ValueProcessor();

class IndicatorPanel extends React.Component {
    constructor (props) {
        super(props);
        this.intervalDescriptors = []
        this.intervalDescriptors.push(this.circleUpd())
        // this.intervalDescriptors.push(this.updPendingSpinner())
        this.updStatusesPermition = true
        this.state = {
            txNotificationToasts : {},
            accountInfoVisibility : false,
            pendingVisibility : false,
            blockTheWindow : false
        }
    }

    componentWillUnmount () {
        this.intervalDescriptors.forEach(descriptor => clearInterval(descriptor))
    }

    componentDidMount () {
        this._mounted = true
        this.updData()
    }

    renderPendingIndicator () {
        return(
            <div id="pendingIndicator" className="d-flex align-items-center justify-content-end px-3 mr-3">
                <span className="mr-2">Pending</span>
                <span className="spinner icon-Icon3"/>
            </div>
        )
    }

    changeNet (name, url) {
        swapApi.updUrl(url);
        this.props.changeNetwork(name, url);
    }

    renderWalletInfo () {
        return (
            <div className='wallet-info-wrapper d-flex align-items-center justify-content-end'>
                {this.state.pendingVisibility && this.renderPendingIndicator()}
                <div className='net wallet-info-boxes d-flex align-items-center justify-content-center mr-3'>
                    <span className='text-uppercase mx-2'>{this.props.net.name}</span>
                </div>
                <div className='enx-amount wallet-info-boxes d-flex align-items-center justify-content-center px-3 border-0 mr-0 mr-sm-3'>
                    {this.enx} ENX
                </div>
                <div className='wallet-info-boxes d-none d-sm-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center justify-content-center px-3'>{this.props.coinAmount} {this.props.coinName}</div>
                    <div className='addr wallet-info-boxes d-none d-md-flex align-items-center justify-content-center open-in-explorer hover-pointer'
                         onClick={this.openCloseAccountInfo.bind(this)}>{utils.packAddressString(this.props.pubkey)}</div>
                </div>
                <div id="toastWrapper" className="position-absolute pt-4">
                    {this.state.accountInfoVisibility && <AccountShortInfo
                        openCloseAccountInfo={this.openCloseAccountInfo.bind(this)}
                    />}
                    {this.renderRecentTxNotification()}
                </div>
                {this.state.blockTheWindow && <BlockTheWindow />}
            </div>
        );
    }

    openCloseAccountInfo () {
        this.setState({accountInfoVisibility : !this.state.accountInfoVisibility})
    }

    updData () {
        if (!this._mounted)
            return
        this.updStatuses()
        this.updNetwork()
        let tokenObj = utils.getBalanceObj(this.props.balances, this.props.mainToken)
        let tokenName = utils.getTokenObj(this.props.tokens, this.props.mainToken)
        this.props.updCoinAmount(vp.usCommasBigIntDecimals(tokenObj.amount, tokenObj.decimals))
        this.props.updCoinName(tokenName.ticker)

        if (this.props.networkInfo.dex) {
            let enxCoin = utils.getBalanceObj(this.props.balances, this.props.networkInfo.dex.DEX_ENX_TOKEN_HASH)
            this.enx = vp.usCommasBigIntDecimals(enxCoin.amount, enxCoin.decimals)
        }
    }

    getDecimals (params , type) {
        return new Promise(resolve => {
            if (type === txTypes.pool_swap)
                resolve(swapUtils.getTokenObj(this.props.tokens, params.asset_out).decimals)
            else if (type === txTypes.farm_get_reward) {
                resolve(this.getFarmInfo(params.farm_id).reward_token_decimals)
            }
        })
    }

    // this.props.networkInfo.dex.DEX_ENX_TOKEN_HASH

    getFarmInfo (farmId) {
        return new Promise(resolve => {
            networkApi.getDexFarms(this.props.pubkey, [farmId])
                .then(res => {
                    res.json()
                        .then(farmInfo => resolve(farmInfo))
                })
                .catch(resolve({}))
        })
    }

    getEIndexData (txHash) {
        return new Promise(resolve => {
            networkApi.eIndexByHash(txHash)
                .then(res => {
                    res.json()
                        .then(arr => resolve(arr))
                })
        })
    }

    getObjByRecType (arrData, recType) {
        for (let i = arrData.length - 1; i >= 0; i--)
            if (arrData[i]['rectype'] === recType)
                return arrData[i]
    }

    getFreshInterpolateParams (rawDataSrt, interpolateParams, txHash) {
        return new Promise(resolve => {
            let objData = ENQWeb.Utils.ofd.parse(rawDataSrt)
            const allowedTypes = [txTypes.pool_swap, txTypes.farm_get_reward]
            if (allowedTypes.indexOf(objData.type) !== -1) {
                Promise.allSettled([
                    this.getEIndexData(txHash),
                    this.getDecimals(objData.parameters, objData.type)
                ]).then(results => {
                    let value
                    if (objData.type === txTypes.pool_swap) {
                        value = this.getObjByRecType(results[0].value, 'iswapout').value
                        interpolateParams.value1 = swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(value, results[1].value))
                    } else if (objData.type === txTypes.farm_get_reward) {
                        value = this.getObjByRecType(results[0].value, 'ifrew').value
                        interpolateParams.value0 = swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(value, results[1].value))
                    }
                    resolve(interpolateParams)
                }).catch(() => resolve(interpolateParams))
            } else {
                resolve(interpolateParams)
            }
        })
    }

    updStatuses () {
        if (this.curNet !== this.props.net.url) {
            this.curNet = this.props.net.url
            this.hidePendingIndicator()
        }

        if (this.updStatusesPermition === false)
            return new Promise(resolve => resolve())

        this.updStatusesPermition = false
        return new Promise(resolve => {
            let promises = [], history = lsdp.get.history(), pendingIndicator = false
            for (let hash in history)
                if (history[hash].status == 0)
                    promises.push(swapApi.tx(hash))

            if (promises.length === 0) {
                this.updStatusesPermition = true
                this.hidePendingIndicator()
                resolve()
                return
            }
            Promise.allSettled(promises)
                .then(results => {
                    promises = []
                    for (let result of results) {
                        try {
                            promises.push(
                                result.value.json()
                                    .then(res => {
                                        let oldData = lsdp.get.note(res.hash)[res.hash]
                                        this.getFreshInterpolateParams(res.data, oldData.interpolateParams, res.hash)
                                            .then(interpolateParams => {
                                                this.createToast(res.hash, res.status, oldData.type, interpolateParams)
                                                lsdp.write(res.hash, res.status, oldData.type, interpolateParams)
                                            })
                                    })
                                    .catch(err => pendingIndicator = true)
                            )
                        } catch (err) { pendingIndicator = true }
                    }
                    Promise.all(promises)
                        .then(() => {
                            if (pendingIndicator)
                                this.showPendingIndicator()
                            else
                                this.hidePendingIndicator()
                            this.updStatusesPermition = true
                            resolve()
                        })
                })
        })
    }

    circleUpd () {
        return setInterval(() => {
            this.updData();
        }, 500);
    }

    updMainTokenData (net) {
        let netInfo = this.props.networkInfo
        let actualNativeToken = netInfo.native_token.hash
        if (extRequests.nativeTokenHash !== actualNativeToken) {
            let fee = netInfo.native_token.fee_value
            this.props.updMainTokenData(actualNativeToken, fee)
            extRequests.updNativeTokenData(actualNativeToken, fee, netInfo.origin.publisher)
        }
    }

    updNetwork () {
        extRequests.getProvider(true)
        .then(res => {
            // if (this.state.blockTheWindow)
            //     this.setState({blockTheWindow : false})
            if (!res.lock && res.net) {
                ENQWeb.Enq.provider = res.net
                this.updMainTokenData(res.net)
                networkApi.updUrl(res.net + '/')
                lsdp.updNet(res.net)
                this.changeNet(ENQWeb.Enq.currentProvider.replace(/https?:\/\//, '').replace(/.enecuum\.com/, ''), res.net + '/');                
            }
        },
        err => this.setState({blockTheWindow : true}))
    }

    hidePendingIndicator () {
        this.setState({pendingVisibility : false})
    }

    showPendingIndicator () {
        this.setState({pendingVisibility : true})
    }

    // controlPendingSpinnerVisibility (pendingArray) {
    //     let promises = []
    //     for (let pendingRequest of pendingArray)
    //         promises.push(swapApi.tx(pendingRequest.hash))
    //
    //     Promise.allSettled(promises)
    //         .then(results => {
    //             let allDone = true
    //             promises = []
    //             for (let res of results) {
    //                 promises.push(
    //                     res.value.json()
    //                         .then(res => {
    //                             if (res.status !== 3 && res.status !== 2)
    //                                 allDone = false
    //                         })
    //                         .catch(() => allDone = false)
    //                 );
    //             }
    //             Promise.all(promises)
    //                 .then(() => {
    //                     if (allDone)
    //                         this.hidePendingIndicator()
    //                     else
    //                         this.showPendingIndicator()
    //                 })
    //         })
    // }

    // filterEnexTxs (pendingArray) {
    //     for (let i in pendingArray) {
    //         let data = ENQWeb.Utils.ofd.parse(pendingArray[i].data)
    //         if (Object.keys(pageDataPresets.pending.allowedTxTypes).indexOf(data.type) === -1)
    //             pendingArray.splice(i, 1)
    //     }
    //     return pendingArray
    // }

    // updPendingSpinner () {
    //     return setInterval(() => {
    //         if (this.props.pubkey) {
    //             swapApi.pendingTxAccount(this.props.pubkey)
    //                 .then(res => {
    //                     if (!res.lock)
    //                         res.json()
    //                             .then(pendingArray => {
    //                                 if (Array.isArray(pendingArray) && pendingArray.length !== 0) {
    //                                     pendingArray = this.filterEnexTxs(pendingArray)
    //                                     this.controlPendingSpinnerVisibility(pendingArray)
    //                                 } else {
    //                                     this.hidePendingIndicator()
    //                                 }
    //                             })
    //                 })
    //         }
    //     }, 1000)
    // }

    toastHeader () {
        return(<>
            <div className="mr-auto">
                {/*Transaction completed*/}
            </div>
        </>)
    }

    toastBody (hash, note) {
        let txStatusIcon
        if (note.status === 3)
            txStatusIcon = 'icon-Icon5'
        else if (note.status === 0)
            txStatusIcon = 'spinner icon-Icon3'
        else
            txStatusIcon = 'icon-Icon7'
        return (
            <div>
                <p className={`d-flex justify-content-center px-4 my-0`}>
                    <span className={`d-flex align-items-center notification-item mr-4 ${txStatusIcon}`} />
                    <div className="d-flex text-white">
                        { generateTxText(this.props.t, '', note.type, note.params) }
                    </div>
                </p>
                <a className="d-flex justify-content-center view-in-explorer d-block hover-pointer my-1"
                   href = { this.props.net.url + '#!/tx/' + hash }
                   target = "_blank"
                >
                    {this.props.t('navbars.top.accountShortInfo.viewIn')} Explorer
                </a>
            </div>
        )
    }

    closeAction (id) {
        this.deleteToast(id)
    }

    deleteToast (id) {
        let result = this.state.txNotificationToasts
        delete result[id]
        this.setState({txNotificationToasts : result})
    }

    createToast (id, status, type, interpolateParams) {
        let result = this.state.txNotificationToasts
        result[id] = {
            status : status,
            type : type,
            params : interpolateParams
        }
        // setTimeout(() => {
        //     this.closeAction(id)
        // }, 5000)
        this.setState({txNotificationToasts : result})
    }

    renderRecentTxNotification () {
        let toastsMarkup = []
        for (let id in this.state.txNotificationToasts) {
            toastsMarkup.push(
                <div className='tx-notification-toast' key={id}>
                    <CommonToast
                        renderHeader={this.toastHeader.bind(this)}
                        renderBody={this.toastBody.bind(this, id, this.state.txNotificationToasts[id])}
                        closeAction={this.closeAction.bind(this, id)}
                        bodyClass='toast-body-no-padding'
                        autoHide={true}
                        delay={5000}
                    />
                </div>
            )
        }
        return (
            <>
                {toastsMarkup}
            </>
        )
    }

    render () {
        return (
            <>
                {this.renderWalletInfo()}
            </>
        )
    }
}

const WIndicatorPanel = connect(
    mapStoreToProps(components.INDICATOR_PANEL),
    mapDispatchToProps(components.INDICATOR_PANEL)
)(withTranslation()(IndicatorPanel))

export default WIndicatorPanel;