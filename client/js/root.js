const e = React.createElement;

class Root extends React.Component {
    constructor (props) {
        super(props);
        // ---------------------------------------------------------------------- test-data
        this.tokens = [
            'ENQ',
            'BTC',
            'ETH',
            'TKN',
            'SVG',
            'RGB',
            'ADT',
            'ADB',
            'USD',
            'DDT',
            'VTB',
            'UPD',
            'UVC',
            'POP',
            'TOP',
            'FAR'
        ];
        this.pairs = [
            {
                "token_0" : "BTC",
                "token_1" : "ENQ",
                't1_per_t2' : 1.05
            }
        ];
        // ----------------------------------------------------------------------
        this.activeField = 0;
        this.tokenFilter = '';
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
        this.connectionListVisibility = false;
        this.modes = ['exchange', 'liquidity'];
        this.mode = 0;
        this.exchange = {
            name0 : 'From',
            name1 : 'To',
            field0 : {
                value : '',
                token : '...'
            },
            field1 : {
                value : '',
                token : '...'
            }
        };
        this.liquidity = {
            name0 : 'Input',
            name1 : 'Input',
            field0 : {
                value : '',
                token : '...'
            },
            field1 : {
                value : '',
                token : '...'
            }
        }
        this.state = {
            header : 'Exchange',
            addition : 'Trade tokens in an instant',
            plusVis : 'hidden',
            exchVis : 'visible',
            name0  : this.exchange.name0,
            value0 : this.exchange.field0.value,
            token0 : this.exchange.field0.token,
            name1  : this.exchange.name1,
            value1 : this.exchange.field1.value,
            token1 : this.exchange.field1.token
        };
    };
    
    getMode () {
        return this.modes[this.mode];
    };

    getActiveField () {
        return (this.activeField == 0) ? 'field0' : 'field1';
    };

    refreshState () {
        let mode = this.getMode();
        this.setState(state => {
            eval(`
                state.name0  = this.${mode}.name0;
                state.value0 = this.${mode}.field0.value;
                state.token0 = this.${mode}.field0.token;
                state.name1  = this.${mode}.name1;
                state.value1 = this.${mode}.field1.value;
                state.token1 = this.${mode}.field1.token;
            `);
            return state;
        });
    };

    changeToken (token) {
        let mode = this.getMode();
        let field = this.getActiveField();
        eval(`this.${mode}.${field}.token = token`);
        this.refreshState();
        this.closeConnectionList();
    };

    swapPair () {
        if (this.mode == 1)
            return;
        let mode = this.getMode();
        let tmp;
        for (let prop of ['value', 'token']) {
            eval(`tmp = this.${mode}.field0.${prop}`);
            eval(`this.${mode}.field0.${prop} = this.${mode}.field1.${prop}`);
            eval(`this.${mode}.field1.${prop} = tmp`);
        }
        this.refreshState();
    };

    switchMode (onElement) {
        if (onElement !== this.modes[this.mode]) {
            this.mode = (this.mode + 1) % 2;
            let pair;
            if (this.mode === 0)
                pair = ['active', 'passive'];
            else
                pair = ['passive', 'active'];
            // -------------------------------------------------------------------------------- TODO refactoring
            let exchange_mode = document.getElementById('exchange-mode');
            let liquidity_mode = document.getElementById('liquidity-mode');
            let switch_e_text = document.getElementById('switch-e-text');
            let switch_l_text = document.getElementById('switch-l-text');
            eval(`switch_e_text.style.visibility = this.${pair[0]}.visibility;`);
            eval(`switch_l_text.style.visibility = this.${pair[1]}.visibility;`);
            eval(`exchange_mode.style.opacity = this.${pair[0]}.opacity.simple;`);
            eval(`liquidity_mode.style.opacity = this.${pair[1]}.opacity.simple;`);
            this.setState(state => {
                let tmp = state.plusVis;
                state.plusVis = state.exchVis;
                state.exchVis = tmp;
                return state;
            });
            this.refreshState();
        }
    };

    closeConnectionList () {
        // -------------------------------------------------------------------------------- TODO refactoring
        let cnct_services = document.getElementById('connection-services');
        let cnct_opacity = document.getElementById('c-opacity');
        let tkn_list = document.getElementById('tokens-card');
        cnct_opacity.style.visibility = 'hidden';
        cnct_services.style.visibility = 'hidden';
        tkn_list.style.visibility = 'hidden';
        this.connectionListVisibility = false;
    };

    openConnectionList () {
        // -------------------------------------------------------------------------------- TODO refactoring
        let cnct_services = document.getElementById('connection-services');
        let cnct_opacity = document.getElementById('c-opacity');
        if (!this.connectionListVisibility) {
            cnct_opacity.style.visibility = 'visible';
            cnct_services.style.visibility = 'visible';
            this.connectionListVisibility = true;
        } else {
            cnct_opacity.style.visibility = 'hidden';
            cnct_services.style.visibility = 'hidden';
            this.connectionListVisibility = false;
        }
        let t_c = document.getElementById('tokens-card')
        if (t_c.style.visibility === 'visible') {
            document.getElementById('tokens-card').style.visibility = 'hidden';
            cnct_opacity.style.visibility = 'visible';
            cnct_services.style.visibility = 'visible';
            this.connectionListVisibility = true;
        }
    };

    getInputFieldId () {
        return (this.activeField == 0) ? 'input-token-use': 'input-token-use1';
    };  

    changeField (fieldClass) {
        this.assignActiveField(fieldClass);
        let mode = this.getMode();
        let field = this.getActiveField();
        if (['insertText', 'deleteContentBackward', 'deleteContentForward'].indexOf(event.inputType) !== -1) {
            if (event.inputType == 'insertText' && !(new RegExp('[0-9|\\.]+')).test(event.data)) {

            } else {
                eval(`this.${mode}.${field}.value = document.getElementById("${this.getInputFieldId()}").value`);
            }
            this.refreshState();
        }
    }

    openTokenList (fieldClass) {
        if (fieldClass === 'token-use')
            this.activeField = 0;
        else 
            this.activeField = 1;
        let cnct_opacity = document.getElementById('c-opacity');
        let tokensCard = document.getElementById('tokens-card');
        if (!this.connectionListVisibility) {
            cnct_opacity.style.visibility = 'visible';
            tokensCard.style.visibility = 'visible';
            this.connectionListVisibility = true;
        } else {
            tokensCard.style.visibility = 'hidden';
            cnct_opacity.style.visibility = 'hidden';
            this.connectionListVisibility = false;
        }
    };

    assignActiveField (fieldClass) {
        if (fieldClass == 'token-use')
            this.activeField = 0;
        else
            this.activeField = 1;
    };

    getInputField (fieldName, fieldClass, tokenName, value) {
        return [
            e(
                'p',
                { 
                    class : 'side',
                },
                fieldName
            ),
            e(
                'input',
                {
                    id : `input-${fieldClass}`,
                    onChange : this.changeField.bind(this, fieldClass),
                    class : 'form-control mr-sm-2 input-field',
                    type : 'text',
                    value : value,
                    placeholder : '0.0'
                }
            ),
            e(
                'button',
                {
                    onClick : this.openTokenList.bind(this, fieldClass),
                    class : `btn btn-secondary my-2 my-sm-0 ${fieldClass}`,
                    type : 'submit',
                    style : {
                        height : '40px',
                    }
                },
                tokenName
            )
        ];
    };

    render () {
        return [ 
            e(
                'div',
                null,
                e(
                    'nav',
                    {
                        class : 'navbar navbar-expand-lg navbar-light new-color'
                    },
                    [
                        e(
                            'img',
                            {
                                src : 'img/logo.png',
                                width : '30px',
                                height : '30px'
                            }
                        ),
                        e(
                            'h3',
                            {
                                class : 'navbar-brand'
                            },
                            'EnecuumSwap'
                        ),
                        e(
                            'div',
                            {
                                id : 'root-connect',
                                class : 'connect-btn'
                            },
                            e(Connect, { outer : this})
                        ),
                    ]
                )
            ),
            e(
                'div',
                {
                    id : 'connection-services'
                },
                e(ConnectionService, { outer : this})
            ),
            e(
                'div',
                {
                    id : 'c-opacity'
                }
            ),
            e(
                'div',
                {
                    id : 'switch'
                },
                e(Switch, { outer : this})
            ),
            e(
                'div',
                {
                    class : 'swap-card',
                },
                e(Card, { outer : this})
            ),
            e(
                'div',
                {
                    id : 'tokens-card'
                },
                e(Tokens, { outer : this})
            )
        ]
    };
};

ReactDOM.render(
    e(Root),
    document.getElementById('root')
);