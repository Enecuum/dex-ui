import React from 'react';

import presets from '../../store/pageDataPresets'
import swapUtils from '../utils/swapUtils'

import "../../css/logo-token.css"
import enqLogo from "../../img/ENEXlogo.png"


class LogoTokenDef extends React.Component {
    constructor(props) {
        super(props)
        this.customClasses = this.props.customClasses ? this.props.customClasses : ""
        this.size = this.props.data.size ? this.props.data.size : "xs"
    }

    render () {
        return (
            <div className={this.customClasses}>
                <div className={"d-flex align-items-center"}>
                    { this.props.data.url !== undefined &&
                        <div className={`logo-wrapper-${this.size} ${this.props.data.value ? "mr-2" : "mr-0"}`}
                             style = {(this.props.data.url !== null) ? {
                                 backgroundImage: `url(${presets.logoUrl}${this.props.data.net.name}/${this.props.data.url})`
                             } : {}}
                        >
                            {this.props.data.url === null && <div className={`unknown-logo-${this.size}`}>?</div>}
                        </div>
                    }
                    {this.props.data.hash &&
                        <div className="col">
                            <div className="row d-flex justify-content-start align-items-center">
                                <span>{this.props.data.value}</span>
                                { this.props.additionalInfo }
                            </div>
                            <div className="row text-muted token-hash">
                                {swapUtils.packAddressString(this.props.data.hash)}
                            </div>
                        </div> ||
                        <span>{this.props.data.value}</span>
                    }
                </div>
            </div>
        )
    }
}

class LogoTokenTrusted extends React.Component {
    render () {
        return (
            <LogoTokenDef additionalInfo={<img src={enqLogo} alt="*" className="trusted-logo ml-2 mb-1"/>}
                          customClasses={this.props.customClasses}
                          data={this.props.data}
            />
        )
    }
}

class LogoTokenLP extends React.Component {

    render () {
        let addInfo = <div className="ml-2">
            <a href = {"/#!action=swap&pair=" + this.props.fToken.ticker + "-" + this.props.sToken.ticker + '&from=' + this.props.fToken.hash + "&to=" + this.props.sToken.hash}
               className="token-caption"
            >
                {this.props.fToken.ticker}/{this.props.sToken.ticker}
            </a>
        </div>
        return (
            <LogoTokenDef additionalInfo={addInfo}
                          customClasses={this.props.customClasses}
                          data={this.props.data}
            />
        )
    }
}

class LogoToken extends React.Component {
    render () {
        return (
            <LogoTokenDef additionalInfo={<></>}
                          customClasses={this.props.customClasses}
                          data={this.props.data}
            />
        )
    }
}

export {
    LogoToken,
    LogoTokenLP,
    LogoTokenTrusted
}