import React from 'react';
import '../css/close-button.css';
import '../css/index.css';
import '../css/wallet-connection.css';
import '../css/font-style.css';
import img from '../img/logo.png';

class ConnectionService extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    }

    async connectToEnq () {
        if (!this.mySwapPage.state.connectionStatus)
            await Enecuum.connect();
        await Enecuum.enable()
        .then(res => {
            this.mySwapPage.pubKey = res.pubkey;
            this.mySwapPage.setState(state => {
                state.connectionStatus = true;
                return state;
            });
        },
        () => {
            this.mySwapPage.setState(state => {
                state.connectionStatus = false;
                return state;
            });
        });
        this.mySwapPage.closeConnectionList();
    };

    render () {
        return (
            <div>
                <div className="close"
                    onClick={this.mySwapPage.closeConnectionList.bind(this.mySwapPage)}>
                </div>
                <h4 style={{
                        marginTop : '7%',
                        marginLeft : '6%'
                    }}>
                    {this.mySwapPage.state.langData.navbars.top.connectionCard.header}
                </h4>
                <div style={{
                        borderBottom: '1px solid rgba(26, 31, 46)',
                        marginTop : '25px',
                        width: '100%'
                    }}>
                </div>
                <div onClick={this.connectToEnq.bind(this)} className='enq-wallet d-flex align-items-center'>
                    <p className='col-6'>ENQ Wallet</p>
                    <div className='col-6 d-flex justify-content-end align-items-center' >
                        <div className='c-circle'></div>
                        <img src={img}></img>
                    </div>
                </div>
                <div href='#' className='d-flex justify-content-center c-clue'>
                    <span className='icon-Icon4'></span>
                    {this.mySwapPage.state.langData.navbars.top.connectionCard.clue}
                </div>
            </div>
        );
    }
};

export default ConnectionService;