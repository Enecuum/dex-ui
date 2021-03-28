import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Presets from '../store/pageDataPresets';
let presets = new Presets();

class IndicatorPanel extends React.Component {
    constructor (props) {
        super(props);
        this.root = props.root;
        this.state = {
            coinName: presets.network.nativeToken.name,
            coinAmount: 0,
            enx: 0,
            pubKey: this.root.pubKey,
            pending: this.root.state.pending
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

    renderWalletInfo() {
        return (
            <div className='wallet-info-wrapper d-flex align-items-center justify-content-end'>
                <div id="pendingIndicator" className="d-flex align-items-center justify-content-end px-3 mr-3">
                    <span className="mr-2">Pending</span>
                    <span className="spinner icon-Icon3"></span>
                </div>
                <div className='net wallet-info-boxes d-flex align-items-center justify-content-center mr-3'>
                    <Dropdown Menu alignRight >
                        <Dropdown.Toggle variant="link" id="dropdown-basic" className="choose-net">
                            <span className='text-uppercase'>{this.networks[this.root.state.net.toLowerCase()].name}</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="wrapper-1">
                            {this.netsOrder.map((item, index) => (
                                <Dropdown.Item className="text-center py-2 net-item" key={index} value={index}>{this.networks[item].name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className='enx-amount wallet-info-boxes d-flex align-items-center justify-content-center px-3 border-0 mr-3'>
                    {this.state.enx} ENX
                </div>
                <div className='wallet-info-boxes d-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center justify-content-center px-3'>{this.state.coinAmount} {this.state.coinName}</div>
                    <div className='addr wallet-info-boxes d-flex align-items-center justify-content-center'>{this.state.pubKey}</div>
                </div>
            </div>
        );
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

    packAdressString(addr) {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    render () {
        return this.renderWalletInfo();
    };
};

export default IndicatorPanel;