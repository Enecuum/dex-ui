import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Connect from './Connect';
import '../css/navbar.css';
import '../css/font-style.css';
import img from '../img/enex-logo.png';
import IndicatorPanel from './IndicatorPanel';

class Navbar extends React.Component {
    constructor (props) {
        super(props);
        this.root = props.outer;

        this.state = {
            pending: this.root.state.pending
        }
    };
    
    render () {
        let asideToggleClasses = (this.root.state.navOpened ? 'icon-Icon9' : 'icon-Icon8') + ' aside-toggle mr-5 mb-2';

        return (
            <nav className='navbar navbar-expand-lg navbar-light fixed-top new-color align-items-center justify-content-between'>
                    <div className='d-flex align-items-end justify-content-between'>                 
                        <span className={asideToggleClasses + ' aside-toggler'} onClick={ this.root.toggleNavbar.bind(this.root) }/>                        
                        <a className='navbar-brand py-0 my-0' href="#">
                            <img src={img} style={{cursor : 'pointer'}}></img>
                        </a>                     
                    </div>                    
                    <div id='root-connect'>
                        {(!this.root.state.connectionStatus) ? <Connect outer={ this.root } /> : <IndicatorPanel root={ this.root } />}
                    </div>
            </nav>
        );
    };
};

export default Navbar;