import React from 'react';

class PairLogos extends React.Component {
    constructor(props) {
        super(props);
        this.logoSize = props.logos.logoSize;        
    }

    render () {
        return (
            <div className="d-flex align-items-center justify-content-center token-pair-logo-wrapper mb-3">
                <div
                    className={`logo-wrapper-${this.logoSize}`}
                    style = {{ 
                        backgroundImage: `url(${this.props.logo1})`
                    }}
                >
                    <div className="unknown-logo-alt">?</div>
                </div>
                <div
                    className={`logo-wrapper-${this.logoSize}`}
                    style = {{
                        backgroundImage: `url(${this.props.logo1})`
                    }}
                >
                    <div className="unknown-logo-alt">?</div>
                </div>
            </div>
        );
    }
};

export default PairLogos;