class FixedLeftNavBar extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    };

    render () {
        return [
            e(
                'div',
                { class : 'nav-element' }
            ),
            e(
                'div',
                { class : 'nav-element' }
            ),
            e(
                'div',
                { class : 'nav-element' }
            ),
            e(
                'div',
                { class : 'nav-element' }
            ),

            e(
                'div',
                {
                    class : 'space-line'
                }
            ),
            e(
                'div',
                { id : 'settings' }
            ),
        ];
    };
};

class LeftNavBar extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    };

    render () {
        return [
            e(
                'div',
                {
                    id : 'left-navbar',
                    style : {
                        width : this.mySwapPage.state.leftNavWidth
                    },
                },
                [
                    e(
                        'div',
                        { id : 'first-in-nav', class : 'nav-element'},
                        'Exchange'
                    ),
                    e(
                        'div',
                        {class : 'nav-element'},
                        'Liquidity'
                    ),
                    e(
                        'div',
                        {class : 'nav-element'},
                        'Title2'
                    ),
                    e(
                        'div', 
                        {class : 'nav-element'},
                        'Title3'
                    ),

                    e(
                        'div',
                        {
                            class : 'space-line'
                        }
                    )
                ]
            )
        ];
    };
};