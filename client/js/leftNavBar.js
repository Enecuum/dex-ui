let changeColor = function (cs, color) {
    let navEl = document.getElementsByClassName(cs);
    for (let el of navEl)
        el.style.background = color;
};

let turnOn = function (cs) {
    if (document.getElementsByClassName(cs)[0].style.background != 'var(--color3)')
        changeColor(cs, 'var(--color3-t)');
};

let turnOff = function (cs) {
    if (document.getElementsByClassName(cs)[0].style.background != 'var(--color3)')
        changeColor(cs, 'var(--color1)');
};

let lightIt = function (general, cs) {
    let allEl = document.getElementsByClassName(general);
    for (let el of allEl)
        el.style.background = 'var(--color1)';
    changeColor(cs, 'var(--color3)');
};

let insertElements = function (elements, fixedNavbar) {
    return elements.map((el, i) => {
        let className = (i == 0) ? `n-e-${i} first-in-nav` : `n-e-${i}`;
        return e(
            'div',
            { 
                class : `nav-element ${className}`,
                onMouseOver : turnOn.bind(this, className),
                onMouseOut  : turnOff.bind(this, className),
                onClick : lightIt.bind(this, 'nav-element', className)
            },
            (!fixedNavbar) ? el : undefined
        );
    });
};


class FixedLeftNavBar extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    };

    render () {
        return [
            ...insertElements(this.mySwapPage.state.langData.navbars.left, true),
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
        vars.setProperty('--text-color', theme.textColor);
        vars.setProperty('--exit-color', theme.exitColor);
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
                    ...insertElements(this.mySwapPage.state.langData.navbars.left, false),
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
                            },
                            onClick : this.mySwapPage.changeLanguage.bind(this.mySwapPage)
                        }
                    )
                ]
            )
        ];
    };
};