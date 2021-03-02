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
        this.lightTheme = true;
        this.state = {
            checked : true
        };
    };
    
    changeColors () {
        let vars = document.documentElement.style;
        let theme = (!this.lightTheme) ? this.mySwapPage.colorThemes.light : this.mySwapPage.colorThemes.dark;
        vars.setProperty('--color1', theme.color1);
        vars.setProperty('--main-background', theme.background);
        let chckd = (this.lightTheme) ? false : true;
        this.setState({ checked : chckd });
        this.lightTheme = !this.lightTheme;
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
                        'Trade'
                    ),
                    e(
                        'div',
                        {class : 'nav-element'},
                        'Title1'
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
                    ),
                    e(
                        'label',
                        {
                            id : 'theme-toggler',
                            style : {
                                bottom : this.mySwapPage.state.bottomPosition
                            }
                        },
                        [
                            e(
                                'input',
                                {
                                    type : 'checkbox',
                                    checked : this.state.checked,
                                    onClick : this.changeColors.bind(this)
                                }
                            ),
                            e(
                                'span',
                                {
                                    class : 'slider round'
                                }
                            )
                        ]
                    ),
                    e(
                        'div',
                        {
                            id : 'language',
                            style : {
                                visibility : this.mySwapPage.state.settingsVisibility
                            }
                        }
                    )
                ]
            )
        ];
    };
};