import React from "react"
import { Accordion, Card } from "react-bootstrap"

import LogoToken from "../elements/LogoToken"
import PairLogos from "./PairLogos"

import '../../css/routing.css'


class Routing extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showRouter : false,
            route : [
                {vertex: "BIT", source: null},
                {vertex: "notBIT", source: "BIT"},
                {vertex: "notBIT", source: "BIT"},
                {vertex: "anotherBIT", source: "notBIT"}
            ]
        }
    }

    changeRouterStatus () {
        this.setState({showRouter : !this.state.showRouter})
    }

    genPartialPools () {
        let partialPools = this.state.route.slice(1, this.state.route.length - 1)
        return partialPools.map(pool => {
            return (
                <div className="routing-pool-wrapper d-flex justify-content-between align-items-center">
                    <PairLogos
                        logos={{
                            logo1 : "bit-black.png",
                            logo2 : "bit-black.png",
                            net : {name : "bit"},
                            size : 'xxs'
                        }}
                        customClasses="routing-pair-logos"
                    />
                    <div className="text-pairs">
                        0.0%
                    </div>
                </div>
            )
        })
    }

    render () {
        return (
            <div className="mt-1 mb-3">
                <Accordion routing-active={this.state.showRouter.toString()}>
                    <Card className="routing-card">
                        <Card.Header className="p-0 d-flex">
                            <Accordion.Toggle
                                eventKey="0"
                                className="routing-button d-flex justify-content-between align-items-center"
                                data-active-accordion-elem={this.state.showRouter.toString()}
                                onClick={this.changeRouterStatus.bind(this)}
                            >
                                <div className="ml-1">Router</div>
                                <span className="icon-Icon26 fas fa-chevron-down accordion-chevron" />
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body className="pb-2">
                                <div className="swap-route mt-4 mb-2 d-flex justify-content-between">
                                    <LogoToken
                                        data={{
                                            url : "bit-black.png",
                                            value : undefined,
                                            net : {name : "bit"},
                                            size : "xxs"
                                        }}
                                        customClasses="l-side-logo"
                                    />
                                    {this.genPartialPools()}
                                    <LogoToken
                                        data={{
                                            url : "bit-black.png",
                                            value : undefined,
                                            net : {name : "bit"},
                                            size : "xxs"
                                        }}
                                        customClasses="r-side-logo"
                                    />
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </div>
        )
    }
}

export default Routing
