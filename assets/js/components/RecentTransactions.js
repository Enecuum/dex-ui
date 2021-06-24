import React from "react"
import {connect} from "react-redux";
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps";
import {withTranslation} from "react-i18next";

class RecentTransactions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recentTxsMarkup : <></>
        }
        this.updRecentTxList()
    }

    getListOfRecentTxs () {
        return new Promise(resolve => {
            resolve([])
        })
    }

    getRecentTxsMarkup (recentTxList) {
        if (!recentTxList.length)
            recentTxList.push("Your transactions will appear here...")
        else
            recentTxList.splice(0, 0, "Recent transactions")
        let txsForRender = []
        let recentTxListLen = recentTxList.length
        for (let i in recentTxList) {
            let yPadding
            if (recentTxListLen === 1)
                yPadding = "py-3"
            else
                yPadding = (i === "0") ? "pt-3" : (i === String(recentTxList.length-1)) ? "pb-3" : ""
            txsForRender.push((<p className={`${yPadding} px-3`} key={i}>{recentTxList[i]}</p>))
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
