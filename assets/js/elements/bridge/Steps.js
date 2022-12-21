import React from "react"
import '../../../css/step.css';

class Steps extends React.Component {
    constructor(props) {
        super(props)
    }

    render () {
        return (
            <>
                <div className="h5">Step 1 of 3</div>
                <div className="steps d-flex align-items-center justify-content-between my-3">
                    <div className="step-point step-point-in-progress">1</div>
                    <div className="step-edge step-edge-in-progress"></div>
                    <div className="step-point">2</div>
                    <div className="step-edge"></div>
                    <div className="step-point">3</div>
                </div>
            </>
        )
    }
}

export default Steps