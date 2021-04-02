import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Connect from './Connect';
import '../css/navbar.css';
import '../css/font-style.css';
import img from '../img/enex-logo.png';
import IndicatorPanel from './IndicatorPanel';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps';

class Navbar extends React.Component {
    constructor (props) {
        super(props);
    };
    
    render () {
        let asideToggleClasses = (this.props.navOpened ? 'icon-Icon9' : 'icon-Icon8') + ' aside-toggle mr-5 mb-2';

        return (
            <nav className='navbar navbar-expand-lg navbar-light fixed-top new-color align-items-center justify-content-between'>
                    <div className='d-flex align-items-end justify-content-between'>                 
                        <span className={asideToggleClasses + ' aside-toggler'} onClick={ this.props.toggleAside.bind(this.props) }/>                        
                        <a className='navbar-brand py-0 my-0' href="#">
                            <img src={img} style={{cursor : 'pointer'}}></img>
                        </a>                     
                    </div>                    
                    <div id='root-connect'>
                        {(!this.props.connectionStatus) ? <Connect /> : <IndicatorPanel />}
                    </div>
            </nav>
        );
    };
};

const WNavbar = connect(mapStoreToProps(components.NAVBAR), mapDispatchToProps(components.NAVBAR))(Navbar);

export default WNavbar;