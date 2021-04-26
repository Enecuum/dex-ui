import React from 'react';

class BlankPage extends React.Component {
    constructor (props) {
        super(props);
        this.text = props.text;
    }

    render () {
        return (
            <div className='d-flex justify-content-center w-100 align-items-center blankpage-content-wrapper' style={{height: '100vh'}}>                
                <div className="h1">{this.text}</div>
            </div>
        );
    };
};

export default BlankPage;