class FixedLeftNavBar extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
        this.icons = ['trade'];
    };

    render () {
        return [
            ...this.mySwapPage.insertElements(true, this.icons),
            e(
                'div',
                {
                    class : 'space-line'
                }
            ),
            e(
                'img',
                { 
                    id : 'settings',
                    src : 'img/settings.png',
                    onClick : this.mySwapPage.openCloseNavbar.bind(this.mySwapPage)
                }
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
        this.width = 60;
        this.height = 60;
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

    fillLangElements (languages) {
        let columns = Math.ceil(Math.sqrt(languages.length));
        let rows = Math.ceil(languages.length / columns);
        // this.setState({ langWidth : `${(columns * this.width)}px` });
        // this.setState({ langHeight : `${(rows * this.height)}px` });
        return languages.map((el, i) => {
            return e (
                'div',
                {
                    class : 'lang-el',
                    style : {
                        marginLeft : `${(Math.floor(i / rows)) * this.width}px`,
                        marginTop : `${(i % rows) * this.height}px`
                    },
                    onClick : this.mySwapPage.changeLanguage.bind(this.mySwapPage, el)
                },
                el
            );
        });
    };

    changeLangVisibility () {
        if (this.mySwapPage.state.langVisibility == 'hidden')
            this.mySwapPage.changeLangVisibility('visible');
        else 
            this.mySwapPage.changeLangVisibility('hidden');
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
                    ...this.mySwapPage.insertElements(false),
                    e(
                        'div',
                        {
                            class : 'space-line',
                            style : {
                                width : this.mySwapPage.state.leftNavWidth
                            }
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
                        'img',
                        {
                            id : 'language',
                            src : 'img/lang.png',
                            style : {
                                visibility : this.mySwapPage.state.settingsVisibility
                            },
                            onClick : this.changeLangVisibility.bind(this)
                        }
                    ),
                    e(
                        'div',
                        {
                            id : 'language-panel',
                            style : {
                                width : '120px',
                                height : '60px',
                                visibility : this.mySwapPage.state.langVisibility
                            },
                        },
                        this.fillLangElements(['rus', 'eng'])
                    )
                ]
            )
        ];
    };
};