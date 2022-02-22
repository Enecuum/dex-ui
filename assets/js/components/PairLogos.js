import React from 'react';

import presets from "../../store/pageDataPresets"

class PairLogos extends React.Component {
    constructor(props) {
        super(props)
        this.customClasses = this.props.customClasses ? this.props.customClasses : ""
        this.size = this.props.logos.size ? this.props.logos.size : "sm"
    }

    render () {
        return (
            <div className={"d-flex align-items-center justify-content-center token-pair-logo-wrapper mb-3" + this.customClasses}>
                <div
                    className={`logo-wrapper-${this.size}`}
                    style = {(this.props.logos.logo1 !== null) ? {
                        backgroundImage: `url(${presets.logoUrl}${this.props.logos.net.name}/${this.props.logos.logo1})`
                    } : {}}
                >
                    {this.props.logos.logo1 === null && <div className={`unknown-logo-${this.size}`}>?</div>}
                </div>
                <div
                    className={`logo-wrapper-${this.size}`}
                    style = {(this.props.logos.logo2 !== null) ? {
                        backgroundImage: `url(${presets.logoUrl}${this.props.logos.net.name}/${this.props.logos.logo2})`
                    } : {}}
                >
                    {this.props.logos.logo2 === null && <div className={`unknown-logo-${this.size}`}>?</div>}
                </div>
            </div>
        )
    }
}

export default PairLogos;