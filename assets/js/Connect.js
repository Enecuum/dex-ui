import React from 'react';
import '../css/index.css';

class Connect extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    };

    render () {
        return (
            <button onClick={this.mySwapPage.openConnectionList.bind(this.mySwapPage)}
                    className='btn btn-secondary my-2 my-sm-0'
                    type='submit'
                    style={{
                        backgroundColor : 'var(--color3)'
                    }}>
                { this.mySwapPage.state.submitName }
            </button>
        );
    }
};

export default Connect;