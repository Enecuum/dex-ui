import React from 'react';
import '../css/switch.css';

class Switch extends React.Component {
    constructor (props) {
        super(props);
        this.root = props.root;
        this.mode = props.root.state.mode;
        this.state = {
            exchBackColor : 'var(--color3)',
            lqdtBackColor : 'var(--color2)'
        };
    }

    switchMode (newMode) {
        if (newMode !== this.mode) {
            this.root.setState({ menuItem : newMode });
            this.mode = newMode;
            this.switchTheSwitch();
        }
    };

    switchTheSwitch () {
        const switchItems = ['exchBackColor', 'lqdtBackColor'];
        let colors = ['var(--color2)', 'var(--color3)'];
        if (this.mode == 'exchange')
            [colors[0], colors[1]] = [colors[1], colors[0]];
        for (let i in switchItems)
            this.setState({ [switchItems[i]] : colors[i] });
    };

    render () {
        return (
            <div>
                <div    className="switch-mode"
                        id="exchange-mode"
                        style={{
                            backgroundColor : this.state.exchBackColor
                        }}
                        onClick={this.switchMode.bind(this, 'exchange')}>
                    {this.root.state.langData.trade.switch.mode0}
                </div>
                <div    className="switch-mode"
                        id="liquidity-mode"
                        style={{
                            backgroundColor : this.state.lqdtBackColor
                        }}
                        onClick={this.switchMode.bind(this, 'liquidity')}>
                    {this.root.state.langData.trade.switch.mode1}
                </div>
            </div>
        );
    }
};

export default Switch;