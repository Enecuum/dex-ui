import React from 'react';

import presets from "../../store/pageDataPresets"

class PairLogos extends React.Component {
    constructor(props) {
        super(props)
        this.logoSize = props.logos.logoSize
    }

    render () {
        return (
            <div className="d-flex align-items-center justify-content-center token-pair-logo-wrapper mb-3">
                <div
                    className={`logo-wrapper-${this.logoSize}`}
                    style = {{ 
                        backgroundImage: `url(${presets.logoUrl}${this.props.logos.net.name}/${this.props.logos.logo1})`
                    }}
                >
                    {this.props.logos.logo1 === null && <div className="unknown-logo-alt">?</div>}
                </div>
                <div
                    className={`logo-wrapper-${this.logoSize}`}
                    style = {{
                        backgroundImage: `url(${presets.logoUrl}${this.props.logos.net.name}/${this.props.logos.logo2})`
                    }}
                >
                    {this.props.logos.logo2 === null && <div className="unknown-logo-alt">?</div>}
                </div>
            </div>
        )
    }
}

export default PairLogos;