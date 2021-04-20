import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import Socials from './Socials';
import swapApi from '../requests/swapApi';

import img from '../../img/logo.png';
import '../../css/font-style.css';
import '../../css/aside.css';


const coinPriceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=enq-enecuum&vs_currencies=USD';
const sec = 1000; 

class Aside extends React.Component {
    constructor (props) {
        super(props);
        this.activeItemStyle = {
            color : 'var(--color4)'
        };
        this.itemsOrder = ['home', 'exchange', 'liquidity', 'ido', 'farms', 'pools', 'etm', 'info'];
        this.menuItems = {
            home : {
                iconClasses: 'icon-Icon23',
                action: this.changeMenuItem.bind(this, 'home')
            },
            exchange : {
                iconClasses: 'icon-Icon10',
                action: this.changeMenuItem.bind(this, 'exchange')
            },
            liquidity : {
                iconClasses: 'icon-Icon18',
                action: this.changeMenuItem.bind(this, 'liquidity')
            },
            ido : {
                iconClasses: 'icon-Icon21',
                action: this.changeMenuItem.bind(this, 'ido')
            },
            farms : {
                iconClasses: 'icon-Icon20',
                action: this.changeMenuItem.bind(this, 'farms')
            },
            pools : {
                iconClasses: 'icon-Icon22',
                action: this.changeMenuItem.bind(this, 'pools')
            },
            etm : {
                iconClasses: 'icon-Icon25',
                action: this.changeMenuItem.bind(this, 'etm')
            },
            info : {
                iconClasses: 'icon-Icon24',
                action: this.changeMenuItem.bind(this, 'info')
            },
            docs : {
                iconClasses: 'icon-Icon19',
                action: this.changeMenuItem.bind(this, 'docs')
            }
        };
        this.exchRateUpdRate = 5 * sec;
        this.monitorExchangeRate();
    };

    changeMenuItem (newItem) {
        this.props.changeMenuItem(newItem)
    };

    monitorExchangeRate () {
        this.updExchangeRate();
        setInterval(() => this.updExchangeRate(), this.exchRateUpdRate);
    };

    updExchangeRate () {
        fetch(coinPriceUrl)
        .then(async res => {
            res = await res.json();
            res = res['enq-enecuum'].usd;
            this.props.updExchangeRate(res.toFixed(3));
        },
        err => {
            console.log(err);
            this.props.updExchangeRate('---');
        });
    };

    async updLanguage (locale) {
        await (await swapApi.getLanguage(locale)).json()
        .then(langData => {
            this.props.changeLanguage(langData);
        });
    };

    updLanguageProp (item) {
        this.props.updActiveLocale(item);
        this.updLanguage(item);
    };

    render () {
        let asideClasses = ('aside-' + (this.props.navOpened ? 'open' : 'closed')) + ' aside-left position-fixed d-flex flex-column justify-content-between pt-5 pb-4 px-3';
        return (
            <div id='aside' className={asideClasses}>
                <div className='aside-menu'>
                    {this.itemsOrder.map((item, index) => (
                        <div className='menu-item d-flex align-items-center justify-content-start mb-4' key={index} onClick={this.menuItems[item].action} style={ (this.props.menuItem === item) ? this.activeItemStyle : undefined }>
                            <span className={this.menuItems[item].iconClasses + ' icon-wrapper'}/>
                            <span className='aside-menu-text'>{this.props.langData[item]}</span>
                        </div>
                    ))}
                    <a className='menu-item d-flex align-items-center justify-content-start mb-4' href="https://enex.gitbook.io/enex-space/" target="_blank">
                        <span className='icon-Icon19 icon-wrapper'/>
                        <span className='aside-menu-text'>{this.props.langData.docs}<span className='icon-Icon11 icon-wrapper ml-2'/></span>                        
                    </a>
                </div>

                <div className='aside-footer d-flex flex-column justify-content-between'>
                    <div className='rate-langswitcher-wrapper d-flex align-items-center justify-content-between mb-4'>
                        <div className='exchange-rate d-flex align-items-center justify-content-between'>
                            <img src={img} width='30px' height='30px'/>
                            <div>
                                ${this.props.exchangeRate}
                            </div>
                        </div>
                        <div className="dropup lang-switcher d-flex align-items-center justify-content-between">
                            <Dropdown>
                                <Dropdown.Toggle variant="link" id="dropdown-basic" className="btn btn-link">
                                    <span className='icon-Icon6 mr-2'/>
                                    <span className='text-uppercase'>{ this.props.langTitles[this.props.activeLocale].short }</span> 
                                </Dropdown.Toggle>
                                <Dropdown.Menu alignRight className="wrapper-1">
                                    {this.props.siteLocales.map((item, index) => (
                                        <Dropdown.Item className="text-center py-2" key={index} value={index} onClick={this.updLanguageProp.bind(this, item)}>{ this.props.langTitles[item].full }</Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                    <Socials/>
                    <div className={(this.props.navOpened ? 'd-none' : '') + ' aside-toggle text-center'} onClick={ this.props.toggleAside.bind(this.props) }>
                        <span className='icon-Icon15'/>
                    </div>
                </div>
            </div>
        );
    };
};

const WAside = connect(mapStoreToProps(components.ASIDE), mapDispatchToProps(components.ASIDE))(Aside);

export default WAside;