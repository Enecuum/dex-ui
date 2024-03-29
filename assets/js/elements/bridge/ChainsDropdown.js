import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, ButtonGroup, Dropdown } from 'react-bootstrap'
import { withTranslation } from "react-i18next";

import { mapStoreToProps, mapDispatchToProps, components } from '../../../store/storeToProps';

import {availableNetworks} from'./../../config';

import CommonModal from "./../../elements/CommonModal";
import metamaskLogo from './../../../img/metamask-logo.webp';

import '../../../css/bridge.css';

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

        if ((enqChainMismatchToExtension || ethChainMismatchToExtension) && this.direction === 'from') {                
            this.showChangeChainModal(selectedChain);
            return
        } if ((enqChainMismatchToExtension || ethChainMismatchToExtension) && this.direction === 'to' && this.props.fromBlockchain?.id !== selectedChain.id) {                
            this.setChainInStore(availableNetworks[indexInArrayOfAvailableNetworks]);
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
            }, function(res) {                
                that.closeAction();
            });
        } catch (error) {
          console.log(error)
          this.setState({selectedChain : undefined});
        }
    }

    renderModalBody(selectedChain) {
        let web3ExtensionIsInstalled = this.props.nonNativeConnection.web3Extension?.provider !== undefined ? true : false;
        if (selectedChain.type === 'eth')
            return (
                <div className="text-center">
                    {web3ExtensionIsInstalled &&
                        <Button
                            className="btn btn-secondary mb-2 px-4 button-bg-3 mt-4"
                            onClick={this.requestSwitchEthChain.bind(this, selectedChain)}>Set {selectedChain.name}</Button>
                    }
                    {!web3ExtensionIsInstalled && selectedChain.type === 'eth' &&
                        <a className="link-primary transition-item" href="https://metamask.io/download/">
                            <Button                        
                                className="btn btn-secondary mb-2 px-4 button-bg-3 mt-4">
                                <div>Install Metamask</div>
                                <img src={metamaskLogo} width="24" height="24"/>
                            </Button>
                      </a>
                    }
                </div>
            )
        else if (selectedChain.type === 'enq')
            return (
                <div className="text-center">
                    Set {selectedChain.name} in your ENQ extension and choose {selectedChain.name} again
                </div>
            ) 
    }

    closeAction () {
        this.setState({showChangeChainModal : false});
        this.setState({selectedChain : undefined});
    }


    getChainListItem(item, index) {
        if ((this.direction === 'from' && this.props.toBlockchain?.id !== item.id) ||
            (this.direction === 'to' && this.props.fromBlockchain?.id !== item.id)) {
                return(
                    <Dropdown.Item
                        key={`${item.id}-${item.name}`}
                        onClick={this.tryToSelectChain.bind(this, index)}
                        >{item.name}</Dropdown.Item>
                )
        }
    }

    render() {
        let that = this;
        return (            
            <>
                {this.state.showChangeChainModal && 
                    <CommonModal
                        modalClassName={'change-chain-request-modal'}
                        renderHeader={this.renderModalHeader.bind(this)}
                        renderBody={this.renderModalBody.bind(this, this.state.selectedChain)}
                        closeAction={this.closeAction.bind(this)}/>
                }            
                <Dropdown as={ButtonGroup} className="w-100">
                    <Dropdown.Toggle className="w-100">
                        <div className="select-chain-title">{this.getChainButtonTitle()}</div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {availableNetworks.map((item, index) => (
                            that.getChainListItem(item, index)
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