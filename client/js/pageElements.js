class Connect extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    }

    render () {
        return (
            <button onClick={this.mySwapPage.openConnectionList.bind(this.mySwapPage)}
                    class='btn btn-secondary my-2 my-sm-0'
                    type='submit'
                    style={{
                        backgroundColor : 'var(--color3)'
                    }}>
                { this.mySwapPage.state.submitName }
            </button>
        );
    }
};

// ====================================================================================================

class ConnectionService extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    }

    async connectToEnq () {
        await ENQweb3lib.enable()
        .then(res => {
            this.mySwapPage.pubKey = res;
            this.mySwapPage.connectionStatus = true;
        },
        () => {
            this.mySwapPage.connectionStatus = false;
        });
        this.mySwapPage.closeConnectionList();
        this.mySwapPage.updSubmitName();
    };

    render () {
        return (
            <div>
                <div class="close"
                    onClick={this.mySwapPage.closeConnectionList.bind(this.mySwapPage)}>
                </div>
                <h4 style={{
                        marginTop : '7%',
                        marginLeft : '6%'
                    }}>
                    {this.mySwapPage.state.langData.navbars.top.connectionCard.header}
                </h4>
                <div style={{
                        borderBottom: '1px solid #80808094',
                        marginTop : '25px',
                        width: '100%'
                    }}>
                </div>
                <button onClick={this.connectToEnq.bind(this)}
                        class='btn btn-secondary'
                        style={{
                            borderRadius: '20px',
                            width: '90%',
                            height: '60px',
                            marginLeft: '5%',
                            marginTop: '20px',
                            fontSize: '20px',
                            backgroundColor : 'var(--color3)'
                        }}>
                    EnqWallet
                </button>
            </div>
        );
    }
};

// ====================================================================================================

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
