const e = React.createElement;
const startToken = '...';
let presets = new Presets();

class Root extends React.Component {
    constructor (props) {
        super(props);
        this.tokens = [];
        this.pairs = [];
        this.pubKey = '';
        // -------------------------------------
        this.connectionListVisibility = false;
        this.modes = ['exchange', 'liquidity'];
        this.mode = 0;
        this.activeField = 0;
        this.tokenFilter = '';
        this.connectionStatus = false;
        // -------------------------------------
        this.active = presets.active;
        this.passive = presets.passive;
        // -------------------------------------
        this.exchange = presets.exchange;
        this.liquidity = presets.liquidity;
        // -------------------------------------
        this.state = {
            exchColor : 'white',
            lqdtColor : 'black',
            exchBackColor : '#747cf4',
            lqdtBackColor : '#ecf4fc',

            header : this.exchange.header,
            addition : this.exchange.addition,
            plusVis : this.exchange.plusVis,
            exchVis : this.exchange.exchVis,

            name0  : this.exchange.name0,
            value0 : this.exchange.field0.value,
            token0 : this.exchange.field0.token,
            name1  : this.exchange.name1,
            value1 : this.exchange.field1.value,
            token1 : this.exchange.field1.token,
            submitName : 'Connect',

            userTokenValue : 0
        };
        // -------------------------------------
        this.updExternalData();
        Enecuum.connect();
    };

    async updExternalData () {
        this.tokens = await (await swapApi.getTokens()).json();
        this.pairs = await (await swapApi.getPairs()).json();
    }

    // ==================================================================================================== upd state

    switchTheSwitch () {
        if (this.mode == 0) {
            this.updState('exchColor', 'white');
            this.updState('lqdtColor', 'black');
            this.updState('exchBackColor', '#747cf4');
            this.updState('lqdtBackColor', '#ecf4fc');
        } else {
            this.updState('exchColor', 'black');
            this.updState('lqdtColor', 'white');
            this.updState('exchBackColor', '#ecf4fc');
            this.updState('lqdtBackColor', '#747cf4');
        }
    };

    updSubmitName () {
        console.log(window);
        if (this.connectionStatus)
            this.updState('submitName', 'Submit');
        else
            this.updState('submitName', 'Connect');
    };

    switchPageState () {
        let mode = this.getMode();
        this.updState('header', this[mode].header);
        this.updState('addition', this[mode].addition);
        this.updState('plusVis', this[mode].plusVis);
        this.updState('exchVis', this[mode].exchVis);
    };

    updCardInternals () {
        let mode = this.getMode();
        this.updState('name0', this[mode].name0);
        this.updState('value0', this[mode].field0.value);
        this.updState('token0', this[mode].field0.token);
        this.updState('name1', this[mode].name1);
        this.updState('value1', this[mode].field1.value);
        this.updState('token1', this[mode].field1.token);
    };

    updState (key, value) {
        this.setState(state => {
            state[key] = value;
            return state;
        });
    };
    
    // ======================================================================================================== utils
    getMode () {
        return this.modes[this.mode];
    };

    getActiveField (reverse) {
        if (reverse)
            return (this.activeField == 0) ? 'field1' : 'field0';
        else 
            return (this.activeField == 0) ? 'field0' : 'field1';
    };

    writeUserTokenValue () {
        this.updState('userTokenValue', 0);
        return;
        // let mode = this.getMode()
        // Enecuum.balanceOf({
        //     to : this.pubKey,
        //     tokenHash : this[mode].token0
        // }).then(
        //     res => {
        //         this.updState('userTokenValue', res.amount);
        //     }
        // );
    };

    changeToken (token) {
        let mode = this.getMode();
        let field = this.getActiveField();
        this[mode][field].token = token;
        this.countCounterField(mode, field);
        this.writeUserTokenValue();
        this.updCardInternals();
        this.closeConnectionList();
    };

    swapPair () {
        if (this.mode == 1)
            return;
        let mode = this.getMode();
        let tmp;
        for (let prop of ['value', 'token']) {
            tmp = this[mode].field0[prop];
            this[mode].field0[prop] = this[mode].field1[prop];
            this[mode].field1[prop] = tmp;
        }
        this.updCardInternals();
    };

    async sentTx () {
        if (this.connectionStatus) {
            // await Enecuum.sendTransaction({
            //     from : this.pubKey,
            //     to : presets.network.genesisPubKey,
            //     value : presets.network.nativeToken.fee,
            //     tokenHash : presets.network.nativeToken.hash,
            //     data : 'data'
            // });
            alert('Send tx');
        } else {
            this.openConnectionList();
        }
    };

    switchMode (onElement) {
        if (onElement !== this.modes[this.mode]) {
            this.mode = (this.mode + 1) % 2;            
            this.switchTheSwitch();
            this.switchPageState();
            this.updCardInternals();
        }
    };

    lightTheButton (button) {
        if (button == 'exchange')
            this.updState('exchBackColor', '#747cf473');
        else
            this.updState('lqdtBackColor', '#747cf473');
    };

    turnOffTheButton (button) {
        if (button == 'exchange') {
            if (this.mode == 0)
                this.updState('exchBackColor', '#747cf4');
            else 
                this.updState('exchBackColor', '#ecf4fc');
        }
        else {
            if (this.mode == 0)
                this.updState('lqdtBackColor', '#ecf4fc');
            else 
                this.updState('lqdtBackColor', '#747cf4');
        }
    };

    closeConnectionList () {
        let cnct_services = document.getElementById('connection-services');
        let cnct_opacity = document.getElementById('c-opacity');
        let tkn_list = document.getElementById('tokens-card');
        cnct_opacity.style.visibility = 'hidden';
        cnct_services.style.visibility = 'hidden';
        tkn_list.style.visibility = 'hidden';
        this.connectionListVisibility = false;
    };

    openConnectionList () {
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

    searchSwap (tokens) {
        return this.pairs.find(el => {
            if (tokens.indexOf(el.token_0.name) != -1 && 
                tokens.indexOf(el.token_1.name) != -1 && 
                el.token_0.name !== el.token_1.name) {
                return el;
            }
        });
    };

    countCoinValue (input_0, input_1) {
        try {
            return input_1 / input_0;
        } catch {
            return 0;
        }
    };

    getAddLiquidityPrice (input_0, input_1, coinValue) {
        return this.countCoinValue(input_0, input_1) * coinValue;
    };

    countLiqudity (pair) {
        return pair.token_0.volume * pair.token_1.volume;
    };

    getSwapPrice (pair, amountIn) {
        if (amountIn == 0) // use if instead of try/catch in order to check empty string
            return 0;
        return (1 - pair.pool_fee) * this.countLiqudity(pair) / amountIn;
    };

    countPrice (activeField, pair) {
        if (this.mode == 1) {
            if (activeField.token == pair.token_0.name)
                return this.getAddLiquidityPrice(pair.token_0.volume, pair.token_1.volume, activeField.value);
            else
                return this.getAddLiquidityPrice(pair.token_1.volume, pair.token_0.volume, activeField.value);
        } else {
            if (activeField.token == pair.token_0.name)
                return this.getSwapPrice(pair, activeField.value);
            else
                return this.getSwapPrice(pair, activeField.value);
        }
    };

    countCounterField (mode, field) {
        let activeField = this[mode][field];
        let counterField = this[mode][this.getActiveField(true)];
        if (activeField.token !== startToken && counterField.token !== startToken) {
            let pair = this.searchSwap([activeField.token, counterField.token]);
            if (pair === undefined)
                return;
            let counterFieldPrice = this.countPrice(activeField, pair);
            if (counterFieldPrice)
                counterField.value = counterFieldPrice;
            else 
                counterField.value = '';
            this.updCardInternals();
        }
    };

    changeField (fieldClass) {
        this.assignActiveField(fieldClass);
        let mode = this.getMode();
        let field = this.getActiveField();
        if (['insertText', 'deleteContentBackward', 'deleteContentForward'].indexOf(event.inputType) !== -1) {
            if (event.inputType == 'insertText' && !(new RegExp('[0-9|\\.]+')).test(event.data)) {
                // nothing to do. this.updCardInternals() will save you previous number
            } else if (event.inputType == 'deleteContentBackward' || event.inputType == 'deleteContentForward') {
                let newVal = document.getElementById(this.getInputFieldId()).value;
                this[mode][field].value = newVal;
                this.countCounterField(mode, field);
            } else {
                let newVal = document.getElementById(this.getInputFieldId()).value;
                if ((new RegExp('^[0-9]+\\.?[0-9]*$')).test(newVal) && !(new RegExp('^0(0)+')).test(newVal)) {
                    this[mode][field].value = newVal;
                    this.countCounterField(mode, field);
                }
            }
            this.updCardInternals();
        }
    };

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

    // ============================================================================== input field (render's elements)
    getInputField (props) {
        return [
            e(
                'p',
                { 
                    class : 'side',
                },
                props.fieldName
            ),
            e(
                'input',
                {
                    id : `input-${props.fieldClass}`,
                    onChange : this.changeField.bind(this, props.fieldClass),
                    class : 'form-control mr-sm-2 input-field',
                    type : 'text',
                    value : props.value,
                    placeholder : '0.0'
                }
            ),
            e(
                'button',
                {
                    onClick : this.openTokenList.bind(this, props.fieldClass),
                    class : `btn btn-secondary my-2 my-sm-0 ${props.fieldClass}`,
                    type : 'submit',
                    style : {
                        height : '40px',
                    }
                },
                props.tokenName
            ),
            e(
                'div',
                {
                    id : 'token-info'
                },
                'your amount: ' + props.userTokenAmount
            )
        ];
    };

    // ======================================================================================================= render
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
                                key : 0,
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
                            e(Connect, { outer : this })
                        ),
                    ]
                )
            ),
            e(
                'div',
                {
                    id : 'connection-services'
                },
                e(ConnectionService, { outer : this })
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
                e(Switch, { outer : this })
            ),
            e(
                'div',
                {
                    class : 'swap-card'
                },
                e(Card, { outer : this })
            ),
            e(
                'div',
                {
                    id : 'tokens-card'
                },
                e(Tokens, { outer : this })
            )
        ]
    };
};

ReactDOM.render(
    e(Root),
    document.getElementById('root')
);

