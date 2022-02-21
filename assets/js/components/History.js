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
        this.items = this.getItems()
        this.state = {
            historyVisibility : false
        }
    }

    componentDidMount() {
        this.updFilters()
        this.rerenderHistory()
    }

    componentWillUnmount() {
        clearInterval(this.intervalDescriptor)
    }

    updFilters () {
        this.filters = {
            time: lsdp.simple.get(`historyTimeFilter`),
            type: lsdp.simple.get(`historyTypeFilter`)
        }
    }

    rerenderHistory () {
        if (this.state.historyVisibility)
            this.setState({historyVisibility : false}, () => {
                this.setState({historyVisibility : true})
            })
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

    isValidFilters () {
        return this.filters.type && this.filters.time
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
                                       getItems={this.getItems.bind(this)}
                                       afterUpdate={this.afterUpdate.bind(this)}
                        />
                    )
                })}
            </div>
            {
                <RecentTransactions filters={{
                    type : this.filters.type && this.items.type[this.filters.type].value || undefined,
                    time : this.filters.time && this.items.time[this.filters.time].value || undefined
                }}/>
            }
        </>)
    }

    afterUpdate () {
        this.updFilters()
        this.rerenderHistory()
    }

    getItems () {
        let t = this.props.t
        const filtersTranslationPath = "trade.swapCard.history.filters"
        const timeFL = `${filtersTranslationPath}.time`
        const typeFL = `${filtersTranslationPath}.type`

        return {
            type : {
                all: {
                    text: t(`${typeFL}.allTypes`),
                    value: null
                },
                swap: {
                    text: t(`${typeFL}.swap`),
                    value: [
                        txTypes.pool_create,
                        txTypes.pool_buy_exact,
                        txTypes.pool_buy_exact_routed,
                        txTypes.pool_sell_exact,
                        txTypes.pool_sell_exact_routed
                    ]
                },
                pool: {
                    text: t(`${typeFL}.pool`),
                    value: [
                        txTypes.pool_create,
                        txTypes.pool_add_liquidity,
                        txTypes.pool_remove_liquidity
                    ]
                },
                farms: {
                    text: t(`${typeFL}.farms`),
                    value: [
                        txTypes.farm_create,
                        txTypes.farm_close_stake,
                        txTypes.farm_increase_stake,
                        txTypes.farm_decrease_stake,
                        txTypes.farm_get_reward
                    ]
                },
                drops: {
                    text: t(`${typeFL}.drops`),
                    value: []
                }
            },
            time : {
                oneHour : {
                    text : t(`${timeFL}.oneHour`),
                    value: HOUR
                },
                twelveHours : {
                    text : t(`${timeFL}.twelveHours`),
                    value: 12 * HOUR
                },
                oneDay : {
                    text : t(`${timeFL}.oneDay`),
                    value: 24 * HOUR
                }
            }
        }
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
