import React from "react"
import {connect} from "react-redux"
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps"
import {withTranslation} from "react-i18next"

import swapApi from "../requests/swapApi"
import lsdp from "../utils/localStorageDataProcessor"


class RecentTransactions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recentTxs : {},
        }
        this.updData()
    }

    componentDidMount() {
        this.updRecentTxs()
    }

    componentWillUnmount() {
        clearInterval(this.intervalDescriptor)
    }

    // getUnresolvedData (recentTxs) {
    //     for (let key in recentTxs)
    //         if (this.props.recentTxs.find(el => el.hash === key))
    //             delete recentTxs[key]
    //     return recentTxs
    // }

    // generateTxText (strData) {
    //     let objData = ENQWeb.Utils.ofd.parse(strData)
    //     let descriptionPhrase = "", interpolateParams = {}
    //     if (objData.type === "pool_swap") {
    //         descriptionPhrase = 'navbars.top.accountShortInfo.txListInternals.swap.completePhrase'
    //         let poolObj = swapUtils.searchSwap(this.props.pairs, [
    //             {hash : objData.parameters.asset_in},
    //             {hash : objData.parameters.asset_out}
    //         ])
    //         let tokenObj_0 = swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_in)
    //         let tokenObj_1 = swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_out)
    //         let volume0  = {
    //             value : BigInt(poolObj.token_0.volume),
    //             decimals : tokenObj_0.decimals
    //         };
    //         let volume1  = {
    //             value : BigInt(poolObj.token_1.volume),
    //             decimals : tokenObj_1.decimals
    //         };
    //         let amountIn = {
    //             value : BigInt(objData.parameters.amount_in),
    //             decimals : tokenObj_0.decimals
    //         }
    //         let amount_out = testFormulas.getSwapPrice(volume0, volume1, amountIn)
    //         interpolateParams = {
    //             value0 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_in)),
    //             ticker0 : tokenObj_0.ticker,
    //             value1 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(amount_out.value, amount_out.decimals)),
    //             ticker1 : tokenObj_1.ticker
    //         }
    //     } else if (objData.type === "pool_create") {
    //         descriptionPhrase = 'navbars.top.accountShortInfo.txListInternals.createPool.completePhrase'
    //         interpolateParams = {
    //             value0 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_1)),
    //             ticker0 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_1).ticker,
    //             value1 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_2)),
    //             ticker1 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_2).ticker
    //         }
    //     } else if (objData.type === "pool_add_liquidity") {
    //         descriptionPhrase = 'navbars.top.accountShortInfo.txListInternals.addLiquidity.completePhrase'
    //         interpolateParams = {
    //             value0 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_1)),
    //             ticker0 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_1).ticker,
    //             value1 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_2)),
    //             ticker1 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_2).ticker
    //         }
    //     } else if (objData.type === "pool_remove_liquidity") {
    //         descriptionPhrase = 'navbars.top.accountShortInfo.txListInternals.removeLiquidity.completePhrase'
    //         interpolateParams = {
    //             value0 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount)),
    //             ticker0 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.lt).ticker
    //         }
    //     } else {}
    //
    //     return this.props.t(descriptionPhrase, interpolateParams)
    // }

    updStatuses () {
        return new Promise(resolve => {
            let promises = [], history = lsdp.get.history()
            for (let hash in history)
                if (history[hash].status == 0)
                    promises.push(swapApi.tx(hash))
            Promise.allSettled(promises)
                .then(results => {
                    promises = []
                    for (let result of results) {
                        try {
                            promises.push(
                                result.value.json()
                                    .then(res => {
                                        lsdp.write(res.hash, res.status, lsdp.get.note(res.hash)[res.hash].text)
                                    })
                                    .catch(err => {/* pending transaction */})
                            )
                        } catch (err) { /* pending transaction */ }
                    }
                    Promise.all(promises)
                        .then(() => resolve())
                })
        })
    }

    getListOfRecentTxs () {
        return new Promise(resolve => {
            this.updStatuses()
                .then(() => {
                    resolve(lsdp.get.history())
                })
        })
    }

    openTxInExplorer (hash) {
        window.open(this.props.net + '#!/tx/' + hash, '_blank').focus()
    }

    getRecentTxsMarkup () {
        let recentTxList = {...this.state.recentTxs}
        let recentTxListLen = Object.keys(recentTxList).length

        let txsForRender = Object.keys(recentTxList).reduce((arrForRender, hash, index) => {
            let yPadding = (index == recentTxListLen-1) ? "pb-3" : ""
            if (recentTxList[hash].text !== undefined) {
                let txStatusIcon
                if (recentTxList[hash].status == 3)
                    txStatusIcon = 'icon-Icon5'
                else if (recentTxList[hash].status == 0)
                    txStatusIcon = 'spinner icon-Icon3'
                else
                    txStatusIcon = 'icon-Icon7'
                arrForRender.push((
                    <p className={`${yPadding} px-4 d-flex justify-content-between`} key={index+''}>
                        <a className="recent-tx-ref" onClick={this.openTxInExplorer.bind(this, hash)}>
                            { recentTxList[hash].text }
                            <span className='ml-2 icon-Icon11' />
                        </a>
                        <span className={`ml-2 mb-2 recent-tx-ref ${txStatusIcon}`} />
                    </p>
                ))
            }
            return arrForRender
        }, [])

        if (!recentTxListLen)
            txsForRender.unshift((<p className={`py-3 px-4`} key={'-1'}>{ "Your transactions will appear here..." }</p>))
        else
            txsForRender.unshift((<div className="px-4 d-flex justify-content-between">
                <p className="pt-3" key={'-1'}>{ "Recent transactions" }</p>
                <a
                    className="recent-tx-ref d-flex align-items-center"
                    onClick={this.clearHistory.bind(this)}
                >(clear all)</a>
            </div>))

        return (
            <div className="recent-txs-place mt-3">
                {txsForRender}
            </div>
        )
    }

    clearHistory () {
        lsdp.remove.history()
        this.updRecentTxs()
    }

    updData () {
        this.intervalDescriptor = setInterval(() => {
            this.updRecentTxs()
        }, 1000)
    }

    updRecentTxs () {
        this.getListOfRecentTxs().then(recentTxs => this.setState({recentTxs : recentTxs}))
    }

    render () {
        return (
            <>
                {this.getRecentTxsMarkup()}
            </>
        )
    }
}

const WRecentTransactions = connect(
    mapStoreToProps(components.RECENT_TXS_LIST),
    mapDispatchToProps(components.RECENT_TXS_LIST)
)(withTranslation()(RecentTransactions))

export default WRecentTransactions
