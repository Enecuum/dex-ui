import React from "react"
import { withTranslation } from "react-i18next"

import lsdp from "../utils/localStorageDataProcessor"
import {initSettings, settings} from "../utils/tokensSettings"


class TokenCardSettings extends React.Component {
    constructor(props) {
        super(props)

        this.settings = initSettings()
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

    updFlag (key, value) {
        lsdp.simple.write(key, value)
    }

    render () {
        return this.renderBody()
    }
}

export default withTranslation()(TokenCardSettings)