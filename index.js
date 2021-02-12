const e = React.createElement;

let connetcionListVisibility = false;

class Connect extends React.Component {
    render () {
        return e(
            'button',
            { 
                onClick : () => {
                    let cnct_services = document.getElementById('connection-services');
                    let cnct_opacity = document.getElementById('c-opacity');
                    if (!connetcionListVisibility) {
                        cnct_opacity.style.visibility = 'visible';
                        cnct_services.style.visibility = 'visible';
                        connetcionListVisibility = true;
                    } else {
                        cnct_opacity.style.visibility = 'hidden';
                        cnct_services.style.visibility = 'hidden';
                        connetcionListVisibility = false;
                    }
                },
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

ReactDOM.render(
    e(Connect),
    document.getElementById('root-connect')
);

// ------------------------------------------------------------------------------------------------

class Close extends React.Component {
    closeConnectionList () {
        let cnct_services = document.getElementById('connection-services');
        let cnct_opacity = document.getElementById('c-opacity');
        cnct_opacity.style.visibility = 'hidden';
        cnct_services.style.visibility = 'hidden';
        connetcionListVisibility = false;
    }

    render () {
        return [ 
            e(
                'div',
                { 
                    id : "close",
                    onClick : this.closeConnectionList
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
                'h5',
                {
                    style : {
                        textAlign : 'center',
                        width: '100%',
                        marginTop: '100px'
                    }
                },
                'Here you will be able to choose the service'
            )
        ]
    }
};

ReactDOM.render(
    e(Close),
    document.getElementById('connection-services')
);

// ------------------------------------------------------------------------------------------------

class Switch extends React.Component {
    constructor (props) {
        super(props);
        this.active = {
            opacity : {
                hover : 1,
                simple : 1
            },
            visibility : 'hidden'
        };
        this.passive = {
            opacity : {
                hover : 0.2,
                simple : 0
            },
            visibility : 'visible'
        }
    }

    switch (onElement) {
        let exchange_mode = document.getElementById('exchange-mode');
        let liquidity_mode = document.getElementById('liquidity-mode');
        let switch_e_text = document.getElementById('switch-e-text');
        let switch_l_text = document.getElementById('switch-l-text');
        let pair;
        if (onElement == 'exchange')
            pair = ['active', 'passive']
        else
            pair = ['passive', 'active']

        eval(`switch_e_text.style.visibility = this.${pair[0]}.visibility;`);
        eval(`switch_l_text.style.visibility = this.${pair[1]}.visibility;`);
        eval(`exchange_mode.style.opacity = this.${pair[0]}.opacity.simple;`);
        eval(`liquidity_mode.style.opacity = this.${pair[1]}.opacity.simple;`);
        eval(`document.getElementById('liquidity').style.visibility = this.${pair[0]}.visibility;`);
        eval(`document.getElementById('exchange').style.visibility = this.${pair[1]}.visibility;`);
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
                        visibility : this.active.visibility
                    }
                },
                'Exchange'
            ),
            e(
                'div',
                {
                    class : "switch-mode",
                    id : "exchange-mode",
                    onClick : this.switch.bind(this, 'exchange')
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
                        visibility : this.passive.visibility
                    }
                },
                'Liquidity'
            ),
            e(
                'div',
                {
                    class : "switch-mode",
                    id : "liquidity-mode",
                    onClick : this.switch.bind(this, 'liquidity')
                },
                'Liquidity'
            )
        ]
    }
};

ReactDOM.render(
    e(Switch),
    document.getElementById('switch')
);

// ------------------------------------------------------------------------------------------------

class Tokens extends React.Component {
    
};

ReactDOM.render(
    e(Tokens),
    document.getElementById('switch')
);