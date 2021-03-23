import React from 'react';
import '../css/index.css';

class Connect extends React.Component {
    constructor(props) {
        super(props);
        this.root = props.outer;
    };

    renderConnectionButton() {
        return (
            <button onClick={this.root.openConnectionList.bind(this.root)}
                className='btn btn-secondary my-2 my-sm-0 c-co connect-btn d-flex align-items-center justify-content-center'
                type='submit'
                style={{
                    backgroundColor: 'var(--color3)'
                }}>
                { this.root.state.langData.navbars.top.connect}
            </button>
        );
    };

    render() {
        return this.renderConnectionButton();
    }
};

export default Connect;