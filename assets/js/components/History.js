import React from 'react'
import {Modal} from "react-bootstrap"
import {withTranslation} from "react-i18next"

import CommonModal from "../elements/CommonModal"
import {HistoryFilter} from "../elements/Filters"

import pageDataPresets from "../../store/pageDataPresets"
import RecentTransactions from "./RecentTransactions"
import lsdp from "../utils/localStorageDataProcessor"

import '../../css/history.css'

const txTypes = pageDataPresets.pending.allowedTxTypes
const HOUR = 1000 * 60 * 60


class History extends React.Component {
    constructor(props) {
        super(props)

        this.filters = {
            time : undefined,
            type : undefined
        }
        this.state = {
            historyVisibility : false
        }
    }

    componentDidMount() {
        this.intervalDescriptor = setInterval(() => {
            let timeFilter = lsdp.simple.get(`historyTimeFilter`)
            let typeFilter = lsdp.simple.get(`historyTypeFilter`)
            if (this.curTimeFilter !== timeFilter || this.curTypeFilter !== typeFilter) {
                this.curTimeFilter = timeFilter
                this.curTypeFilter = typeFilter
                this.filters = {
                    time: timeFilter,
                    type: typeFilter
                }
                if (this.state.historyVisibility)
                    this.setState({historyVisibility : false}, () => {
                        this.setState({historyVisibility : true})
                    })
            }
        }, 500)
    }

    componentWillUnmount() {
        clearInterval(this.intervalDescriptor)
    }

    renderModalHeader () {
        return(<>
            <Modal.Title id="example-custom-modal-styling-title">
                <div className="d-flex align-items-center justify-content-start">
                    <span className="mr-3">
                        {this.props.t('trade.swapCard.history.header')}
                    </span>
                </div>
            </Modal.Title>
        </>)
    }

    renderModalBody () {
        let t = this.props.t

        const filters = ["Type", "Time"]
        return(<>
            <div className="d-flex justify-content-start mx-0 mb-4 history-filters">
                {filters.map((type, i) => {
                    let lowerCaseType = type.toLowerCase()
                    return (
                        <HistoryFilter name={`history${type}Filter`}
                                       title={t(`trade.swapCard.history.filters.${lowerCaseType}.title`)}
                                       type={lowerCaseType}
                        />
                    )
                })}
            </div>
            <RecentTransactions filters={{
                type : this.getTypeFilter(),
                time : this.getTimeFilter()
            }}/>
        </>)
    }

    getTypeFilter () {
        const filters = {
            all: null,
            swap: [
                txTypes.pool_create,
                txTypes.pool_buy_exact,
                txTypes.pool_buy_exact_routed,
                txTypes.pool_sell_exact,
                txTypes.pool_sell_exact_routed
            ],
            pool: [
                txTypes.pool_create,
                txTypes.pool_add_liquidity,
                txTypes.pool_remove_liquidity
            ],
            farms: [
                txTypes.farm_create,
                txTypes.farm_close_stake,
                txTypes.farm_increase_stake,
                txTypes.farm_decrease_stake,
                txTypes.farm_get_reward
            ],
            drops: []
        }

        return filters[this.filters.type]
    }

    getTimeFilter () {
        const filters = {
            oneHour : HOUR,
            twelveHours : 12 * HOUR,
            oneDay : 24 * HOUR
        }

        return filters[this.filters.time]
    }

    openAction () {
        this.setState({historyVisibility : true})
    }

    closeAction () {
        this.setState({historyVisibility : false})
    }

    renderHistory () {
        return (
            <CommonModal
                closeAction={this.closeAction.bind(this)}
                renderHeader={this.renderModalHeader.bind(this)}
                renderBody={this.renderModalBody.bind(this)}
            />
        )
    }

    render () {
        return (
            <>
                <span className='icon-Icon16 swap-card-top-items' onClick={this.openAction.bind(this)}/>
                {this.state.historyVisibility && this.renderHistory()}
            </>
        )
    }
}

const WHistory = withTranslation()(History)

export default WHistory
