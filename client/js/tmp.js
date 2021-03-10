            //<div>
                // {this.order.map((social, index) => (
                //     <a href='{this.items[social].link}'>
                //         <span className='{this.items[social].iconClasses}'/>
                //     </a>
                // ))}



                                <nav className='navbar navbar-expand-lg navbar-light fixed-top new-color align-items-center justify-content-between'>
                    <div className='d-flex align-items-end justify-content-between'>                 
                        <span className='icon-Icon9 mr-5 mb-2' onClick={ this.openCloseNavbar.bind(this) } style={{ color : '#61758b', 'font-size' : '20px'}}/>                        
                        <a className='navbar-brand py-0 my-0' href="#">
                            <img src='img/enex-logo.png' style={{cursor : 'pointer'}}></img>
                        </a>                     
                    </div>                    
                    <div id='root-connect' className='connect-btn'>
                        <Connect outer={ this } />
                    </div>
                </nav>