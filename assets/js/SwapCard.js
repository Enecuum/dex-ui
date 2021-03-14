import React from 'react';
import History from './History';
import Settings from './Settings';
import '../css/swap-card.css';
import '../css/font-style.css';

class SwapCard extends React.Component {
    constructor(props) {
        super(props);
        this.activeToken = 0;
        this.mySwapPage = props.outer;
    }

    render() {
        return (
            <div>
                <div className='row no-gutters swap-header-group'>
                    <div className='col-9'>
                        <h4 className='row' id='swap-mode-header'>
                            {this.mySwapPage.state.card.header}
                        </h4>
                        <p className='row' id='under-header'>
                            {this.mySwapPage.state.card.description}
                        </p>
                    </div>
                    <div className='col d-flex justify-content-center align-items-center no-gutters'>
                        <Settings />
                        <History />
                    </div>
                </div>
                <div id='head-line'></div>
                <div className='row swap-input' id='from'>
                    {
                        this.mySwapPage.getInputField({ fieldName : this.mySwapPage.state.card.input0, 
                                                        fieldClass : 'token-use',
                                                        tokenName : this.mySwapPage.state.card.token0, 
                                                        value : this.mySwapPage.state.card.value0,
                                                        userTokenAmount : this.mySwapPage.state.userTokenValue }) 
                    }
                </div>
                <div className='row' id='exch' onClick={this.mySwapPage.swapPair.bind(this.mySwapPage)}>
                    <span className='icon-Icon13 exch-button d-flex align-items-end' />
                </div>
                <div className='swap-input' id='to'>
                    { 
                        this.mySwapPage.getInputField({ fieldName : this.mySwapPage.state.card.input1, 
                                                        fieldClass : 'token-use1', 
                                                        tokenName : this.mySwapPage.state.card.token1,
                                                        value : this.mySwapPage.state.card.value1,
                                                        userTokenAmount : this.mySwapPage.state.userTokenValue }) 
                    }
                </div>
                <div className='row no-gutters'> 
                    <div className='col-7 d-flex justify-content-center'>Coming soon</div>
                    <div className='col-3 d-flex justify-content-end'>1%</div>
                </div>
                <button onClick={this.mySwapPage.sentTx.bind(this.mySwapPage)}
                    className='btn btn-secondary my-2 my-sm-0 swap-input'
                    type='submit'
                    id='submit'>
                    {this.mySwapPage.state.submitName}
                </button>
            </div>
        );
    }
};

export default SwapCard;