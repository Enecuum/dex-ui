import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';
import actionsValidationRules from '../utils/dropFarmsValidationRules/StakeUnstakeValidationRules';
import Validator from  '../utils/Validator';

import '../../css/confirm-supply.css';

const valueProcessor = new ValueProcessor();

class StakeModal extends React.Component {
    constructor(props) {
        super(props);
        // this.tokenTypesTitles = {
        //     'type_0' : 'etm.nonReissuable',
        //     'type_1' : 'etm.reissuable',
        //     'type_2' : 'etm.mineable',
        // }        

        // this.tokenFeeTypesTitles = {
        //     'type_0' : 'etm.nonReissuable',
        //     'type_1' : 'etm.reissuable'
        // }

        // this.rmPercents = 50;
        this.handleInputChange = this.handleInputChange.bind(this);
        this.modifyStakeRanges = {
            ranges : [
                {
                    value : 25,
                    alias : '25%'
                },
                {
                    value : 50,
                    alias : '50%'
                },
                {
                    value : 75,
                    alias : '75%'
                },
                {
                    value : 100,
                    alias : 'MAX'
                }
            ]
        };
    }

    closeModal () {
        this.props.updShowStakeModal({
            value : false
        });
    };

    sendIssueTokenTx() {
        return true;
    }

    handleInputChange() {

    }


    render() {
        const t = this.props.t;

        return (

            <>
                <Modal
                    show={this.props.showStakeModal}
                    aria-labelledby="example-custom-modal-styling-title"
                    onHide={this.closeModal.bind(this)}
                    centered >
                    <Modal.Header closeButton className="mb-0 pb-0">
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    {t('dropFarms.stakeLPTokens')}
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="stake-input-area px-3 py-3 mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>{t('dropFarms.stake')}</div>
                                <div className="d-flex flex-nowrap">
                                    <div className="mr-2">{t('balance')}:</div>
                                    <div>{(this.props.stakeData.stakeTokenAmount !== null && this.props.stakeData.stakeTokenAmount !== undefined) ? valueProcessor.usCommasBigIntDecimals(this.props.stakeData.stakeTokenAmount, this.props.managedFarmData.stake_token_decimals) + ' ' + this.props.managedFarmData.stake_token_name : '---'} </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <Form.Control
                                  type="text"
                                  placeholder="0"
                                  className="mr-4 stake-input"
                                  onChange={this.handleInputChange.bind(this)}/>
                                <div className="d-flex flex-nowrap">
                                    <div className="mr-2 set-max text-color3 hover-pointer">{t('max')}</div>
                                    <div className="text-nowrap">{this.props.managedFarmData !== null ? this.props.managedFarmData.stake_token_name : '---'} LP</div>
                                </div>
                            </div>                                                         
                        </div>

                        <div className={`err-msg mb-4 ${this.props.stakeData.stakeValid ? 'd-none' : 'd-block'}`}>
                            {this.props.stakeData.stakeValidationMsg}
                        </div>                        

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            {this.modifyStakeRanges.ranges.map((item, index) => (
                                <button key={index+''} className="btn btn-secondary px-3 py-1 text-color4" >{item.alias}</button>
                            ))}
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <Button className='btn-secondary confirm-supply-button w-100 mr-2'
                                    onClick={this.closeModal.bind(this)}>
                                {t('cancel')}
                            </Button>
                            <Button className='btn-secondary confirm-supply-button w-100 ml-2'
                                    disabled={!this.props.stakeData.stakeValid}
                                    onClick={this.sendIssueTokenTx.bind(this)}>
                                {t('confirm')}
                            </Button>                        
                        </div>
 
                        <div className="text-center ">
                            <a
                                href = "/"
                                className="text-color4-link hover-pointer">
                                <span className="mr-2">{t('dropFarms.getLPToken', {tokenName : 'CAKE-BNB'})}</span>
                                <span className="icon-Icon11"/>                                
                            </a>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

const WStakeModal = connect(mapStoreToProps(components.FARMS), mapDispatchToProps(components.FARMS))(withTranslation()(StakeModal));

export default WStakeModal;