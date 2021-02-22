class Connect extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    }

    render () {
        return e(
            'button',
            { 
                onClick : this.mySwapPage.openConnectionList.bind(this.mySwapPage),
                class : 'btn btn-secondary my-2 my-sm-0',
                type : 'submit',
                style : {
                    backgroundColor : '#747cf4'
                }
            },
            'Connect'
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
        await Enecuum.enable()
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
        return [ 
            e(
                'div',
                { 
                    class : "close",
                    onClick : this.mySwapPage.closeConnectionList.bind(this.mySwapPage)
                }
            ),
            e(
                'h4',
                {
                    style : {
                        marginTop : '7%',
                        marginLeft : '6%'
                    }
                },
                'Connect your wallet'
            ),
            e(
                'div',
                {
                    style : {
                        borderBottom: '1px solid #80808094',
                        marginTop : '25px',
                        width: '100%'
                    }
                }
            ),
            e(  
                'button',
                {
                    onClick : this.connectToEnq.bind(this),
                    class : 'btn btn-secondary',
                    style : {
                        borderRadius: '20px',
                        width: '90%',
                        height: '60px',
                        marginLeft: '5%',
                        marginTop: '20px',
                        fontSize: '20px'
                    }
                },
                'EnqWallet'
            )
        ]
    }
};

// ====================================================================================================

class Switch extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    }

    render () {
        return [
            e(
                'div',
                {
                    class : "switch-mode",
                    id : "exchange-mode",
                    style : {
                        color : this.mySwapPage.state.exchColor,
                        backgroundColor : this.mySwapPage.state.exchBackColor
                    },
                    onClick : this.mySwapPage.switchMode.bind(this.mySwapPage, 'exchange'),
                    onMouseOver : this.mySwapPage.lightTheButton.bind(this.mySwapPage, 'exchange'),
                    onMouseOut : this.mySwapPage.turnOffTheButton.bind(this.mySwapPage, 'exchange')
                },
                'Exchange'
            ),
            e(
                'div',
                {
                    class : "switch-mode",
                    id : "liquidity-mode",
                    style : {
                        color : this.mySwapPage.state.lqdtColor,
                        backgroundColor : this.mySwapPage.state.lqdtBackColor
                    },
                    onClick : this.mySwapPage.switchMode.bind(this.mySwapPage, 'liquidity'),
                    onMouseOver : this.mySwapPage.lightTheButton.bind(this.mySwapPage, 'liquidity'),
                    onMouseOut : this.mySwapPage.turnOffTheButton.bind(this.mySwapPage, 'liquidity')
                },
                'Liquidity'
            )
        ]
    }
};
