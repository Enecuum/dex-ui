class Aside extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
        this.itemsOrder = ['home', 'exchange', 'liquidity', 'ido', 'farms', 'pools', 'etm', 'info', 'docs'];
        this.menuItems = {
            home : {
                iconClasses: 'icon-Icon23',
                text: '1',
                action: undefined
            },
            exchange : {
                iconClasses: 'icon-Icon10',
                text: '2',
                action: undefined
            },
            liquidity : {
                iconClasses: 'icon-Icon18',
                text: '3',
                action: undefined
            },
            ido : {
                iconClasses: 'icon-Icon21',
                text: '4',
                action: undefined
            },
            farms : {
                iconClasses: 'icon-Icon20',
                text: '5',
                action: undefined
            },
            pools : {
                iconClasses: 'icon-Icon22',
                text: '6',
                action: undefined
            },
            etm : {
                iconClasses: 'icon-Icon25',
                text: '7',
                action: undefined
            },
            info : {
                iconClasses: 'icon-Icon24',
                text: '8',
                action: undefined
            },
            docs : {
                iconClasses: 'icon-Icon19',
                text: '9',
                action: undefined
            }
        }
    };

    render () {
        return (
            <div id='aside' className='aside-left position-fixed d-flex flex-column justify-content-between pt-4 pb-3 px-3'>
                <div class='aside-menu'>
                    {this.itemsOrder.map((item, index) => (
                        <div className='menu-item d-flex align-items-center justify-content-start mb-2'>
                            <span className={this.menuItems[item].iconClasses + ' icon-wrapper'}/>
                            <span>{this.menuItems[item].text}</span>
                        </div>
                    ))}
                </div>
                <div className='d-flex flex-column justify-content-between'>
                    <div className='d-flex align-items-center justify-content-between'>
                        <div className='exchange-rate'>

                        </div>
                        <div className='lang-switcher'>
                        </div>
                    </div>
                    <Socials/>
                </div>                
            </div>
        );
    };
};
