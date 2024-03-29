import React from "react"
import {Dropdown, DropdownButton} from "react-bootstrap"
import {withTranslation} from "react-i18next"

import lsdp from "../utils/localStorageDataProcessor"


class Filter extends React.Component {
    constructor(props) {
        super(props)

        let preset = this.props.getItems(this.props.t)
        let itemName = lsdp.simple.get(this.props.filterName)
        if (itemName === null)
            itemName = Object.keys(preset)[0]
        this.changeActiveFilter(itemName)

        this.state = {
            items : preset,
            activeItem : itemName
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
        this.setState({activeItem : itemName}, () => {
            this.props.afterUpdate()
        })
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
            </DropdownButton>
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
    getItems (t) {
        if (this.type === "type")
            return this.props.getItems().type
        else if (this.type === "time")
            return this.props.getItems().time
    }

    render() {
        this.type = this.props.type
        return (
            <Filter getItems={this.getItems.bind(this)}
                    key={this.props.key}
                    filterName={this.props.name}
                    title={this.props.title}
                    afterUpdate={() => {this.props.afterUpdate()}}
            />
        )
    }
}

class FarmsFilter extends React.Component {
    render() {
        return (
            <Filter getItems={this.props.getItems.bind(this)}
                    key={this.props.key}
                    filterName={this.props.name}
                    title={this.props.title}
                    afterUpdate={() => {this.props.afterUpdate()}}
            />
        )
    }
}

Filter = withTranslation()(Filter)

export {
    FarmsFilter,
    HistoryFilter
}