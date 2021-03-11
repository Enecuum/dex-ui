import React from 'react';
import Connect from './Connect';
import '../css/navbar.css';
import '../css/font-style.css';

class Navbar extends React.Component {
    constructor (props) {
        super(props);
        this.root = props.outer;
    };
    render () {
        let asideToggleClasses = (this.root.navOpen ? 'icon-Icon9' : 'icon-Icon8') + ' aside-toggle mr-5 mb-2';

        return (
            <nav className='navbar navbar-expand-lg navbar-light fixed-top new-color align-items-center justify-content-between'>
                    <div className='d-flex align-items-end justify-content-between'>                 
                        <span className={asideToggleClasses} onClick={ this.root.toggleNavbar.bind(this.root) }/>                        
                        <a className='navbar-brand py-0 my-0' href="#">
                            <img src='img/enex-logo.png' style={{cursor : 'pointer'}}></img>
                        </a>                     
                    </div>                    
                    <div id='root-connect' className='connect-btn'>
                        <Connect outer={ this.root } />
                    </div>
            </nav>
        );
    };
};

export default Navbar;