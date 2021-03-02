
class Tokens extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
        this.state = {
            list : this.makeList()
        };
        this.initTokenList();
    }

    async initTokenList () {
        while (this.makeList().length === 0)
            await new Promise(resolve => { setTimeout(resolve, 100) });
        this.setState( { list : this.makeList()} );
    };

    getTokens (searchWord) {
        return this.mySwapPage.tokens.filter(el => (new RegExp(`.*${searchWord.trim().toLowerCase()}.*`)).test(el.toLowerCase()));
    }

    assignToken (token) {
       this.mySwapPage.changeToken(token);
    }

    makeList () {
        return this.getTokens(this.mySwapPage.tokenFilter).map(el => {
            return e(
                'option',
                {
                    onClick : this.assignToken.bind(this, el),
                    class : 'token-option',
                    style : {
                        textAlign : 'left',
                        color : 'var(--color3)',
                        fontSize : '20px',
                        padding : '10px',
                        borderRadius : '10px'
                    }
                },
                el
            );
        });
    }

    changeList () {
        if (['insertText', 'deleteContentBackward', 'deleteContentForward'].indexOf(event.inputType) !== -1) {
            this.mySwapPage.tokenFilter = document.getElementById('token-filter-field').value;
            this.setState( { list : this.makeList()} );
        }
    }

    render () {
        return [
            e(
                'div',
                { 
                    class : "close",
                    onClick : this.mySwapPage.closeConnectionList.bind(this.mySwapPage),
                    style : {
                        marginTop : '-10px',
                        marginRight : '-6px'
                    }
                }
            ),
            e(
                'p',
                {
                    style : {
                        fontWeight: 'bold',
                        marginTop: '22px',
                        marginLeft: '30px'
                    }
                },
                'Choose a token'
            ),
            e(
                'div',
                {
                    style : {
                        borderBottom: '1px solid #80808094',
                        marginTop : '15px',
                        width: '100%'
                    }
                }
            ),
            e(
                'input',
                {
                    id : 'token-filter-field',
                    onChange : this.changeList.bind(this),
                    class : 'form-control mr-sm-2',
                    type : 'text',
                    placeholder : 'Search by name',
                    style : {
                        textAlign : 'left',
                        width : '90%',
                        marginLeft : '5%',
                        marginTop : '15px',
                        borderRadius : '20px'
                    }
                }
            ),
            e(
                'select',
                {
                    multiple : true,
                    class : 'form-control',
                    id : 'full-token-list',
                    style : {
                        borderRadius : '5px',
                        width : '90%',
                        marginLeft : '5%',
                        marginTop : '20px',
                        backgroundColor : 'var(--color1)',
                        height : '77.5%',
                        border : 0
                    }
                },
                this.state.list
            )
        ]
    }
};