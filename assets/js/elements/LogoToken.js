import React from 'react';

import presets from '../../store/pageDataPresets'
import swapUtils from '../utils/swapUtils'

import "../../css/logo-token.css"
import enqLogo from "../../img/ENEXlogo.png"


class LogoToken extends React.Component {
    constructor(props) {
        super(props)
        this.customClasses = this.props.customClasses ? this.props.customClasses : ""
    }

    render () {
        return (
            <div className={this.customClasses}>
                <div className={"d-flex align-items-center"}>
                    { this.props.data.url !== undefined &&
                        <div className="logo-wrapper-xs mr-2"
                             style = {{
                                 backgroundImage: `url(${presets.logoUrl}${this.props.data.net.name}/${this.props.data.url})`
                             }}
                        >
                            {this.props.data.url === null && <div className="unknown-logo">?</div>}
                        </div>
                    }
                    {this.props.data.hash &&
                        <div className="col">
                            <div className="row d-flex justify-content-start align-items-center">
                                <span>{this.props.data.value}</span>
                                { this.props.data.trustedToken &&
                                    <img src={enqLogo} alt="*" className="trusted-logo ml-2 mb-1"/> ||
                                    <></>
                                }
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

export default LogoToken