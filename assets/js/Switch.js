import React from 'react';
import '../css/switch.css';

class Switch extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    }

    render () {
        return (
            <div>
                <div    className="switch-mode"
                        id="exchange-mode"
                        style={{
                            backgroundColor : this.mySwapPage.state.exchBackColor
                        }}
                        onClick={this.mySwapPage.switchMode.bind(this.mySwapPage, 'exchange')}>
                    {this.mySwapPage.state.langData.trade.switch.mode0}
                </div>
                <div    className="switch-mode"
                        id="liquidity-mode"
                        style={{
                            backgroundColor : this.mySwapPage.state.lqdtBackColor
                        }}
                        onClick={this.mySwapPage.switchMode.bind(this.mySwapPage, 'liquidity')}>
                    {this.mySwapPage.state.langData.trade.switch.mode1}
                </div>
            </div>
        );
    }
};

export default Switch;