import { withTranslation } from "react-i18next";
import React, { Suspense } from 'react';
import Connect from './Connect';
import 'bootstrap/dist/css/bootstrap.min.css';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';

import CommonToast from "../elements/CommonToast";
import IndicatorPanel from './IndicatorPanel';

import img from '../../img/enex-logo.png';
import '../../css/navbar.css';
import '../../css/font-style.css';

class Navbar extends React.Component {
    constructor (props) {
        super(props)
    }

    render () {
        let asideToggleClasses = (this.props.navOpened ? 'icon-Icon9' : 'icon-Icon8') + ' aside-toggle mr-5 mb-2'

        return (
            <>
                <nav className='navbar navbar-expand-lg navbar-light fixed-top new-color align-items-center justify-content-between'>
                    <div className='d-flex align-items-end justify-content-between'>
                        <span className={asideToggleClasses + ' aside-toggler'} onClick={ this.props.toggleAside.bind(this.props) }/>
                        <a className='navbar-brand py-0 my-0' href="#">
                            <img src={img} style={{cursor : 'pointer'}} alt='brand'/>
                        </a>
                    </div>
                    <div id='root-connect'>
                        <Suspense fallback={<div>---</div>}>
                            {(!this.props.connectionStatus) ? <Connect updDexData = {this.props.updDexData.bind(this.props)} /> : <div className="d-none d-xl-block">
                                <IndicatorPanel />
                            </div>}
                        </Suspense>
                    </div>
                    {this.props.connectionStatus &&
                    <div className="w-100 d-flex align-items-center justify-content-center d-xl-none bottom-indicator"
                         style={{height:'50px', background: 'white', position: 'fixed', bottom: '0px', backgroundColor: 'var(--menu-bg-non-transparent)', zIndex: '901'}}>
                        <IndicatorPanel />
                    </div>
                    }
                </nav>
            </>
        )
    }
}

const WNavbar = connect(
    mapStoreToProps(components.NAVBAR),
    mapDispatchToProps(components.NAVBAR)
)(withTranslation()(Navbar))

export default WNavbar
