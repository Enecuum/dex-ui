import React from 'react';

import {availableNetworks} from'./../config';
import { /*Modal, Button,*/Form, ButtonGroup, Dropdown } from 'react-bootstrap';
import validatorRequests from "../requests/ValidatorRequests";
import BridgeHistoryProcessor from "./../utils/BridgeHistoryProcessor";
import '../../css/bridge.css';


class RescueBridgeTxForm extends React.Component {
    constructor () {
        super();
        this.bridgeHistoryProcessor = new BridgeHistoryProcessor();
        this.state = {
            fromChainIndex : 0,
            rescuedLockTxHash : undefined
        }
    };

    getChainButtonTitle() {
        return availableNetworks[this.state.fromChainIndex].name;
    }

    selectChain(index) {
        this.setState({fromChainIndex : index})
    }

    getChainListItem(item, index) {
        return(
            <Dropdown.Item
                key={`${item.id}-${item.name}`}
                onClick={this.selectChain.bind(this, index)}
                >{item.name}</Dropdown.Item>
        )
    }

    handleInputRescuedLockTxHash(item) {
        let value = item.target.value;
        this.setState({rescuedLockTxHash : value});
    }

    rescueTx() {
        let src_chain = availableNetworks[this.state.fromChainIndex];
        let transactionHash = this.state.rescuedLockTxHash;
        let that = this;        
        validatorRequests.postToValidator(transactionHash, src_chain.id).then(function(validatorRes) {
            console.log(validatorRes);
            if (validatorRes === null || validatorRes.hasOwnProperty('err')) {
                console.log('Validator_notify response is null for lock transaction', transactionHash)
                return
            }

            let ticket = validatorRes.ticket;

            let accountInteractToBridgeItem = {
                rescued : true,
                initiator : `${ticket.src_address}_${ticket.dst_address}`,
                lock       : {
                                transactionHash : transactionHash,
                                src_address     : ticket.src_address,
                                src_network     : parseInt(ticket.src_network),
                                dst_address     : ticket.dst_address,
                                dst_network     : parseInt(ticket.dst_network),
                                token_amount    : ticket.amount,
                                token_hash      : ticket.origin_hash,
                                token_decimals  : ticket.origin_decimals,
                                ticker          : ticket.ticker,
                                nonce           : ticket.nonce
                            }                    
                
            };

            let bridgeHistoryArray = that.bridgeHistoryProcessor.getBridgeHistoryLocksArray();
                if (bridgeHistoryArray.length > 0) {
                    let itemIsExist = bridgeHistoryArray.find(function(elem) {
                        if ((elem.initiator.toUpperCase().includes(ticket.src_address.toUpperCase()) ||
                            elem.initiator.toUpperCase().includes(ticket.dst_address.toUpperCase())) && elem.lock?.transactionHash === transactionHash)
                            return true
                    });

                    if (itemIsExist !== undefined) {
                        console.log('itemIsExist')
                        return
                    } else {
                        console.log('addBridgeHistoryItem')
                        localStorage.setItem(`bh_lock_${transactionHash}`, JSON.stringify(accountInteractToBridgeItem));
                    }
                } else {
                    console.log('initiateHistoryStorage')
                    localStorage.setItem(`bh_lock_${transactionHash}`, JSON.stringify(accountInteractToBridgeItem));
                }
        }, function(err) {
            console.log('Can\'t get notify response ', err);
        });
    }

    render () {
        let that = this;
        let disabled = false;
        return (
            <div id="rescueForm" className="d-none">
                <div className="h3">Rescue</div>
                <div className="row">
                    <div className="col col-xl-3">                        
                        <div>Network</div>
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
                    </div>
                    <div className="col col-xl-9">
                        <div>Tx Hash</div>
                        <div>
                            <Form.Group className="mb-0" controlId="inputRescuedLockTxHash">
                                <Form.Control
                                    type="text"
                                    placeholder="---"
                                    autoComplete="off"
                                    value={this.state.rescuedLockTxHash}
                                    onChange={this.handleInputRescuedLockTxHash.bind(this)}/> 
                            </Form.Group>
                        </div>
                    </div>                   
                    <div className="col-12">
                        <button
                        className="d-block w-100 btn btn-secondary mb-2 px-4 button-bg-3 mt-4"
                        onClick={this.rescueTx.bind(this)}
                        disabled={this.state.rescuedLockTxHash == '' || this.state.rescuedLockTxHash == undefined}>
                        Execute</button>
                    </div>                               
                </div> 
            </div>
        );
    };
}

export default RescueBridgeTxForm;