import React from "react"
import { Accordion, Card } from "react-bootstrap"

import {LogoToken} from "../elements/LogoToken"
import PairLogos from "./PairLogos"
import Tooltip from "../elements/Tooltip"

import ValueProcessor from "../utils/ValueProcessor"
import swapUtils from "../utils/swapUtils"

import '../../css/routing.css'
import utils from "../utils/swapUtils";


class Routing extends React.Component {
    constructor(props) {
        super(props)

        this.vp = new ValueProcessor()
        this.state = {
            showRouter : false
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
                        net : {name : "bit"},
                        size : 'xxs'
                    }}
                    customClasses="routing-pair-logos"
                    />
                    <div className="text-pairs">
                        {(Number(pool.pool_fee) / 100).toFixed(1)}%
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
                         placement="top"
                         customClasses=""
                />
            )
        })
    }

    cutAnAmount (input) {
        return input.substring(0, 7) + "..."
    }

    renderDetailedInfo () {
        if (this.props.route.length === 1)
            return (<></>)
        return (
            <div>
                <hr/>
                {this.props.route.map((routeNode, index, routeNodes) => {
                    if (!index)
                        return (<></>)
                    let from = this.vp.usCommasBigIntDecimals(
                        routeNodes[index - 1].outcome.value,
                        routeNodes[index - 1].outcome.decimals
                    )
                    let to = this.vp.usCommasBigIntDecimals(
                        routeNode.outcome.value,
                        routeNode.outcome.decimals
                    )

                    return (
                        <div className="d-flex align-items-center">
                            <div className="col-5 p-0">
                                <div className="d-flex justify-content-start">
                                    {
                                        !(index - 1) && from || this.cutAnAmount(from)
                                    }
                                    <div className="text-muted pl-1">
                                        {swapUtils.getTokenObj(this.props.tokens, routeNode.source).ticker}
                                    </div>
                                </div>
                            </div>
                            <span className="col icon-Icon10 routing-tooltip-icon mx-1" />
                            <div className="col-5 p-0">
                                <div className="d-flex justify-content-start">
                                    {
                                        routeNodes.length - 1 === index && to || this.cutAnAmount(to)
                                    }
                                    <div className="text-muted pl-1">
                                        {swapUtils.getTokenObj(this.props.tokens, routeNode.vertex).ticker}
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
            <Accordion routing-active={this.state.showRouter.toString()}>
                <Card className="routing-card">
                    <Card.Header className="p-0 d-flex">
                        <Accordion.Toggle
                        eventKey="0"
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

export default Routing
