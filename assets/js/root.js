import React from 'react';
import ReactDOM from 'react-dom';
import "regenerator-runtime/runtime.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';
import Aside from './Aside';
import SwapCard from './SwapCard';
import Switch from './Switch';
import UnknownPage from './UnknownPage';
import ConnectionService from './ConnectionService';

import Presets from './pageDataPresets';
import SwapApi from './swapApi';

import '../css/popup-cards.css';
import CommonToast from './CommonToast';

let presets = new Presets();
const swapApi = new SwapApi();

class Root extends React.Component {
    constructor (props) {
        super(props);
        this.pubKey = '';

        this.state = {
            connectionStatus : false,
            navOpened : true,
            connecionListOpened : false,
            menuItem : 'exchange',
            langData : presets.langData,
            swapCardLeft : '45%',
            net : presets.network.defaultNet,
            pending : true
        };

        this.siteLocales = presets.langData.siteLocales;
        this.activeLocale = presets.langData.preferredLocale;
        this.langTitles = presets.langData.langTitles;
        // -------------------------------------
        this.updLanguage(this.activeLocale);
    };

    async updLanguage (language) {
       await (await swapApi.getLanguage(language)).json()
       .then(res => {
            this.activeLocale = language;
            this.setState(state => {
                state.langData = res;
                return state;
            });
       });
    };

    changeLanguage (language) {
        this.updLanguage(language);
    };

    getBalance (hash) {
        try {
            return Enecuum.balanceOf({
                to : this.pubKey,
                tokenHash : hash
            });
        } catch (err) {
            return new Promise((resolve, reject) => { reject(err) });
        }
    };

    toggleNavbar () {
        if (this.state.swapCardLeft == '45%') // just for tests
            this.setState({ swapCardLeft : '41%' });
        else
            this.setState({ swapCardLeft : '45%' });
        this.setState({ navOpened : !this.state.navOpened });
    };

    menuViewController () {
        switch (this.state.menuItem) {
            case 'exchange':
                return (
                    <div className='swap-card' style={{ left : this.state.swapCardLeft}}>
                        <div id='switch' >
                            <Switch root={ this }/>
                        </div>
                        <SwapCard root={ this } />
                    </div>
                );
            case 'liquidity':
                return (
                    <div className='swap-card' style={{ left : this.state.swapCardLeft}}>
                        <div id='switch' >
                            <Switch root={ this }/>
                        </div>
                        <SwapCard root={ this } />
                    </div>
                );
            default:
                return (
                    <UnknownPage />
                );
        };
    };

    changeMenuItem (newItem) {
        this.setState({ menuItem : newItem });
    };

    openConnectionList () {
        this.setState({ connecionListOpened : true });
    };

    closeConnectionList () {
        this.setState({ connecionListOpened : false });
    };

    connectionList () {
        if (this.state.connecionListOpened)
            return (
                <div>
                    <div className="c-modal-fade"></div>
                    <div id='connection-services'>
                        <ConnectionService outer={ this } />
                    </div>
                </div>
            );
    };

    render () {
        return (
            <div className='h-100'>
                <Navbar outer={ this } />
                <main role='main' className='container-fluid h-100 px-0 position-relative'>
                    <div className='row'>
                        <div className='col-12'>
                            <Aside outer={ this }/>
                            {this.menuViewController()}
                            {this.connectionList()}
                        </div>    
                    </div>
                    <div id="toastWrapper" className="position-absolute pt-4">
                        <CommonToast outer={ this }/>
                    </div>                    
                </main>
            </div>
        );
    };
};

ReactDOM.render(
    <Root/>,
    document.getElementById('root')
);