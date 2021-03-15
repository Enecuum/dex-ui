import React from 'react';
import Socials from './Socials';
import '../css/aside.css';
import '../css/font-style.css';
import img from '../img/logo.png';

const sec = 1000;

class Aside extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
        this.itemsOrder = ['home', 'exchange', 'liquidity', 'ido', 'farms', 'pools', 'etm', 'info', 'docs'];
        this.menuItems = {
            home : {
                iconClasses: 'icon-Icon23',
                action: undefined
            },
            exchange : {
                iconClasses: 'icon-Icon10',
                action: this.mySwapPage.switchMode.bind(this.mySwapPage, 'exchange')
            },
            liquidity : {
                iconClasses: 'icon-Icon18',
                action: this.mySwapPage.switchMode.bind(this.mySwapPage, 'liquidity')
            },
            ido : {
                iconClasses: 'icon-Icon21',
                action: undefined
            },
            farms : {
                iconClasses: 'icon-Icon20',
                action: undefined
            },
            pools : {
                iconClasses: 'icon-Icon22',
                action: undefined
            },
            etm : {
                iconClasses: 'icon-Icon25',
                action: undefined
            },
            info : {
                iconClasses: 'icon-Icon24',
                action: undefined
            },
            docs : {
                iconClasses: 'icon-Icon19',
                action: undefined
            }
        };
        this.exchRateUpdRate = 5 * sec;
        this.state = {
            exchangeRate : ''
        };
        this.monitorExchangeRate();
    };

    monitorExchangeRate () {
        this.updExchangeRate();
        setInterval(() => this.updExchangeRate(), this.exchRateUpdRate);
    };

    setExchangeRate (newValue) {
        this.setState({ exchangeRate : newValue.toFixed(3) });
    };

    updExchangeRate () {
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=enq-enecuum&vs_currencies=USD')
        .then(async res => {
            res = await res.json();
            this.setExchangeRate(res['enq-enecuum'].usd);
        },
        err => {
            console.log(err);
            this.setExchangeRate('---');
        });
    };

    render () {
        let asideClasses = ('aside-' + (this.mySwapPage.navOpen ? 'open' : 'closed')) + ' aside-left position-fixed d-flex flex-column justify-content-between pt-5 pb-4 px-3';
        return (
            <div id='aside' className={asideClasses}>
                <div className='aside-menu'>
                    {this.itemsOrder.map((item, index) => (
                        <div className='menu-item d-flex align-items-center justify-content-start mb-4' onClick={this.menuItems[item].action} >
                            <span className={this.menuItems[item].iconClasses + ' icon-wrapper'}/>
                            <span className='aside-menu-text'>{this.mySwapPage.state.langData.navbars.left[item]}</span>
                        </div>
                    ))}
                </div>
                <div className='aside-footer d-flex flex-column justify-content-between'>
                    <div className='rate-langswitcher-wrapper d-flex align-items-center justify-content-between mb-4'>
                        <div className='exchange-rate d-flex align-items-center justify-content-between'>
                            <img src={img} width='30px' height='30px'/>
                            <div>
                                ${this.state.exchangeRate}
                            </div>
                        </div>
                        <div className="dropup lang-switcher d-flex align-items-center justify-content-between">
                            <button className="btn btn-link dropdown-toggle p-0 border-0" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span className='icon-Icon6 mr-2'/>
                                <span className='text-uppercase'>{  this.mySwapPage.langTitles[this.mySwapPage.activeLocale].short }</span> 
                            </button>
                            <div className="dropdown-menu wrapper-1" aria-labelledby="dropdownMenu2">
                                {this.mySwapPage.siteLocales.map((item, index) => (
                                    <div className="dropdown-item text-center py-2" value={index} onClick={this.mySwapPage.changeLanguage.bind(this.mySwapPage, item)}>{ this.mySwapPage.langTitles[item].full }</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Socials/>
                    <div className={(this.mySwapPage.navOpen ? 'd-none' : '') + ' aside-toggle text-center'} onClick={ this.mySwapPage.toggleNavbar.bind(this.mySwapPage, true) }>
                        <span className='icon-Icon15'/>
                    </div>
                </div>
            </div>
        );
    };
};

export default Aside;