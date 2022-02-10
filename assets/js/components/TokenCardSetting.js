import React from "react"
import { withTranslation } from "react-i18next"

import CommonModal from "../elements/CommonModal"
import {Modal} from "react-bootstrap"

import lsdp from "../utils/localStorageDataProcessor"

const settings = {
    upTrustedTokens : "raise_up_trusted_tokens",
    upBalances : "raise_up_balances",
    upLpTokens : "raise_up_lp_tokens"
}


class TokenCardSetting extends React.Component {
    constructor(props) {
        super(props)

        this.initSettings()
        this.state = {
            visibility: false
        }
    }

    initSettings () {
        this.settings = {
            [settings.upTrustedTokens] : this.initSetting(settings.upTrustedTokens),
            [settings.upBalances] : this.initSetting(settings.upBalances),
            [settings.upLpTokens] : this.initSetting(settings.upLpTokens)
        }
    }

    renderHeader () {
        return (
            <Modal.Title>
                <div className="d-flex align-items-center justify-content-start">
                    <span className="mr-3">
                        Settings
                    </span>
                </div>
            </Modal.Title>
        )
    }

    initSetting (localStorageKey) {
        let res = lsdp.simple.get(localStorageKey)
        return res === null ? false : res === "true"
    }

    renderToggle (localStorageKey, description) {
        return (
        <>
            <div className="row mt-1">
                <div className="col d-flex align-items-center">
                    <input  type="checkbox"
                            className="c-toggle mx-1"
                            onClick={e => this.updFlag(localStorageKey, e.target.checked)}
                            defaultChecked={this.settings[localStorageKey]}
                    />
                    <div className="col text mb-0 ml-1">{description}</div>
                </div>
            </div>
        </>
        )
    }

    renderBody () {
        let t = this.props.t
        return (
            <div>
                {this.renderToggle(settings.upTrustedTokens, t("trade.tokenCard.raiseUpTrustedTokens"))}
                {this.renderToggle(settings.upBalances, t("trade.tokenCard.raiseUpBalances"))}
                {this.renderToggle(settings.upLpTokens, t("trade.tokenCard.raiseUpLpTokens"))}
            </div>
        )
    }

    closeAction () {
        this.setState({visibility : false})
    }

    openAction () {
        this.initSettings()
        this.setState({visibility: true})
    }

    updFlag (key, value) {
        lsdp.simple.write(key, value)
    }

    render () {
        return (
            <div className="d-flex align-items-center">
                <span className={`icon-Icon15 ml-3 token-card-settings`}
                      onClick={() => this.openAction()}
                />
                {this.state.visibility &&
                    <CommonModal renderHeader={this.renderHeader.bind(this)}
                                 renderBody={this.renderBody.bind(this)}
                                 closeAction={this.closeAction.bind(this)}
                    />
                }
            </div>
        )
    }
}

export default withTranslation()(TokenCardSetting)