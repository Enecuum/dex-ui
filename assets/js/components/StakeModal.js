import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';
import FarmValidationRules from '../utils/dropFarmsValidationRules/StakeUnstakeValidationRules';
import Validator from  '../utils/Validator';

import '../../css/confirm-supply.css';
import lsdp from "../utils/localStorageDataProcessor";

const valueProcessor = new ValueProcessor();

class StakeModal extends React.Component {
    constructor(props) {
      super(props);

      this.handleInputChange = this.handleInputChange.bind(this);
      this.valueProcessor = new ValueProcessor;
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
      this.actionTypesAliases = {
        farm_increase_stake : 'stakeNamedToken',
        farm_decrease_stake : 'unstakeNamedToken'
      }
    }

    getLinkToPair() {
      if (this.props.managedFarmData !== null) {
        let data = this.props.managedFarmData;
        return "/#!action=swap&pair=" + data.stake_token_name + "-" + data.reward_token_name + '&from=' + data.stake_token_hash + "&to=" + data.reward_token_hash;
      } 
    }
    
    closeModal () {
        this.props.updShowStakeModal({
            value : false
        });
        this.props.updateStakeData({
          field : 'stakeValue',
          value : 0
        });        
    };

    handleInputChange(event) {
      const target = event.target;
      let value = target.value;
      this.processData(value);
    }

    doAction() {
      let value = this.props.stakeData.stakeValue.numberValue
      this.processData(value, 'sendTx');
    }

    processData(value, purpose = '') { //if purpose == 'sendTx' will send stake/unstake transaction
      let commonDataSet = {
        currentAction        : this.props.currentAction,
        mainToken            : this.props.mainToken,
        stakeTokenAmount     : BigInt(this.props.stakeData.stakeTokenAmount),
        stakeValue           : {
                                  numberValue : value
                                },
        initialStake         : this.props.managedFarmData.stake !== undefined && this.props.managedFarmData.stake !== null ? BigInt(this.props.managedFarmData.stake) : 0n,                        
        mainTokenAmount      : BigInt(this.props.mainTokenAmount),
        actionCost           : BigInt(this.props.stakeData.actionCost),
        stake_token_decimals : this.props.managedFarmData.stake_token_decimals,
        stake_token_hash     : this.props.managedFarmData.stake_token_hash,
      }

      let validationRules = new FarmValidationRules(this.props.t)
      let validator = new Validator;
      let commonValidationRules = validationRules.getCommonValidationRules(commonDataSet);
      let commonCheck = validator.batchValidate(commonDataSet, commonValidationRules);
      let dataValid = commonCheck.dataValid;

      this.props.updateStakeData({
          field : 'msgData',
          value : commonCheck.propsArr
      });

      if (commonCheck.dataValid) {
        let bigIntValue = this.valueProcessor.valueToBigInt(value, this.props.managedFarmData.stake_token_decimals);
        commonDataSet.stakeValue.bigIntValue = bigIntValue.value;
        commonDataSet.stakeValue.rawFractionalPart = bigIntValue.rawFractionalPart;
        let specialValidationRules = validationRules.getSpecialValidationRules(commonDataSet);
        let validatonResult = validator.batchValidate(commonDataSet, specialValidationRules);
        dataValid = validatonResult.dataValid;
        this.props.updateStakeData({
            field : 'msgData',
            value : validatonResult.propsArr
        });
        this.props.updateStakeData({
          field : 'stakeValue',
          value : commonDataSet.stakeValue
        });

      } else if (value === '' || value === undefined) { 
        this.props.updateStakeData({
          field : 'stakeValue',
          value : {
            numberValue : '',
            bigIntValue : '',
            rawFractionalPart : ''
          }
        });
      }  

      this.props.updateStakeData({
        field : 'stakeValid',
        value : dataValid
      });

      if (purpose === 'sendTx') {
        let obj = {
          farm_id : this.props.managedFarmData.farm_id,
          amount : commonDataSet.stakeValue.bigIntValue
        }

        extRequests.farmAction(this.props.pubkey, this.props.currentAction, commonDataSet.actionCost, obj)        
        .then(result => {
            console.log(obj)
            console.log('Success', result.hash);

            let interpolateParams = {
                value0  : commonDataSet.stakeValue.numberValue,
                ticker0 : this.props.managedFarmData.reward_token_name
            }
            lsdp.write(result.hash, 0, this.props.currentAction, interpolateParams)
            this.closeModal();
        },
        error => {
            console.log('Error')
            //this.props.changeWaitingStateType('rejected');
        });
      }
    }

    setValue(percentage = 100) {
      let action = this.props.currentAction;
      let value = 0n;
      if (action === 'farm_increase_stake') {
        value = BigInt(this.props.stakeData.stakeTokenAmount);
        if (this.props.managedFarmData.stake_token_hash === this.props.mainToken) {
          value -= BigInt(this.props.stakeData.actionCost);
          if (value < 0) {
            value = 0n
          }
        }

      } else if (action === 'farm_decrease_stake') {
        value = BigInt(this.props.managedFarmData.stake);
      }

      let op0 = {
        value    : value,
        decimals : this.props.managedFarmData.stake_token_decimals
      }

      let op1 = {
        value    : valueProcessor.valueToBigInt(percentage/100, 2).value,
        decimals : 2
      }      

      value = valueProcessor.mul(op0, op1);
      let max = valueProcessor.usCommasBigIntDecimals(value.value, value.decimals, this.props.managedFarmData.stake_token_decimals).replace(/,/g,'')
      this.processData(max);     
    }

    getPercentage(stake) {

      let res = 0;
      let action = this.props.currentAction;
      if (this.props.stakeData.stakeValid && this.props.managedFarmData !== null && stake !== undefined) {        
        let decimals = this.props.managedFarmData ? this.props.managedFarmData.stake_token_decimals : 0;
        let numerator = {
          value: BigInt(stake) * 100n,
          decimals: decimals
        };
        let denominator;        

        if (action === 'farm_increase_stake') {
          denominator = {
            value    : BigInt(this.props.stakeData.stakeTokenAmount),
            decimals : decimals
          }
        } else if (action === 'farm_decrease_stake') {
          denominator = {
            value    : BigInt(this.props.managedFarmData.stake),
            decimals : decimals
          }
        }

        let divRes = valueProcessor.div(numerator, denominator);
        try {
            res = valueProcessor.usCommasBigIntDecimals(divRes.value, divRes.decimals, divRes.decimals).replace(/,/g ,'');
        } catch (e) {
            res = 0
        }
      } else if (!this.props.stakeData.stakeValid) {
        if (action === 'farm_increase_stake') {
          if (this.props.stakeData.stakeValue.bigIntValue > BigInt(this.props.stakeData.stakeTokenAmount))
            res = 100;

        } else if (action === 'farm_decrease_stake') {
          if (this.props.stakeData.stakeValue.bigIntValue > BigInt(this.props.managedFarmData.stake))
            res = 100;
        }
      }   

      return res;
    }

    getModalTitle(t) {      
      if (this.props.currentAction !== undefined && this.props.managedFarmData !== null && this.props.managedFarmData.stake_token_name !== undefined) {
        return t('dropFarms.' + this.actionTypesAliases[this.props.currentAction], {tokenName: this.props.managedFarmData.stake_token_name});
      } else        
        return t('dropFarms.stakeLPTokens');
    }

    switchToSwap() {          
      this.closeModal();       
      this.props.changeMenuItem('exchange');      
    }

    render() {
        const t = this.props.t;
        return (

            <>
                <Modal
                    show={this.props.showStakeModal}
                    aria-labelledby="example-custom-modal-styling-title"
                    onHide={this.closeModal.bind(this)}
                    centered 
                    animation={false}>
                    <Modal.Header closeButton className="mb-0 pb-0">
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    {this.getModalTitle(t)}
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="stake-input-area px-3 py-3 mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                {this.props.currentAction === 'farm_increase_stake' &&
                                  <div>{t('dropFarms.stake')}</div>
                                }
                                {this.props.currentAction === 'farm_decrease_stake' &&
                                  <div>{t('dropFarms.unstake')}</div>
                                }                                 
                                <div className="d-flex flex-nowrap">
                                  {this.props.currentAction === 'farm_increase_stake' &&
                                    <>
                                      <div className="mr-2">{t('balance')}:</div>
                                      <div>{(this.props.stakeData !== null && this.props.managedFarmData !== null && this.props.stakeData.stakeTokenAmount !== undefined) ? valueProcessor.usCommasBigIntDecimals(this.props.stakeData.stakeTokenAmount, this.props.managedFarmData.stake_token_decimals) + ' ' + this.props.managedFarmData.stake_token_name : '---'} </div>
                                    </>
                                  }
                                  {this.props.currentAction === 'farm_decrease_stake' &&
                                    <>
                                      <div className="mr-2">{t('dropFarms.stake')}:</div>
                                      <div>{(this.props.managedFarmData !== null && this.props.managedFarmData.stake !== undefined) ? valueProcessor.usCommasBigIntDecimals(this.props.managedFarmData.stake, this.props.managedFarmData.stake_token_decimals) + ' ' + this.props.managedFarmData.stake_token_name : '---'} </div>
                                    </>
                                  }                                    
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <Form.Control
                                  type="text"
                                  placeholder="0"
                                  className="mr-4 stake-input"
                                  value = {this.props.stakeData.stakeValue.numberValue ? this.props.stakeData.stakeValue.numberValue : ''}
                                  onChange={this.handleInputChange.bind(this)}
                                  autoFocus/>
                                <div className="d-flex flex-nowrap">
                                    <div
                                      className="mr-2 set-max text-color3 hover-pointer hover-color4"
                                      onClick={this.setValue.bind(this, 100)}>
                                      {t('max')}
                                    </div>
                                    <div className="text-nowrap">{this.props.managedFarmData !== null ? this.props.managedFarmData.stake_token_name : '---'}</div>
                                </div>
                            </div>                                                         
                        </div>

                        <div className={`err-msg mb-4 ${this.props.stakeData.stakeValid ? 'd-none' : 'd-block'}`}>
                            {this.props.stakeData.stakeValidationMsg}
                        </div>

                        <Form.Group className="pb-2">
                          <Form.Control                            
                            value = {this.getPercentage(this.props.stakeData.stakeValue.bigIntValue)}
                            type="range"
                            onChange={e => this.setValue(e.target.value.toString())}
                            variant='danger'
                            min={0}
                            max={100}
                            style={{opacity : !this.props.stakeData.stakeValid ?  0.3 : 1}}
                          />
                        </Form.Group>

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            {this.modifyStakeRanges.ranges.map((item, index) => (
                                <button
                                  key={index+''}
                                  className="btn btn-secondary px-3 py-1 text-color4"
                                  onClick={this.setValue.bind(this, item.value)}>
                                  {item.alias}
                                </button>
                            ))}
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <Button className='btn-secondary confirm-supply-button w-100 mr-2'
                                    onClick={this.closeModal.bind(this)}>
                                {t('cancel')}
                            </Button>
                            <Button className='btn-secondary confirm-supply-button w-100 ml-2'
                                    disabled={!this.props.stakeData.stakeValid}
                                    onClick={this.doAction.bind(this)}>
                                {t('confirm')}
                            </Button>                        
                        </div>
                        
                        {this.props.managedFarmData !== null &&
                          <div className="text-center">
                              <a
                                href = {this.getLinkToPair()}
                                onClick={this.switchToSwap.bind(this)}
                                className="text-color4-link hover-pointer">
                                <span className="mr-2">{t('dropFarms.getLPToken', {tokenName : this.props.managedFarmData.stake_token_name +'-' + this.props.managedFarmData.reward_token_name})}</span>
                                <span className="icon-Icon11"/>                                
                              </a>
                          </div>
                        }
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

const WStakeModal = connect(mapStoreToProps(components.FARMS), mapDispatchToProps(components.FARMS))(withTranslation()(StakeModal));

export default WStakeModal;