import React from 'react';
import '../css/switch.css';

class Switch extends React.Component {
    constructor (props) {
        super(props);
        this.root = props.root;
    }

    switchMode (newMode) {
        if (newMode !== this.root.state.menuItem) {
            this.root.setState({ menuItem : newMode });
            this.root.state.menuItem = newMode;
        }
    };

    render () {
        let colors = (this.root.state.menuItem == 'exchange') ? ['var(--color3)', 'var(--color2)'] : ['var(--color2)', 'var(--color3)'];
        return (
            <div>
                <div    className="switch-mode"
                        id="exchange-mode"
                        style={{
                            backgroundColor : colors[0]
                        }}
                        onClick={this.switchMode.bind(this, 'exchange')}>
                    {this.root.state.langData.trade.switch.mode0}
                </div>
                <div    className="switch-mode"
                        id="liquidity-mode"
                        style={{
                            backgroundColor : colors[1]
                        }}
                        onClick={this.switchMode.bind(this, 'liquidity')}>
                    {this.root.state.langData.trade.switch.mode1}
                </div>
            </div>
        );
    }
};

export default Switch;