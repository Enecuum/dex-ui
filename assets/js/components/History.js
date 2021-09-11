import React from 'react'
import {Modal, DropdownButton, Dropdown} from "react-bootstrap"
import { withTranslation } from "react-i18next"

import CommonModal from "../elements/CommonModal"
import RecentTransactions from "./RecentTransactions"

import pageDataPresets from "../../store/pageDataPresets"

import '../../css/history.css'

const txTypes = pageDataPresets.pending.allowedTxTypes
const HOUR = 1000 * 60 * 60

class History extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            historyVisibility : false,
            rerenderRecentTxs : true
        }
        this.filters = {
            type : {
                allTypes : {
                    text : "all types",
                    types : null,
                    active : true
                },
                swap : {
                    text : "swap",
                    types : [
                        txTypes.pool_create,
                        txTypes.pool_swap
                    ]
                },
                pool : {
                    text : "pool",
                    types : [
                        txTypes.pool_create,
                        txTypes.pool_add_liquidity,
                        txTypes.pool_remove_liquidity
                    ]
                },
                farms : {
                    text : "farms",
                    types : [
                        txTypes.farm_create,
                        txTypes.farm_close_stake,
                        txTypes.farm_increase_stake,
                        txTypes.farm_decrease_stake,
                        txTypes.farm_get_reward
                    ]
                },
                drops : {
                    text : "drops",
                    types : []
                },
            },
            time : {
                oneHour : {
                    text : "1h ago",
                    time : HOUR,
                    active : true
                },
                twelveHours : {
                    text : "12h ago",
                    time : 12 * HOUR
                },
                oneDay : {
                    text : "1d ago",
                    time : 24 * HOUR
                },
            }
        }
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

    getActiveFilter (filterName) {
        let filter = this.filters[filterName]
        for (let curItemName in filter)
            if (filter[curItemName].active)
                return filter[curItemName]
        return filter[Object.keys(filter)[0]]
    }

    changeActiveFilter (filterName, itemName) {
        let filter = this.filters[filterName]
        delete this.getActiveFilter(filterName).active
        filter[itemName].active = true
        this.setState({rerenderRecentTxs : true})
    }

    getFilters () {
        return Object.keys(this.filters).map((filterName, filterIndex) => {
            let activeItem
            let items = Object.keys(this.filters[filterName]).map((itemName, itemIndex) => {
                let item = this.filters[filterName][itemName]
                if (item.active)
                    activeItem = item
                return (
                    <Dropdown.Item
                        key={itemIndex+""} active={item.active}
                        onClick={this.changeActiveFilter.bind(this, filterName, itemName)}
                    >
                        {item.text}
                    </Dropdown.Item>
                )
            })
            return (
                <DropdownButton
                    variant="info"
                    title={activeItem.text}
                    className="d-flex mr-3"
                    size="sm"
                    key={filterIndex+""}
                >
                    {items}
                </ DropdownButton>
            )
        })
    }

    renderModalBody () {
        return(<>
            <div className="d-flex justify-content-begin mx-4 mb-4 history-filters">
                {this.getFilters()}
            </div>
            <RecentTransactions filters={{
                type : this.getActiveFilter("type").types,
                time : this.getActiveFilter("time").time
            }} rerenderRecentTxs={this.state.rerenderRecentTxs}/>
        </>)
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