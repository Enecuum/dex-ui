import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, ButtonGroup, Dropdown } from 'react-bootstrap'
import { withTranslation } from "react-i18next";

import { mapStoreToProps, mapDispatchToProps, components } from '../../../store/storeToProps';

import {availableNetworks} from'./../../config';

import CommonModal from "./../../elements/CommonModal";

class ChainsDropdown extends React.Component {
    constructor (props) {
        super(props)
        this.direction = this.props.direction;
        this.state = {
            showChangeChainModal : false,
            selectedChain : undefined
        }
    }

    getChainButtonTitle() {
        let title = '---';
        if (this.direction === 'from' || this.direction === 'to') {
            let propName = `${this.direction}Blockchain`;
            title = this.props[propName]?.name !== undefined ? this.props[propName].name : 'Network';                      
        }
        return title
    }

    tryToSelectChain(indexInArrayOfAvailableNetworks) {
        let selectedChain = availableNetworks[indexInArrayOfAvailableNetworks];
        let enqChainMismatchToExtension = selectedChain.type === 'enq' && selectedChain.enqExtensionChainId !== this.props.net.url;
        let ethChainMismatchToExtension = selectedChain.type === 'eth' && selectedChain.web3ExtensionChainId !== this.props.nonNativeConnection.web3ExtensionChain;

        if (enqChainMismatchToExtension || ethChainMismatchToExtension) {                
            this.showChangeChainModal(selectedChain);
        } else            
            this.setChainInStore(availableNetworks[indexInArrayOfAvailableNetworks]);
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    setChainInStore(chainObj) {
        let direction = this.capitalizeFirstLetter(this.direction);
        let methodName = `update${direction}Blockchain`;
        this.props[methodName](chainObj);
    }

    showChangeChainModal(selectedChain) {
        this.setState({showChangeChainModal : true});
        this.setState({selectedChain : selectedChain});
    }

    renderModalHeader () {
        return (
            <Modal.Title id="example-custom-modal-styling-title">
                <div className="d-flex align-items-center justify-content-start">
                    <span>
                        Change Network
                    </span>
                </div>
            </Modal.Title>
        )
    }

    async requestSwitchEthChain(selectedChain) {
        let that = this;
        let requestData = {
            method: 'wallet_switchEthereumChain',
            params: [
                {
                    chainId: selectedChain.web3ExtensionChainId
                }
            ]
        };

        try {
            await ethereum.request(requestData).then(function(res) {
                that.setChainInStore(selectedChain);
                that.closeAction();
            });
        } catch (error) {
          console.log(error)
          this.setState({selectedChain : undefined});
        }
    }

    renderModalBody(selectedChain) {
        return (
            <div className="text-center">
                <button 
                    onClick={this.requestSwitchEthChain.bind(this, selectedChain)}>Set {selectedChain.name}</button>
            </div>
        )
    }

    closeAction () {
        this.setState({showChangeChainModal : false});
        this.setState({selectedChain : undefined});
    }

    render() {
        return (            
            <>
                {this.state.showChangeChainModal && 
                    <CommonModal
                        modalClassName={'change-chain-request-modal'}
                        renderHeader={this.renderModalHeader.bind(this)}
                        renderBody={this.renderModalBody.bind(this, this.state.selectedChain)}
                        closeAction={this.closeAction.bind(this)}/>
                }            
                <Dropdown as={ButtonGroup}>
                    <Dropdown.Toggle>{this.getChainButtonTitle()}</Dropdown.Toggle>
                        <Dropdown.Menu>
                            {availableNetworks.map((item, index) => (
                                <Dropdown.Item
                                    key={`${item.id}-${item.name}`}
                                    onClick={this.tryToSelectChain.bind(this, index)}
                                    >{item.name}</Dropdown.Item>                                
                            ))}
                        </Dropdown.Menu>
                </Dropdown>
            </>            
        )
    }
}

const WSpaceBridgeChainsDropdown = connect(mapStoreToProps(components.BIRDGE_CHAINS_DROPDOWN), mapDispatchToProps(components.BIRDGE_CHAINS_DROPDOWN))(withTranslation()(ChainsDropdown));

export default WSpaceBridgeChainsDropdown;




    // tryToSelectChain(indexInArrayOfAvailableNetworks) {
    //     let selectedChain = availableNetworks[indexInArrayOfAvailableNetworks];
    //     // let toChainNotSet = this.props.toBlockchain === undefined;
    //     // let fromChainNotSet = this.props.fromBlockchain === undefined;
    //     let enqChainMismatchToExtension = selectedChain.type === 'enq' && selectedChain.enqExtensionChainId !== this.props.net.url;
    //     let ethChainMismatchToExtension = selectedChain.type === 'eth' && selectedChain.web3ExtensionChainId !== this.props.nonNativeConnection.web3ExtensionChain;


    //         if (enqChainMismatchToExtension || ethChainMismatchToExtension) {                
    //             this.showChangeChainModal(selectedChain);
    //         } else            
    //             this.setChainInStore(availableNetworks[indexInArrayOfAvailableNetworks]);

    //     // if ((this.direction === 'from' && toChainNotSet) || (this.direction === 'to' && fromChainNotSet)) { 
    //     //     if (enqChainMismatchToExtension || ethChainMismatchToExtension) {                
    //     //         this.showChangeChainModal(selectedChain);
    //     //     } else            
    //     //         this.setChainInStore(availableNetworks[indexInArrayOfAvailableNetworks]);
    //     // } else if ((this.direction === 'from' && !toChainNotSet) || (this.direction === 'to' && !fromChainNotSet)) {
    //     //     if ((this.direction === 'from' && this.props.toBlockchain.type !== selectedChain.type) ||
    //     //         (this.direction === 'to' && this.props.fromBlockchain.type !== selectedChain.type)) {
    //     //         console.log('From and To networks must not be the different types!');
    //     //     } else if ((this.direction === 'from' && this.props.toBlockchain.testnet !== selectedChain.testnet) ||
    //     //         (this.direction === 'to' && this.props.fromBlockchain.testnet !== selectedChain.testnet)) {
    //     //         console.log('From and To networks must be both testnets or production!');
    //     //     } else if ((this.direction === 'from' && selectedChain.type === 'enq' && this.props.toBlockchain.type === 'enq' && this.props.toBlockchain.enqExtensionChainId === selectedChain.enqExtensionChainId) ||
    //     //         (this.direction === 'to' && selectedChain.type === 'enq' && this.props.fromBlockchain.type === 'enq' && this.props.fromBlockchain.enqExtensionChainId === selectedChain.enqExtensionChainId) ||
    //     //         (this.direction === 'from' && selectedChain.type === 'eth' && this.props.toBlockchain.type === 'eth' && this.props.toBlockchain.web3ExtensionChainId === selectedChain.web3ExtensionChainId) ||
    //     //         (this.direction === 'to' && selectedChain.type === 'eth' && this.props.fromBlockchain.type === 'eth' && this.props.fromBlockchain.web3ExtensionChainId === selectedChain.web3ExtensionChainId)) {                
    //     //         console.log('From and To networks must not be the same!');
    //     //     } else if (enqChainMismatchToExtension || ethChainMismatchToExtension) {
    //     //         this.showChangeChainModal(selectedChain);
    //     //     } else            
    //     //         this.setChainInStore(availableNetworks[indexInArrayOfAvailableNetworks]);            
    //     // }
    // }   