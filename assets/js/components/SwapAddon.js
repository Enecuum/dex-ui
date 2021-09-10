import React from 'react';
import Tooltip from '../elements/Tooltip';

class SwapAddon extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <div className="general-card p-4">
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">Mininmum received</span>
                        <Tooltip text='Mininmum received tooltip text' />
                    </div>
                    <div>
                        0.0009968 BRY
                    </div>
                </div>
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">Price impact</span>
                        <Tooltip text='Price impact tooltip text' />
                    </div>
                    <div>
                        <span className="text-color3">0.10%</span>
                    </div>
                </div>
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">Liquidity provider fee</span>
                        <Tooltip text='Liquidity provider fee tooltip text' />
                    </div>
                    <div>
                        0.02413 ENQ
                    </div>
                </div>                                
            </div>
        );
    }
}

export default SwapAddon;