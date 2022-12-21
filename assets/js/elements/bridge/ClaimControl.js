import React from "react"
import '../../../css/step.css';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class ClaimControl extends React.Component {
    constructor(props) {
        super(props)
    }

    render () {
        return (
            <>
                <div className="d-flex align-items-start justify-content-between mb-3 px-4">
                    <div>
                        From Ethereum To Enecuum
                    </div>
                    <button className="btn btn-secondary px-4 button-bg-3">Validate</button>
                </div>
                <div className="bottom-line-1 mb-3 pb-3">
                    <div className="text-color4 px-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                Amount:
                            </div>
                            <div>
                                100,000.256854  (ETH)
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                Est. Gas: $1.12 (123 GWEI)
                            </div>
                            <div>
                                Est. time: 5min
                            </div>
                        </div>                    
                    </div>
                </div>
                <div className="pt-3 px-4">
                    <div className="mb-2">
                        <div className="mb-2">Validating:</div>
                        <div className="progress" style={{'height':'30px'}}>
                            <div className="progress-bar progress-bar-striped progress-bar-animated bg-info" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{'width': '100%'}}>In progress...</div>
                        </div>                   
                    </div>
                    
                    <button className="btn btn-secondary px-4 button-bg-3 w-100">Claim</button>
                </div>
            </>
        )
    }
}

export default ClaimControl