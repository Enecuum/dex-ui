import React from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import '../../css/switch.css';

class Switch extends React.Component {
    switchMode (mode) {
        this.props.changeMenuItem(mode);
    };

    render () {
        let colors = (this.props.menuItem == 'exchange') ? ['var(--color3)', 'var(--color2)'] : ['var(--color2)', 'var(--color3)'];
        return (
            <div className="d-flex align-items-center justify-content-center">
                <div    className="switch-mode"
                        id="exchange-mode"
                        style={{
                            backgroundColor : colors[0]
                        }}
                        onClick={this.switchMode.bind(this, 'exchange')}>
                    {this.props.langData.mode0}
                </div>
                <div    className="switch-mode"
                        id="liquidity-mode"
                        style={{
                            backgroundColor : colors[1]
                        }}
                        onClick={this.switchMode.bind(this, 'liquidity')}>
                    {this.props.langData.mode1}
                </div>
            </div>
        );
    }
};

const WSwitch = connect(mapStoreToProps(components.SWITCH), mapDispatchToProps(components.SWITCH))(Switch);

export default WSwitch;