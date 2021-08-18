import React from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import presets from '../../store/pageDataPresets';

import '../../css/switch.css';

class Switch extends React.Component {
    switchMode (mode) {
        this.props.changeMenuItem(mode);
        window.location.hash = '#!action=' + presets.paths[mode];
    };

    render () {
        const t = this.props.t;
        let colors = (this.props.menuItem == 'exchange') ? ['var(--color3)', 'var(--color2)'] : ['var(--color2)', 'var(--color3)'];
        return (
            <div className="d-flex align-items-center justify-content-center">
                <div    className="switch-mode"
                        id="exchange-mode"
                        style={{
                            backgroundColor : colors[0]
                        }}
                        onClick={this.switchMode.bind(this, 'exchange')}>
                    {t('trade.switch.mode0')}
                </div>
                <div    className="switch-mode"
                        id="liquidity-mode"
                        style={{
                            backgroundColor : colors[1]
                        }}
                        onClick={this.switchMode.bind(this, 'liquidity')}>
                    {t('trade.switch.mode1')}
                </div>
            </div>
        );
    }
};

const WSwitch = connect(mapStoreToProps(components.SWITCH), mapDispatchToProps(components.SWITCH))(withTranslation()(Switch));

export default WSwitch;