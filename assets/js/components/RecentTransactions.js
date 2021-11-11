import React from "react"
import {connect} from "react-redux"
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps"
import {withTranslation} from "react-i18next"

import networkApi from "../requests/networkApi"
import lsdp from "../utils/localStorageDataProcessor"
import generateTxText from "../utils/txTextGenerator"


class RecentTransactions extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            recentTxs : [],
        }
        this.filters = this.validateFilters()
        this.updData()
    }

    // componentDidUpdate() {
    //     this.filters = this.validateFilters()
    // }

    componentDidMount() {
        this.updRecentTxs()
    }

    componentWillUnmount() {
        clearInterval(this.intervalDescriptor)
    }

    validateFilters () {
        let resFilters = {
            type : null,
            time : null
        }, rawFilters = this.props.filters
        if (rawFilters) {
            if (rawFilters.type && Array.isArray(rawFilters.type))
                resFilters.type = rawFilters.type
            if (rawFilters.time && Number.isInteger(rawFilters.time))
                resFilters.time = rawFilters.time
        }
        return resFilters
    }

    satisfiesTypeFilter (note) {
        if (this.filters.type === null)
            return true
        return this.filters.type.indexOf(note.type) !== -1
    }

    satisfiesTimeFilter (note) {
        if (this.filters.time === null)
            return true
        return new Date() - this.filters.time < note.date
    }

    sortHistory (history) {
        let historyArray = []
        for (let hash in history) {
            let arrEl = history[hash]
            arrEl.hash = hash
            historyArray.push(arrEl)
        }
        return historyArray.sort((a, b) => {
            if (a.date > b.date)
                return -1
            if (a.date < b.date)
                return 1
            else
                return 0
        })
    }

    getListOfRecentTxs () {
        return new Promise(resolve => {
            let history = lsdp.get.history()
            for (let hash in history) {
                let mustBeDeleted = false
                if (!this.satisfiesTypeFilter(history[hash]))
                    mustBeDeleted = true
                if (!this.satisfiesTimeFilter(history[hash]))
                    mustBeDeleted = true
                if (mustBeDeleted)
                    delete history[hash]
            }
            resolve(this.sortHistory(history))
        })
    }

    openTxInExplorer (hash) {
        window.open(this.props.net.url + '#!/tx/' + hash, '_blank').focus()
    }

    getDescription (note) {
        return generateTxText(this.props.t, 'RecentTransactions', note.type, note.interpolateParams)
    }

    getRecentTxsMarkup () {
        let t = this.props.t
        let recentTxList = this.state.recentTxs
        let recentTxListLen = recentTxList.length

        let txsForRender = recentTxList.reduce((arrForRender, note, index) => {
            let yPadding = (index === recentTxListLen-1) ? "pb-3" : ""
            if (note.interpolateParams !== undefined) {
                let txStatusIcon
                if (note.status === 3)
                    txStatusIcon = 'icon-Icon5'
                else if (note.status === 0)
                    txStatusIcon = 'spinner icon-Icon3'
                else
                    txStatusIcon = 'icon-Icon7'
                arrForRender.push((
                    <p className={`${yPadding} px-0 d-flex justify-content-between`} key={index+''}>
                        <a className="recent-tx-ref" onClick={this.openTxInExplorer.bind(this, note.hash)}>
                            { this.getDescription(note) }
                            <span className='ml-2 icon-Icon11' />
                        </a>
                        <span className={`ml-2 d-flex align-items-center recent-tx-ref ${txStatusIcon}`} />
                    </p>
                ))
            }
            return arrForRender
        }, [])

        if (!recentTxListLen)
            txsForRender.unshift((<p className={`py-3 px-0`} key={'-1'}>{ t('recentTxs.withoutTxs') }</p>))
        else
            txsForRender.unshift((<div className="px-0 d-flex justify-content-between" key={'-1'}>
                <p className="pt-3" >{ t('recentTxs.withTxs') }</p>
                <a
                    className="recent-tx-ref d-flex align-items-center"
                    onClick={this.clearHistory.bind(this)}
                >{ t('recentTxs.clearButton') }</a>
            </div>))

        return (
            <>
                {txsForRender}
            </>
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
