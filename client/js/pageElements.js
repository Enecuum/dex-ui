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
                'p',
                { 
                    id : 'switch-e-text',
                    style : {
                        position : 'absolute',
                        left : '45px',
                        color : 'black',
                        top : '1px',
                        fontSize : '22px',
                        visibility : this.mySwapPage.active.visibility
                    }
                },
                'Exchange'
            ),
            e(
                'div',
                {
                    class : "switch-mode",
                    id : "exchange-mode",
                    onClick : this.mySwapPage.switchMode.bind(this.mySwapPage, 'exchange')
                },
                'Exchange'
            ),
            e(
                'p',
                { 
                    id : 'switch-l-text',
                    style : {
                        position : 'absolute',
                        right : '54px',
                        color : 'black',
                        top : '1px',
                        fontSize : '22px',
                        visibility : this.mySwapPage.passive.visibility
                    }
                },
                'Liquidity'
            ),
            e(
                'div',
                {
                    class : "switch-mode",
                    id : "liquidity-mode",
                    onClick : this.mySwapPage.switchMode.bind(this.mySwapPage, 'liquidity')
                },
                'Liquidity'
            )
        ]
    }
};
