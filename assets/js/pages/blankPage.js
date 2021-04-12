import React from 'react';

class BlankPage extends React.Component {
    constructor (props) {
        super(props);
        this.text = props.text;
    }

    render () {
        return (
            <div className='d-flex justify-content-center align-items-center h-100 blankpage-content-wrapper'>                
                <div className="h1">{this.text}</div>
            </div>
        );
    };
};

export default BlankPage;