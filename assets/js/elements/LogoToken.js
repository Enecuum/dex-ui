import React from 'react';

import presets from '../../store/pageDataPresets'

import "../../css/logo-token.css"


class LogoToken extends React.Component {
    constructor(props) {
        super(props)
        this.customClasses = this.props.customClasses ? this.props.customClasses : ""
    }

    render () {
        let net = 'enq'
        if (this.props.data.net === 'bit')
            net = 'bit'
        return (
            <div className={this.customClasses}>
                <div className={"d-flex align-items-center"}>
                    <div className="logo-wrapper-xs mr-2"
                         style = {{
                             backgroundImage: `url(${presets.logoUrl}${net}/${this.props.data.url})`
                         }}
                    >
                        {this.props.data.url === null && <div className="unknown-logo">?</div>}
                    </div>
                    <span>{this.props.data.value}</span>
                </div>
            </div>
        )
    }
}

export default LogoToken;