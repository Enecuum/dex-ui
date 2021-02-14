class PageState {
    constructor () {
        // page modes
        this.modes = ['exchange', 'liquidity']
        this.mode = 0;
        // tokens
        this.tokens = [ // just for testing without backend
            'TKN',
            'TKN1',
            'TKN2',
            'TKN3',
            'TKN4',
            'TKN5',
            'TKN6',
            'TKN7',
            'TKN8',
            'TKN9',
            'TKN10',
            'TKN11',
            'TKN12',
            'TKN13',
            'TKN14',
            'TKN15'
        ];
        this.tokenFilter = '';
        // switch configs
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
        // connection card visibility
        this.connectionListVisibility = false;
    };

    switchMode (onElement) {
        if (onElement !== this.modes[this.mode]) {
            this.mode = (this.mode + 1) % 2;
            let exchange_mode = document.getElementById('exchange-mode');
            let liquidity_mode = document.getElementById('liquidity-mode');
            let switch_e_text = document.getElementById('switch-e-text');
            let switch_l_text = document.getElementById('switch-l-text');
            let pair;
            if (this.mode === 0)
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

    getInputField (fieldName, fieldClass, tokenName, _this) {
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
                    class : 'form-control mr-sm-2 input-field',
                    type : 'text',
                    placeholder : '0.0'
                }
            ),
            e(
                'button',
                { 
                    onClick : this.openTokenList.bind(this, _this, fieldClass),
                    class : `btn btn-secondary my-2 my-sm-0 ${fieldClass}`,
                    type : 'submit'
                },
                tokenName
            )
        ];
    };

    openTokenList (_this, fieldClass) {
        if (fieldClass === 'token-use')
            _this.activeToken = 0;
        else 
            _this.activeToken = 1;
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
};

let mySwapPage = new PageState();