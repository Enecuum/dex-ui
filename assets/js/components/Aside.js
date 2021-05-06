import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import Socials from './Socials';
import swapApi from '../requests/swapApi';

import img from '../../img/ENEXlogo.png';
import '../../css/font-style.css';
import '../../css/aside.css';

const coinName = 'enex';
const coinPriceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinName}&vs_currencies=USD`;
const sec = 1000; 

class Aside extends React.Component {
    constructor (props) {
        super(props);
        this.activeItemStyle = {
            color : 'var(--color4)'
        };
        this.itemsOrder = ['exchange', 'liquidity', 'topPairs'/*, 'ido', 'farms', 'pools', 'etm', 'info'*/];
        this.menuItems = {
            home : {
                iconClasses: 'icon-Icon23',
                action: undefined
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
            topPairs : {
                iconClasses: 'icon-Icon24',
                action: this.changeMenuItem.bind(this, 'topPairs')
            },
            docs : {
                iconClasses: 'icon-Icon19',
                action: undefined
            }
        };
        this.exchRateUpdRate = 5 * sec;
        this.monitorExchangeRate();

        this.state = {windowWidth: window.innerWidth};
    };


    toggleNavOpen() {
        if (window.innerWidth <= 767) {            
            if (this.props.navOpened === true)
                this.props.toggleAside();
        }                
    }

    updateDimensions = () => {
        this.setState({ windowWidth: window.innerWidth});
        this.toggleNavOpen();
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    changeMenuItem (newItem) {
        this.props.changeMenuItem(newItem);
        this.toggleNavOpen();
    };

    monitorExchangeRate () {
        this.updExchangeRate();
        setInterval(() => this.updExchangeRate(), this.exchRateUpdRate);
    };

    updExchangeRate () {
        fetch(coinPriceUrl)
        .then(async res => {
            res = await res.json();
            res = res[coinName].usd;
            this.props.updExchangeRate(res.toFixed(3));
        },
        err => {
            console.log(err);
            this.props.updExchangeRate('---');
        });
    };

    // async updLanguage (locale) {
    //     await (await swapApi.getLanguage(locale)).json()
    //     .then(langData => {
    //         this.props.changeLanguage(langData);
    //     });
    // };

    // updLanguageProp (item) {
    //     this.props.updActiveLocale(item);
    //     // this.updLanguage(item);
    // };

    changeLanguage = lng => {
        this.props.i18n.changeLanguage(lng);
    };

    render () {
        const t = this.props.t;
        return (
            <div 
                id='aside'
                className='aside-left position-fixed d-flex flex-column justify-content-between pt-5 pb-4 px-3'
                style = {{height : (this.props.connectionStatus && (this.state.windowWidth <= 1200)) ? 'calc(100% - var(--top-menu-height) - 50px)' : 'calc(100% - var(--top-menu-height))'}} >
                <div className='aside-menu'>
                    <a className='menu-item d-flex align-items-center mb-4' href="https://enex.space/" target="_blank">
                        <span className={this.menuItems.home.iconClasses + ' icon-wrapper'}/>
                        <span className='aside-menu-text'>{t('navbars.left.home')}<span className='icon-Icon11 icon-wrapper ml-2'/></span>                        
                    </a>
                    {this.itemsOrder.map((item, index) => (
                        <div className='menu-item d-flex align-items-center mb-4' key={index} onClick={this.menuItems[item].action} style={ (this.props.menuItem === item) ? this.activeItemStyle : undefined }>
                            <span className={this.menuItems[item].iconClasses + ' icon-wrapper'}/>
                            <span className='aside-menu-text'>{t(`navbars.left.${item}`)}</span>
                        </div>
                    ))}
                    <a className='menu-item d-flex align-items-center justify-content-start mb-4' href="https://enex.gitbook.io/enex-space/" target="_blank">
                        <span className='icon-Icon19 icon-wrapper'/>
                        <span className='aside-menu-text'>{t('navbars.left.docs')}<span className='icon-Icon11 icon-wrapper ml-2'/></span>                        
                    </a>
                </div>

                <div className='aside-footer d-flex flex-column justify-content-between'>
                    <div className='rate-langswitcher-wrapper d-flex align-items-center justify-content-between mb-4'>
                        <div className='exchange-rate d-flex justify-content-between'>
                            <img src={img} width='30px' height='30px'/>
                            <div>
                                ${this.props.exchangeRate}
                            </div>
                        </div>
                        <div className="dropup lang-switcher d-flex align-items-center justify-content-between">
                            <Dropdown>
                                <Dropdown.Toggle variant="link" id="dropdown-basic" className="btn btn-link d-flex align-items-center">
                                    <span className='icon-Icon6 mr-2'/>
                                    <span className='text-uppercase'>{ t('langTitles.short')  }</span> 
                                </Dropdown.Toggle>
                                <Dropdown.Menu alignRight className="wrapper-1">
                                    {this.props.siteLocales.map((item, index) => (
                                        <Dropdown.Item className="text-center py-2" key={index} value={index} onClick={() => this.changeLanguage(item)}>{this.props.langTitles[item].full }</Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                    <Socials/>
                    <div className='aside-toggle text-center' onClick={ this.props.toggleAside.bind(this.props) }>
                        <span className='icon-Icon15'/>
                    </div>
                </div>
            </div>
        );
    };
};

const WAside = connect(mapStoreToProps(components.ASIDE), mapDispatchToProps(components.ASIDE))(withTranslation()(Aside));

export default WAside;