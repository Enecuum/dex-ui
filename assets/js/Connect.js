import React from 'react';
import '../css/index.css';

import Dropdown from 'react-bootstrap/Dropdown';
import Presets from './pageDataPresets';
let presets = new Presets();

class Connect extends React.Component {
    constructor(props) {
        super(props);
        this.root = props.outer;
        this.state = {
            coinName: presets.network.nativeToken.name,
            coinAmount: 0,
            enx: 0,
            pubKey: this.root.pubKey
        };
        this.networks = {
            bit : {
                name : 'BIT',
                action : undefined
            }
        };
        this.netsOrder = ['bit'];
        this.updData();
    };

    updData() {
        setInterval(async () => {
            this.root.getBalance(presets.network.nativeToken.hash)
            .then(balance => {
                if (balance !== undefined)
                    this.setState({ coinAmount: balance.amount });
            });
            this.setState({ pubKey: this.packAdressString(this.root.pubKey) });
        }, 1000);
    };

    renderConnectionButton() {
        return (
            <button onClick={this.root.openConnectionList.bind(this.root)}
                className='btn btn-secondary my-2 my-sm-0 c-co connect-btn d-flex align-items-center justify-content-center'
                type='submit'
                style={{
                    backgroundColor: 'var(--color3)'
                }}>
                { this.root.state.langData.navbars.top.connect}
            </button>
        );
    };

    packAdressString(addr) {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    renderWalletInfo() {
        return (
            <div className='d-flex align-items-center'>
                <div className='net wallet-info-boxes d-flex align-items-center justify-content-center'>
                    <Dropdown>
                        <Dropdown.Toggle variant="link" id="dropdown-basic">
                            <span className='text-uppercase'>{this.networks[this.root.state.net.toLowerCase()].name}</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="wrapper-1">
                            {this.netsOrder.map((item, index) => (
                                <Dropdown.Item className="text-center py-2 net-item" value={index}>{this.networks[item].name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className='enx-amount wallet-info-boxes d-flex align-items-center justify-content-center'>
                    {this.state.enx} ENX
                </div>
                <div className='wallet-group wallet-info-boxes'>
                    <div className='enq-vol d-flex align-items-center justify-content-center'>{this.state.coinAmount} {this.state.coinName}</div>
                    <div className='addr wallet-info-boxes d-flex align-items-center justify-content-center'>{this.state.pubKey}</div>
                </div>
            </div>
        );
    };

    render() {
        return (!this.root.state.connectionStatus) ? this.renderConnectionButton() : this.renderWalletInfo();
    }
};

export default Connect;