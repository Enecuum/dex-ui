import React from 'react';
import PairLogos from '../components/PairLogos';

class LPTokensWalletInfo extends React.Component {
    constructor(props) {
        super(props);
        this.logo1 = props.data.logo1;
        this.logo2 = props.data.logo2;
        this.token1 = props.data.token1;
        this.token2 = props.data.token2;
    };

    render () {
        return (
            <div className="general-card p-4">
                <div className="d-flex align-items-center justify-content-between py-2">
                    <PairLogos  logos={{logo1 : this.logo1, logo2 : this.logo2, logoSize : 'sm'}} />
                    <div>
                        {this.token1}/{this.token2}
                    </div>
                </div>
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        {this.token1}
                    </div>
                    <div>
                        0
                    </div>
                </div>
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        {this.token2}
                    </div>
                    <div>
                        0
                    </div>
                </div>                                
            </div>
        );
    }
};

export default LPTokensWalletInfo;