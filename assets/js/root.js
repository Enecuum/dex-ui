import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps';
import store from '../store/store';
import "regenerator-runtime/runtime.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./utils/i18n";

import { Navbar, Aside, SwapCard, Switch, ConnectionService, ConfirmSupply, WaitingConfirmation, IndicatorPanel } from './components/entry';
import BlankPage from './pages/blankPage';
import Etm from './pages/Etm';

import swapApi from './requests/swapApi';
import img1 from '../img/logo.png';
import img2 from '../img/bry-logo.png';
import SwapAddon from './components/SwapAddon';
import LPTokensWalletInfo from './components/LPTokensWalletInfo';


class Root extends React.Component {
    constructor (props) {
        super(props);
        this.updLanguage();
        this.updDexData();
    };

    convertPools (pools) {
        return pools.map(element => {
            return {
                token_0 : {
                    hash : element.t1,
                    volume : element.v1
                },
                token_1 : {
                    hash :  element.t2,
                    volume : element.v2
                },
                pool_fee : 0,
                lt : element.lt
            };
        });
    };

    // --------------------------------------- upd dex data

    updDexData () {
        setInterval(() => {
            if (this.props.connectionStatus) {
                this.updTokens();
                this.updPools();
                this.updBalances();
            }
        }, 5000);
    };
    async updBalances () {
        if(this.props.pubkey != '')
            swapApi.getFullBalance(this.props.pubkey)
            .then(res => {
                if (!res.lock)
                    res.json()
                    .then(res => this.props.updBalances(res));
            });
    };
    async updPools () {
        swapApi.getPairs()
        .then(res => {
            if (!res.lock)
                res.json()
                .then(res => this.props.updPairs(this.convertPools(res)));
        });
    };
    async updTokens() {
        swapApi.getTokens()
        .then(res => {
            if (!res.lock)
                res.json()
                .then(res => this.props.assignAllTokens(res));
        });
    };

    // ----------------------------------------------------

    async updLanguage () {
        let locale = this.props.activeLocale;
        await (await swapApi.getLanguage(locale)).json()
        .then(langData => {
            this.props.changeLanguage(langData);
        });
    };

    menuViewController () {
        switch (this.props.menuItem) {
            case 'exchange':
            case 'liquidity':
                return (
                    <div className="swap-card-wrapper">
                        <div className='swap-card position-relative'>
                            <div id='switch'>
                                <Switch useSuspense={false}/>
                            </div>
                            <SwapCard useSuspense={false}/>
                            <ConfirmSupply useSuspense={false}/>
                            <WaitingConfirmation />
                        </div>
                        <div className="addon-card-wrapper mt-4">
                            <SwapAddon />
                            <LPTokensWalletInfo data={{token1 : 'ENQ', token2 : 'BRY', logo1 : img1, logo2 : img2, logoSize : 'sm'}} />
                        </div>
                    </div>    
                );
            case 'etm':
                return (
                    <> </>
                    // <div id="ETMPage" style={{paddingLeft : (this.state.navOpened ? '330px' : '70px')}}>
                    //     <Etm root={ this } />
                    // </div>
                );                
            default:
                return (
                    <BlankPage text="Coming soon"/>
                );
        };
    };

    changeMenuItem (newItem) {
        this.props.changeMenuItem(newItem);
    };

    openConnectionList () {
        this.props.openConList();
    };

    closeConnectionList () {
        this.props.closeConList();
    };

    connectionList () {
        if (this.props.connecionListOpened)
            return (
                <div>
                    <div id='connection-services'>
                        <ConnectionService useSuspense={false} />
                    </div>
                </div>
            );
    };

    render () {       
        return (
            <div>
                <Navbar useSuspense={false}/>
                <main role='main' className={`container-fluid px-0 position-relative aside-${this.props.navOpened ? 'open' : 'closed'}`}>
                    <div id="contentWrapper" className='d-flex pb-5'>
                        <Aside useSuspense={false} />
                        {this.menuViewController()}
                        {this.connectionList()}
                    </div>
                    {/* <div id="toastWrapper" className="position-absolute pt-4">
                        <CommonToast />
                    </div> */}    

                </main>
                {this.props.connectionStatus && 
                    <div className="w-100 d-flex align-items-center justify-content-center d-xl-none" style={{height:'50px', background: 'white', position: 'fixed', bottom: '0px', backgroundColor: 'var(--menu-bg-non-transparent)', zIndex: '901'}}>
                        <IndicatorPanel />
                    </div>                    
                }
            </div>
        );
    };
};

const WRoot = connect(mapStoreToProps(components.ROOT), mapDispatchToProps(components.ROOT))(Root);

ReactDOM.render(
    <Provider store={ store }>
        <WRoot />
    </Provider>,
    document.getElementById('root')
);