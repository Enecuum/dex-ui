import React from 'react';
import '../css/close-button.css';
import '../css/index.css';

class ConnectionService extends React.Component {
    constructor (props) {
        super(props);
        this.mySwapPage = props.outer;
    }

    async connectToEnq () {
        await ENQweb3lib.enable()
        .then(res => {
            this.mySwapPage.pubKey = res;
            this.mySwapPage.connectionStatus = true;
        },
        () => {
            this.mySwapPage.connectionStatus = false;
        });
        this.mySwapPage.closeConnectionList();
        this.mySwapPage.updSubmitName();
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
                        borderBottom: '1px solid #80808094',
                        marginTop : '25px',
                        width: '100%'
                    }}>
                </div>
                <button onClick={this.connectToEnq.bind(this)}
                        className='btn btn-secondary'
                        style={{
                            borderRadius: '20px',
                            width: '90%',
                            height: '60px',
                            marginLeft: '5%',
                            marginTop: '20px',
                            fontSize: '20px',
                            backgroundColor : 'var(--color3)'
                        }}>
                    EnqWallet
                </button>
            </div>
        );
    }
};

export default ConnectionService;