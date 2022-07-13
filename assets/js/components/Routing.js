import React from "react"
import { Accordion, Card } from "react-bootstrap"
import { withTranslation } from "react-i18next"
import { components, mapDispatchToProps, mapStoreToProps } from "../../store/storeToProps"

import {LogoToken} from "../elements/LogoToken"
import PairLogos from "./PairLogos"
import Tooltip from "../elements/Tooltip"

import ValueProcessor from "../utils/ValueProcessor"
import swapUtils from "../utils/swapUtils"

import '../../css/routing.css'
import utils from "../utils/swapUtils";
import { connect } from 'react-redux'
import lsdp from '../utils/localStorageDataProcessor'


class Routing extends React.Component {
    constructor(props) {
        super(props)

        this.vp = new ValueProcessor()
        this.state = {
            showRouter : true
        }
    }

    changeRouterStatus () {
        this.setState({showRouter : !this.state.showRouter})
    }

    genRouteNodes () {
        return this.props.route.map((routeNode, index) => {
            if (!index)
                return (<></>)
            let fToken = swapUtils.getTokenObj(this.props.tokens, routeNode.source)
            let sToken = swapUtils.getTokenObj(this.props.tokens, routeNode.vertex)

            let pool = utils.searchSwap(this.props.pairs, [{hash: routeNode.source}, {hash: routeNode.vertex}])

            let triggerContent = (
                <div className="routing-pool-wrapper d-flex justify-content-between align-items-center">
                    <PairLogos
                        logos={{
                            logo1 : fToken.logo,
                            logo2 : sToken.logo,
                            net : this.props.net,
                            size : 'xxs'
                        }}
                    // customClasses="routing-pair-logos"
                    />
                    <div className="text-pairs">
                        {(Number(pool.pool_fee) / 100).toFixed(2)}%
                    </div>
                </div>
            )
            let popoverContent = (
                <div className="d-flex justify-content-center align-items-center">
                    <div>{fToken.ticker}</div>
                    <span className="icon-Icon10 routing-tooltip-icon mx-1" />
                    <div>{sToken.ticker}</div>
                </div>
            )
            return (
                <Tooltip triggerContent={triggerContent}
                         text={popoverContent}
                         key={index}
                         placement="top"
                         customClasses=""
                />
            )
        })
    }

    // cutAnAmount (input) {
    //     if (input.length > 9)
    //         return input.substring(0, 9) + "..."
    // }

    makeTextProp (objVal) {
        if (!objVal)
            return "---"
        // console.log(objVal)
        if (objVal.value < 0n)
            return "-" + this.vp.usCommasBigIntDecimals(-objVal.value, objVal.decimals)
        else
            return this.vp.usCommasBigIntDecimals(objVal.value, objVal.decimals)
    }

    renderDetailedInfo () {
        if (this.props.route.length === 1)
            return (<></>)
        return (
            <div>
                {this.props.route.map((routeNode, index, routeNodes) => {
                    if (!index)
                        return (<></>)
                    let from = this.makeTextProp(routeNodes[index - 1].outcome)
                    let to = this.makeTextProp(routeNode.outcome)

                    let amountOutMin = this.makeTextProp(routeNode.amountOutMin)
                    let amountInMax = this.makeTextProp(routeNode.amountInMax)

                    return (
                        <div key={index}>
                            <hr className="mx-0"/>
                            <div className="px-0">
                                <div className="d-flex align-items-center justify-content-between p-0">
                                    <div className="">{this.props.t("trade.swapCard.exchange.input0")}</div>
                                    <div className="d-flex justify-content-start hidden-routing-amounts">
                                        {
                                            // this.cutAnAmount(from)
                                            from
                                        }
                                        <div className="text-muted pl-1">
                                            {swapUtils.getTokenObj(this.props.tokens, routeNode.source).ticker}
                                        </div>
                                        {/*<div className="full-routing-amounts">{from}</div>*/}
                                    </div>
                                </div>
                                {/*<span className="col icon-Icon10 routing-tooltip-icon mx-1" />*/}
                                <div className="d-flex align-items-center justify-content-between p-0">
                                    <div className="">{this.props.t("trade.swapCard.exchange.input1")}</div>
                                    <div className="d-flex justify-content-start hidden-routing-amounts">
                                        {
                                            // this.cutAnAmount(to)
                                            to
                                        }
                                        <div className="text-muted pl-1">
                                            {swapUtils.getTokenObj(this.props.tokens, routeNode.vertex).ticker}
                                        </div>
                                        {/*<div className="full-routing-amounts">{to}</div>*/}
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    {lsdp.simple.get("ENEXSwapCalcDirection", true) === "down" &&
                                        <span className="mr-2">{this.props.t('trade.swapAddon.minimumReceived.header')}</span> ||
                                        <span className="mr-2">{this.props.t('trade.swapAddon.maximumSent.header')}</span>
                                    }
                                    <div>
                                        {lsdp.simple.get("ENEXSwapCalcDirection", true) === "down" &&
                                        <div className="d-flex">
                                            {amountOutMin ? amountOutMin : "0.0"}
                                            <div className="ml-1 text-muted">
                                                {swapUtils.getTokenObj(this.props.tokens, routeNode.vertex).ticker}
                                            </div>
                                        </div>
                                        ||
                                        <div className="d-flex">
                                            {amountInMax ? amountInMax : "0.0"}
                                            <div className="ml-1 text-muted">
                                                {swapUtils.getTokenObj(this.props.tokens, routeNode.source).ticker}
                                            </div>
                                        </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    renderRoute () {
        let fLogo, sLogo
        if (this.props.route.length) {
            let fHash = this.props.route[0].vertex
            let sHash = this.props.route[this.props.route.length - 1].vertex
            fLogo = swapUtils.getTokenObj(this.props.tokens, fHash).logo
            sLogo = swapUtils.getTokenObj(this.props.tokens, sHash).logo
        }
        return (
            <Accordion routing-active={this.state.showRouter.toString()} defaultActiveKey="0">
                <Card className="routing-card">
                    <Card.Header className="p-0 d-flex">
                        <Accordion.Toggle eventKey="0"
                                          className="routing-button d-flex justify-content-between align-items-center"
                                          data-active-accordion-elem={this.state.showRouter.toString()}
                                          onClick={() => this.changeRouterStatus()}
                        >
                            <div className="ml-1">Router</div>
                            {this.props.routingWaiting &&
                                <span className="spinner icon-Icon3 d-flex align-items-center routing-spinner" /> ||
                                <span className="icon-Icon26 fas fa-chevron-down accordion-chevron" />
                            }
                        </Accordion.Toggle>
                    </Card.Header>
                    {(this.props.route.length) &&
                        <Accordion.Collapse eventKey="0">
                            <Card.Body className="pb-2">
                                <div className="swap-route mt-4 mb-2 d-flex justify-content-between">
                                    <LogoToken
                                        data={{
                                            url : fLogo,
                                            net : this.props.net,
                                            size : "xxs"
                                        }}
                                        customClasses="l-side-logo"
                                    />
                                    {this.genRouteNodes()}
                                    <LogoToken
                                        data={{
                                            url : sLogo,
                                            net : this.props.net,
                                            size : "xxs"
                                        }}
                                        customClasses="r-side-logo"
                                    />
                                </div>
                                {this.renderDetailedInfo()}
                            </Card.Body>
                        </Accordion.Collapse> || <></>
                    }
                </Card>
            </Accordion>
        )
    }

    render () {
        if (!this.props.routingVisibility)
            return (<></>)
        return (
            <div className="mt-1 mb-3">
                {this.renderRoute()}
            </div>
        )
    }
}

const WRouting = connect(
    mapStoreToProps(components.ROUTING),
    mapDispatchToProps(components.ROUTING)
)(withTranslation()(Routing))

export default WRouting
