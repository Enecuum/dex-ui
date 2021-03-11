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
                <div    class="switch-mode"
                        id="exchange-mode"
                        style={{
                            color : this.mySwapPage.state.exchColor,
                            backgroundColor : this.mySwapPage.state.exchBackColor
                        }}
                        onClick={this.mySwapPage.switchMode.bind(this.mySwapPage, 'exchange')}
                        onMouseOver={this.mySwapPage.lightTheButton.bind(this.mySwapPage, 'exchange')}
                        onMouseOut={this.mySwapPage.turnOffTheButton.bind(this.mySwapPage, 'exchange')}>
                    {this.mySwapPage.state.langData.trade.switch.mode0}
                </div>
                <div    class="switch-mode"
                        id="liquidity-mode"
                        style={{
                            color : this.mySwapPage.state.lqdtColor,
                            backgroundColor : this.mySwapPage.state.lqdtBackColor
                        }}
                        onClick={this.mySwapPage.switchMode.bind(this.mySwapPage, 'liquidity')}
                        onMouseOver={this.mySwapPage.lightTheButton.bind(this.mySwapPage, 'liquidity')}
                        onMouseOut={this.mySwapPage.turnOffTheButton.bind(this.mySwapPage, 'liquidity')}>
                    {this.mySwapPage.state.langData.trade.switch.mode1}
                </div>
            </div>
        );
    }
};

export default Switch;