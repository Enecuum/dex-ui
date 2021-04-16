import React from 'react';

class PairLogos extends React.Component {
    constructor(props) {
        super(props);
        this.logo1 = props.logos.logo1;
        this.logo2 = props.logos.logo2;
        this.logoSize = props.logos.logoSize;        
    }

    render () {
        return (
            <div className="d-flex align-items-center justify-content-center token-pair-logo-wrapper mb-3">
                <div
                    className={`logo-wrapper-${this.logoSize}`}
                    style = {{ 
                        backgroundImage: `url(${this.logo1})`
                    }} />   
                <div
                    className={`logo-wrapper-${this.logoSize}`}
                    style = {{
                        backgroundImage: `url(${this.logo2})`
                    }} />
            </div>
        );
    }
};

export default PairLogos;