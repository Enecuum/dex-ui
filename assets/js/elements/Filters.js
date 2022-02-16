import React from "react"
import {Dropdown, DropdownButton} from "react-bootstrap"
import {withTranslation} from "react-i18next"

import lsdp from "../utils/localStorageDataProcessor"
import pageDataPresets from "../../store/pageDataPresets"


class Filter extends React.Component {
    constructor(props) {
        super(props)

        let preset = this.props.getItems(this.props.t)
        let itemName = lsdp.simple.get(this.props.filterName)

        this.state = {
            items : preset,
            activeItem : itemName ? itemName : Object.keys(preset)[0]
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.curLang !== prevProps["i18n"].language) {
            this.setState({items : this.props.getItems(this.props.t)})
            this.curLang = prevProps["i18n"].language
        }
    }

    changeActiveFilter (itemName) {
        lsdp.simple.write(this.props.filterName, itemName)
        this.setState({activeItem : itemName})
    }

    renderFilter () {
        let items = Object.keys(this.state.items).map((itemName, itemIndex) => {
            let item = this.state.items[itemName]
            return (
                <Dropdown.Item
                    key={itemIndex+""} active={itemName === this.state.activeItem}
                    onClick={this.changeActiveFilter.bind(this, itemName)}
                >
                    {item.text.toLowerCase()}
                </Dropdown.Item>
            )
        })

        return (
            <DropdownButton
                variant="info"
                title={this.props.title + ": " + this.state.items[this.state.activeItem].text.toLowerCase()}
                className=""
                size="sm"
                key={this.props.key+""}
            >
                {items}
            </ DropdownButton>
        )
    }

    render () {
        return (
            <div className="history-filters">
                {this.renderFilter()}
            </div>
        )
    }
}

class HistoryFilter extends React.Component {
    getTypeItems (t) {
        const filtersTranslationPath = "trade.swapCard.history.filters"
        const typeFL = `${filtersTranslationPath}.type`

        return {
            all: {
                text: t(`${typeFL}.allTypes`),
            },
            swap: {
                text: t(`${typeFL}.swap`)
            },
            pool: {
                text: t(`${typeFL}.pool`)
            },
            farms: {
                text: t(`${typeFL}.farms`)
            },
            drops: {
                text: t(`${typeFL}.drops`)
            }
        }
    }

    getTimeItems (t) {
        const filtersTranslationPath = "trade.swapCard.history.filters"
        const timeFL = `${filtersTranslationPath}.time`

        return {
            oneHour : {
                text : t(`${timeFL}.oneHour`),
            },
            twelveHours : {
                text : t(`${timeFL}.twelveHours`),
            },
            oneDay : {
                text : t(`${timeFL}.oneDay`)
            }
        }
    }

    getItems (t) {
        if (this.type === "type")
            return this.getTypeItems(t)
        else if (this.type === "time")
            return this.getTimeItems(t)
    }

    render() {
        this.type = this.props.type
        return (
            <Filter getItems={this.getItems.bind(this)}
                    key={this.props.key}
                    filterName={this.props.name}
                    title={this.props.title}
            />
        )
    }
}

class FarmsFilter extends React.Component {
    getItems (t) {
        return {
            all : {
                text : t('all')
            },
            active : {
                text : t('dropFarms.activeFilter'),
            },
            paused : {
                text : t('dropFarms.pausedFilter')
            },
            finished : {
                text : t('dropFarms.finishedFilter')
            }
        }
    }

    render() {
        return (
            <Filter getItems={this.getItems.bind(this)}
                    key={this.props.key}
                    filterName={this.props.name}
                    title={this.props.title}
            />
        )
    }
}

Filter = withTranslation()(Filter)

export {
    FarmsFilter,
    HistoryFilter
}