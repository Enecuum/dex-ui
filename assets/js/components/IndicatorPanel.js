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

const valueProcessor = new ValueProcessor();

class IndicatorPanel extends React.Component {
    constructor (props) {
        super(props);
        this.updData();
        this.intervalDescriptors = []
        this.intervalDescriptors.push(this.circleUpd())
        this.intervalDescriptors.push(this.updPendingSpinner())
        this.state = {
            txNotificationToasts : {},
            accountInfoVisibility : false,
            pendingVisibility : false,
            blockTheWindow : false
        };
    };

    componentWillUnmount() {
        this.intervalDescriptors.forEach(descriptor => clearInterval(descriptor))
    }

    renderPendingIndicator () {
        return(
            <div id="pendingIndicator" className="d-flex align-items-center justify-content-end px-3 mr-3">
                <span className="mr-2">Pending</span>
                <span className="spinner icon-Icon3"/>
            </div>
        )
    };

    changeNet (name, url) {
        swapApi.updUrl(url);
        this.props.changeNetwork(name, url);
    };

    renderWalletInfo () {
        return (
            <div className='wallet-info-wrapper d-flex align-items-center justify-content-end'>
                {this.state.pendingVisibility && this.renderPendingIndicator()}
                <div className='net wallet-info-boxes d-flex align-items-center justify-content-center mr-3'>
                    <span className='text-uppercase mx-2'>{this.props.net.name}</span>
                </div>
                <div className='enx-amount wallet-info-boxes d-flex align-items-center justify-content-center px-3 border-0 mr-0 mr-sm-3'>
                    {this.props.enx} ENX
                </div>
                <div className='wallet-info-boxes d-none d-sm-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center justify-content-center px-3'>{this.props.coinAmount} {this.props.coinName}</div>
                    <div className='addr wallet-info-boxes d-none d-md-flex align-items-center justify-content-center open-in-explorer hover-pointer'
                         onClick={this.openCloseAccountInfo.bind(this)}>{utils.packAddressString(this.props.pubkey)}</div>
                </div>
                <div id="toastWrapper" className="position-absolute pt-4">
                    {this.state.accountInfoVisibility && <AccountShortInfo
                        openCloseAccountInfo={this.openCloseAccountInfo.bind(this)}
                        createToast={this.createToast.bind(this)}
                    />}
                    {this.renderRecentTxNotification()}
                </div>
                {this.state.blockTheWindow && <BlockTheWindow />}
            </div>
        );
    };

    openCloseAccountInfo () {
        this.setState({accountInfoVisibility : !this.state.accountInfoVisibility})
    };

    updData () {
        this.updNetwork()
        let tokenObj = utils.getBalanceObj(this.props.balances, this.props.mainToken)
        let tokenName = utils.getTokenObj(this.props.tokens, this.props.mainToken)
        this.props.updCoinAmount(valueProcessor.usCommasBigIntDecimals(tokenObj.amount, tokenObj.decimals))
        this.props.updCoinName(tokenName.ticker)
    };

    circleUpd () {
        return setInterval(() => {
            this.updData();
        }, 500);
    };

    updMainTokenData (net) {
        let actualNativeToken = ENQWeb.Enq.token[net]
        if (extRequests.nativeTokenHash !== actualNativeToken) {
            ENQweb3lib.fee_counter(actualNativeToken)
            .then(fee => {
                this.props.updMainTokenData(actualNativeToken, fee)
                extRequests.updNativeTokenData(actualNativeToken, fee)
            }).catch(err => console.log(err))
        }
    };

    updNetwork () {
        extRequests.getProvider(true)
        .then(res => {
            if (this.state.blockTheWindow)
                this.setState({blockTheWindow : false})
            if (!res.lock && res.net) {
                ENQWeb.Enq.provider = res.net
                this.updMainTokenData(res.net)
                networkApi.updUrl(res.net + '/')
                lsdp.updNet(res.net)
                this.changeNet(ENQWeb.Enq.currentProvider, res.net + '/')
            }
        },
        err => this.setState({blockTheWindow : true}))
    };

    hidePendingIndicator () {
        this.setState({pendingVisibility : false})
    }

    showPendingIndicator () {
        this.setState({pendingVisibility : true})
    }

    controlPendingSpinnerVisibility (pendingArray) {
        let promises = []
        for (let pendingRequest of pendingArray)
            promises.push(swapApi.tx(pendingRequest.hash))

        Promise.allSettled(promises)
            .then(results => {
                let allDone = true
                promises = []
                for (let res of results) {
                    promises.push(
                        res.value.json()
                            .then(res => {
                                if (res.status !== 3 && res.status !== 2)
                                    allDone = false
                            })
                            .catch(() => allDone = false)
                    );
                }
                Promise.all(promises)
                    .then(() => {
                        if (allDone)
                            this.hidePendingIndicator()
                        else
                            this.showPendingIndicator()
                    })
            })
    }

    filterEnexTxs (pendingArray) {
        for (let i in pendingArray) {
            let data = ENQWeb.Utils.ofd.parse(pendingArray[i].data)
            if (Object.keys(pageDataPresets.pending.allowedTxTypes).indexOf(data.type) === -1)
                pendingArray.splice(i, 1)
        }
        return pendingArray
    }

    updPendingSpinner () {
        return setInterval(() => {
            if (this.props.pubkey) {
                swapApi.pendingTxAccount(this.props.pubkey)
                    .then(res => {
                        if (!res.lock)
                            res.json()
                                .then(pendingArray => {
                                    if (Array.isArray(pendingArray) && pendingArray.length !== 0) {
                                        pendingArray = this.filterEnexTxs(pendingArray)
                                        this.controlPendingSpinnerVisibility(pendingArray)
                                    } else {
                                        this.hidePendingIndicator()
                                    }
                                })
                    })
            }
        }, 1000)
    }

    toastHeader () {
        return(<></>)
    }

    toastBody () {
        return(<>
            test body
        </>)
    }

    closeAction (id) {
        this.deleteToast(id)
    }

    deleteToast (id) {
        let result = this.state.txNotificationToasts
        delete result[id]
        this.setState({txNotificationToasts : result})
    }

    createToast (id, interpolateParams) {
        let result = this.state.txNotificationToasts
        result[id] = interpolateParams
        this.setState({txNotificationToasts : result})
    }

    renderRecentTxNotification () {
        let toastsMarkup = []
        for (let id in this.state.txNotificationToasts) {
            toastsMarkup.push(<CommonToast
                renderHeader={this.toastHeader.bind(this)}
                renderBody={this.toastBody.bind(this)}
                closeAction={this.closeAction.bind(this, id)}
                autoHide={true}
                delay={5000}
            />)
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
        );
    };
}

const WIndicatorPanel = connect(mapStoreToProps(components.INDICATOR_PANEL), mapDispatchToProps(components.INDICATOR_PANEL))(IndicatorPanel);

export default WIndicatorPanel;