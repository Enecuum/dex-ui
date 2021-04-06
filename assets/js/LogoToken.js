import React from 'react';

import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps';

class LogoToken extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <div className="d-flex align-items-center justify-content-end">
                <div
                    className="logo-wrapper-xs mr-2"
                    style = {{
                        backgroundImage: `url(${this.props.data.url})`
                    }} /> 
                <span>{this.props.data.value}</span>
            </div>
        );
    }
};

export default LogoToken;