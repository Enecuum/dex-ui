import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import Card from 'react-bootstrap/Card';
// import img from '../img/unknownPage.png';
// import '../../css/unknown-page.css';
import Steps from './../elements/bridge/Steps'
import BridgeForm from './../elements/bridge/BridgeForm'
import ClaimControl from './../elements/bridge/ClaimControl'
import '../../css/bridge.css';

class SpaceBridge extends React.Component {
	constructor(props) {
        super(props);
    }

    render () {
        return (
            <div id="bridgeWrapper" className='d-flex flex-column justify-content-center align-items-center'>
	            <div className="row w-100 mb-5">
	    			<div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>    			
						<Card className="swap-card">
						  <Card.Body className="p-0">
						    <div className="p-4 bottom-line-1">
						    	<div className="d-flex align-items-center justify-content-between nowrap">
						    		<div>
						    			<div className="h4 text-nowrap">Space Bridge - demo_1</div>
						    			<div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
						    		</div>
						    		<div>
							    		<button className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3">History</button>
							    		<button className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3">0xd16f....568b</button>
						    		</div>						    		
						    	</div>
						    </div>
						    <Card.Text as="div" className="p-4">
						    	<div>
									<Steps useSuspense={false}/>
							    </div>

							    <div>
							    	<BridgeForm useSuspense={false}/>
							    </div>
						    </Card.Text>
						  </Card.Body>
						</Card>    			
	    			</div>
	    		</div>


	    		<div className="row w-100">
	    			<div className='col-12 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3'>    			
						<Card className="swap-card">
						  <Card.Body className="p-0">
						    <div className="p-4 bottom-line-1">
						    	<div className="d-flex align-items-center justify-content-between nowrap">
						    		<div>
						    			<div className="h4 text-nowrap">Space Bridge - demo_2</div>
						    			<div className="text-color4">Transfer your liquidity via secured interchain space bridge</div>
						    		</div>
						    		<div>
							    		<button className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3">History</button>
							    		<button className="d-block w-100 btn btn-secondary mt-2 px-4 button-bg-3">0xd16f....568b</button>
						    		</div>						    		
						    	</div>
						    </div>
						    <Card.Text as="div" className="py-4 px-0">						    	
						    	<div className="px-4">
									<Steps useSuspense={false}/>
							    </div>

							    <div>
							    	<ClaimControl useSuspense={false}/>
							    </div>
						    </Card.Text>
						  </Card.Body>
						</Card>    			
	    			</div>
	    		</div>
            </div>
        );
    };
};

const WSpaceBridge = connect(mapStoreToProps(components.SPACE_BRIDGE), mapDispatchToProps(components.SPACE_BRIDGE))(withTranslation()(SpaceBridge));

export default WSpaceBridge;   