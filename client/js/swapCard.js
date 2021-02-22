class Card extends React.Component {
    constructor (props) {
        super(props);
        this.activeToken = 0;
        this.mySwapPage = props.outer;
    }

    render () {
        return [
            e(
                'h4',
                {
                    id : 'swap-mode-header'
                },
                this.mySwapPage.state.header
            ),
            e(
                'p',
                {
                    id : 'under-header'
                },
                this.mySwapPage.state.addition
            ),
            e(
                'div',
                {
                    id : 'head-line'
                }
            ),
            e(
                'div',
                {
                    class : 'swap-input',
                    id : 'from'
                },
                this.mySwapPage.getInputField({
                    fieldName : this.mySwapPage.state.name0, 
                    fieldClass : 'token-use',
                    tokenName : this.mySwapPage.state.token0, 
                    value : this.mySwapPage.state.value0,
                    userTokenAmount : this.mySwapPage.state.userTokenValue
                })
            ),
            e(
                'div',
                {
                    id : 'exch',
                    onClick : this.mySwapPage.swapPair.bind(this.mySwapPage)
                },
                [
                    e(
                        'i',
                        {
                            id : 'up-arrow',
                            style : {
                                visibility : this.mySwapPage.state.exchVis
                            }
                        }
                    ),
                    e(
                        'i',
                        {
                            id : 'down-arrow',
                            style : {
                                visibility : this.mySwapPage.state.exchVis
                            }
                        }
                    ),
                    e(
                        'p',
                        {
                            style : {
                                visibility : this.mySwapPage.state.plusVis,
                                fontSize: '40px',
                                color: 'grey',
                                left: '8px',
                                position: 'absolute',
                                bottom: '-26px'
                            }
                        },
                        '+'
                    )
                ]
            ),
            e(
                'div',
                {
                    class : 'swap-input',
                    id : 'to'  
                },
                this.mySwapPage.getInputField({
                    fieldName : this.mySwapPage.state.name1, 
                    fieldClass : 'token-use1', 
                    tokenName : this.mySwapPage.state.token1, 
                    value : this.mySwapPage.state.value1,
                    userTokenAmount : this.mySwapPage.state.userTokenValue
                })
            ),
            e(
                'div',
                {
                    style : {
                        height : '25px',
                    }
                }
            ),
            e(
                'button',
                {
                    onClick : this.mySwapPage.sentTx.bind(this.mySwapPage),
                    class : 'btn btn-secondary my-2 my-sm-0 swap-input',
                    type : 'submit',
                    id : 'submit'
                },
                this.mySwapPage.state.submitName
            )
        ]
    }
};