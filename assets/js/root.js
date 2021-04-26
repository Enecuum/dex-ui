import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps';
import store from '../store/store';
import "regenerator-runtime/runtime.js";
import 'bootstrap/dist/css/bootstrap.min.css';

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
        this.intervalUpdDexData();
    };

    convertPools (pools) {
        return pools.map(element => {
            return {
                token_0 : {
                    hash : element.asset_1,
                    volume : element.volume_1
                },
                token_1 : {
                    hash :  element.asset_2,
                    volume : element.volume_2
                },
                pool_fee : element.pool_fee,
                lt : element.token_hash
            };
        });
    };

    // --------------------------------------- upd dex data

    updDexData (pubkey) {
        this.updTokens();
        this.updPools();
        this.updBalances(pubkey);
    };

    intervalUpdDexData () {
        setInterval(() => {
            if (this.props.connectionStatus)
                this.updDexData(this.props.pubkey);
        }, 5000);
    };
    async updBalances (pubkey) {
        if(pubkey != '')
            swapApi.getFullBalance(pubkey)
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
                                <Switch />
                            </div>
                            <SwapCard />
                            <ConfirmSupply />
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
                        <ConnectionService updDexData = {this.updDexData.bind(this)} />
                    </div>
                </div>
            );
    };

    render () {       
        return (
            <div>
                <Navbar />
                <main role='main' className={`container-fluid px-0 position-relative aside-${this.props.navOpened ? 'open' : 'closed'}`}>
                    <div id="contentWrapper" className='d-flex pb-5'>
                        <Aside />
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