import React from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import '../../css/index.css';

class Connect extends React.Component {
    renderConnectionButton() {
        return (
            <button onClick={this.props.openConList.bind(this.props)}
                className='btn btn-secondary my-2 my-sm-0 c-co connect-btn d-flex align-items-center justify-content-center'
                type='submit'
                style={{
                    backgroundColor: 'var(--color3)'
                }}>
                { this.props.langData.connect}
            </button>
        );
    };

    render() {
        return this.renderConnectionButton();
    }
};

const WConnect = connect(mapStoreToProps(components.CONNECT), mapDispatchToProps(components.CONNECT))(Connect);

export default WConnect;