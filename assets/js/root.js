import React from 'react';
import ReactDOM from 'react-dom';
import 'regenerator-runtime/runtime.js';

import Navbar from './Navbar';
import Aside from './Aside';
import SwapCard from './SwapCard';
import Switch from './Switch';
import UnknownPage from './UnknownPage';
import ConnectionService from './ConnectionService';

import Presets from './pageDataPresets';
import SwapApi from './swapApi';

import '../css/popup-cards.css';

let presets = new Presets();
const swapApi = new SwapApi();

class Root extends React.Component {
    constructor (props) {
        super(props);
        this.pubKey = '';
        // -------------------------------------
        this.connectionStatus = false;

        this.state = {
            navOpened : true,
            connecionListOpened : false,
            menuItem : 'exchange',
            langData : presets.langData,
            swapCardLeft : '45%'
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


    // writeUserTokenValue () {
    //     this.updState('userTokenValue', 0);
    //     return;
    //     let mode = this.getMode()
    //     Enecuum.balanceOf({
    //         to : this.pubKey,
    //         tokenHash : this[mode].token0
    //     }).then(
    //         res => {
    //             this.updState('userTokenValue', res.amount);
    //         }
    //     );
    // };

    // async sentTx () {
    //     let data = this[this.getMode()];
    //     if (this.connectionStatus) {
    //         Enecuum.sendTransaction({
    //             from : this.pubKey,
    //             to : presets.network.genesisPubKey,
    //             value : presets.network.nativeToken.fee,
    //             tokenHash : presets.network.nativeToken.hash,
    //             data : {
    //                 type : 'swap',
    //                 parameters : {
    //                     asset_in : data.field0.token.hash, 
    //                     amount_in : data.field0.value,
    //                     asset_out : data.field1.value
    //                 }
    //             }
    //         });
    //         alert('Send tx');
    //     } else {
    //         this.openConnectionList();
    //     }
    // };

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
                        <SwapCard mode={this.state.menuItem} root={ this } />
                    </div>
                );
            case 'liquidity':
                return (
                    <UnknownPage />  
                );
            default:
                return (
                    <UnknownPage />
                );
        };
    };

    openConnectionList () {
        this.setState({ connecionListOpened : true });
    };

    closeConnectionList () {
        this.setState({ connecionListOpened : false });
    };

    connecionList () {
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
                <main role='main' className='container-fluid h-100 px-0'>
                    <div className='row'>
                        <div className='col-12'>
                            <Aside outer={ this }/>
                            {this.menuViewController()}
                            {this.connecionList()}
                        </div>    
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