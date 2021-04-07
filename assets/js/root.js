import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';

import "regenerator-runtime/runtime.js";
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from './Navbar';
import Aside from './Aside';
import SwapCard from './SwapCard';
import Etm from './Etm';
import Switch from './Switch';
import BlankPage from './blankPage';
import ConnectionService from './ConnectionService';
import ConfirmSupply from './ConfirmSupply';
import WaitingConfirmation from './waitingConfirmation';

import SwapApi from './swapApi';
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps';

import store from '../store/store';

const swapApi = new SwapApi();

class Root extends React.Component {
    constructor (props) {
        super(props);
        this.updLanguage();
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
                return (
                    <div className='swap-card' style={{ left : this.props.swapCardLeft}}>
                        <div id='switch' >
                            <Switch />
                        </div>
                        <SwapCard />
                    </div>
                );
            case 'liquidity':
                return (
                    <div className='swap-card' style={{ left : this.props.swapCardLeft}}>
                        <div id='switch' >
                            <Switch />
                        </div>
                        <SwapCard />
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
                    <ConfirmSupply />
                    <WaitingConfirmation />    
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