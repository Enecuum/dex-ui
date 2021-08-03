import React from "react";
import {connect} from "react-redux";
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps";
import {withTranslation} from "react-i18next";

import ObjectFromData from '../../../web3-enq/packages/web3-enq-utils/src/objectFromData';
import ValueProcessor from "../utils/ValueProcessor";
import {cookieProcessor as cp} from "../utils/cookieProcessor";
import swapApi from "../requests/swapApi";
import swapUtils from "../utils/swapUtils";
import testFormulas from "../utils/testFormulas";

const objectFromData = new ObjectFromData()
const vp = new ValueProcessor()


class RecentTransactions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recentTxsMarkup : <></>,
        }
        this.updRecentTxList()
    }

    getUnresolvedData (recentTxs) {
        for (let key in recentTxs)
            if (this.props.recentTxs.find(el => el.hash === key))
                delete recentTxs[key]
        return recentTxs
    }

    generateTxText (strData) {
        let objData = objectFromData.parse(strData)
        let descriptionPhrase = "", interpolateParams = {}
        console.log(objData)
        if (objData.type === "pool_swap") {
            descriptionPhrase = 'navbars.top.accountShortInfo.txListInternals.swap.completePhrase'
            let poolObj = swapUtils.searchSwap(this.props.pairs, [
                {hash : objData.parameters.asset_in},
                {hash : objData.parameters.asset_out}
            ])
            let tokenObj_0 = swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_in)
            let tokenObj_1 = swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_out)
            let volume0  = {
                value : BigInt(poolObj.token_0.volume),
                decimals : tokenObj_0.decimals
            };
            let volume1  = {
                value : BigInt(poolObj.token_1.volume),
                decimals : tokenObj_1.decimals
            };
            let amountIn = {
                value : BigInt(objData.parameters.amount_in),
                decimals : tokenObj_0.decimals
            }
            let amount_out = testFormulas.getSwapPrice(volume0, volume1, amountIn)
            interpolateParams = {
                value0 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_in)),
                ticker0 : tokenObj_0.ticker,
                value1 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(amount_out.value, amount_out.decimals)),
                ticker1 : tokenObj_1.ticker
            }
        } else if (objData.type === "pool_create") {
            descriptionPhrase = 'navbars.top.accountShortInfo.txListInternals.createPool.completePhrase'
            interpolateParams = {
                value0 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_1)),
                ticker0 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_1).ticker,
                value1 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_2)),
                ticker1 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_2).ticker
            }
        } else if (objData.type === "pool_add_liquidity") {
            descriptionPhrase = 'navbars.top.accountShortInfo.txListInternals.addLiquidity.completePhrase'
            interpolateParams = {
                value0 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_1)),
                ticker0 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_1).ticker,
                value1 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount_2)),
                ticker1 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.asset_2).ticker
            }
        } else if (objData.type === "pool_remove_liquidity") {
            descriptionPhrase = 'navbars.top.accountShortInfo.txListInternals.removeLiquidity.completePhrase'
            interpolateParams = {
                value0 : swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(objData.parameters.amount)),
                ticker0 : swapUtils.getTokenObj(this.props.tokens, objData.parameters.lt).ticker
            }
        } else {}

        return this.props.t(descriptionPhrase, interpolateParams)
    }

    getListOfRecentTxs () {
        return new Promise(resolve => {
            let unresolvedData = this.getUnresolvedData(cp.get().cleared())
            if (!Object.keys(unresolvedData).length) {
                resolve(this.props.recentTxs)
                return
            }

            let promises = [], dataForSaving = [];
            for (let key in unresolvedData)
                promises.push(swapApi.tx(key))
            Promise.allSettled(promises)
            .then(results => {
                promises = [];
                for (let result of results) {
                    try {
                        promises.push(
                            result.value.json()
                                .then(res => {
                                    dataForSaving.push({
                                        hash: res.hash,
                                        status: res.status,
                                        text: this.generateTxText(res.data)
                                    })
                                })
                        )
                    } catch (err) { /* pending transaction */ }
                }
                Promise.all(promises)
                .then(() => {
                    let newCachedData = this.props.recentTxs.concat(dataForSaving)
                    this.props.updRecentTxs(newCachedData)
                    resolve(newCachedData)
                })
            })
        })
    }

    openTxInExplorer (hash) {
        window.open(this.props.net.url + '#!/tx/' + hash, '_blank').focus()
    }

    getRecentTxsMarkup (recentTxList) {
        recentTxList = JSON.parse(JSON.stringify(recentTxList))
        if (!recentTxList.length)
            recentTxList.push("Your transactions will appear here...")
        else
            recentTxList.splice(0, 0, "Recent transactions")
        let txsForRender = []
        let recentTxListLen = recentTxList.length
        for (let i in recentTxList) {
            let yPadding
            if (recentTxListLen === 1)
                yPadding = "py-2"
            else
                yPadding = (i === "0") ? "pt-3" : (i === String(recentTxList.length-1)) ? "pb-3" : ""

            if (recentTxList[i].text !== undefined) {
                let iconNumber = (recentTxList[i].status == 3) ? 5 : 7
                txsForRender.push((
                    <p className={`${yPadding} px-3 d-flex justify-content-between`} key={i}>
                        <a className="recent-tx-ref" onClick={this.openTxInExplorer.bind(this, recentTxList[i].hash)}>
                            { recentTxList[i].text }
                            <span className='ml-2 icon-Icon11' />
                        </a>
                        <span className={`ml-2 recent-tx-ref icon-Icon${iconNumber}`} />
                    </p>
                ))
            } else {
                txsForRender.push((<p className={`${yPadding} px-3`} key={i}>{ recentTxList[i] }</p>))
            }
        }
        return (
            <div className="recent-txs-place mt-3">
                {txsForRender}
            </div>
        )
    }

    updRecentTxList () {
        if (this.props.accountInfoVisibility)
            this.getListOfRecentTxs()
                .then(recentTxList => {
                    this.setState({recentTxsMarkup : this.getRecentTxsMarkup(recentTxList)})
                })
        setTimeout(() => {
            this.updRecentTxList()
        }, 5000)
    }

    render() {
        return (
            this.state.recentTxsMarkup
        )
    }
}

const WRecentTransactions = connect(
    mapStoreToProps(components.RECENT_TXS_LIST),
    mapDispatchToProps(components.RECENT_TXS_LIST)
)(withTranslation()(RecentTransactions))

export default WRecentTransactions
