import React from 'react';

import "../../css/logo-token.css"

class LogoToken extends React.Component {
    constructor(props) {
        super(props)
        this.customClasses = this.props.customClasses ? this.props.customClasses : ""
    }

    render () {
        return (
            <div className={this.customClasses}>
                <div className={"d-flex align-items-center"}>
                    <div className="logo-wrapper-xs mr-2"
                         style = {{
                             backgroundImage: `url(${this.props.data.url})`
                         }}
                    >
                        <div className="unknown-logo">?</div>
                    </div>
                    <span>{this.props.data.value}</span>
                </div>
            </div>
        )
    }
}

export default LogoToken;