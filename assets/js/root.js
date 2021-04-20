import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps';
import store from '../store/store';
import "regenerator-runtime/runtime.js";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Navbar, Aside, SwapCard, Switch, ConnectionService, ConfirmSupply, WaitingConfirmation } from './components/entry';
// import Navbar from './components/Navbar';
// import Aside from './components/Aside';
// import SwapCard from './components/SwapCard';
// import Switch from './components/Switch';
// import ConnectionService from './components/ConnectionService';
// import ConfirmSupply from './components/ConfirmSupply';
// import WaitingConfirmation from './components/waitingConfirmation';
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
        this.updTokens();
    };

    async updTokens() {
        this.props.assignAllTokens(await (await swapApi.getTokens()).json());
    };

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
                    <div className="swap-card-wrapper" style={{ left : this.props.swapCardLeft}}>
                        <div className='swap-card'>
                            <div id='switch' >
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
                        <ConnectionService />
                    </div>
                </div>
            );
    };

    render () {
        return (
            <div className='h-100'>
                <Navbar />
                <main role='main' className='container-fluid h-100 px-0 position-relative'>
                    <div className='row h-100'>
                        <div className='col-12'>
                            <Aside />
                            {this.menuViewController()}
                            {this.connectionList()}
                        </div>
                    </div>
                    {/* <div id="toastWrapper" className="position-absolute pt-4">
                        <CommonToast />
                    </div> */}
                </main>
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