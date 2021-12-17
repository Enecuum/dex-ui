import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';
import SpaceStationValidationRules from '../utils/spaceStationValidationRules/SpaceStationValidationRules';
import Validator from  '../utils/Validator';

import '../../css/confirm-supply.css';
import lsdp from "../utils/localStorageDataProcessor";

const valueProcessor = new ValueProcessor();

class DistributeModal extends React.Component {
    constructor(props) {
      super(props);
      this.valueProcessor = new ValueProcessor;
    }

    getLinkToPair() {
      if (this.props.managedPoolData !== null) {
        let data = this.props.managedPoolData;
        return "/#!action=pool&pair=" + data.ticker_LP + "-" + data.ticker_ENX + '&from=' + data.asset_LP + "&to=" + data.asset_ENX;
      } 
    }
    
    closeModal () {
        this.props.updShowDistributeModal({
            value : false
        });
        this.props.updateManagedPool({
          value : null
        });        
    };

    getContent() {
      const t = this.props.t;
      
      let lpAmount = valueProcessor.usCommasBigIntDecimals(this.props.managedPool.LPTokenOnCommanderBalance.amount, this.props.managedPool.LPTokenOnCommanderBalance.decimals, this.props.managedPool.LPTokenOnCommanderBalance.decimals);
      let lpTicker = this.props.managedPool.ticker_LP;
      let enxTicker = this.props.managedPool.ticker_ENX;
      let operationCost = BigInt(this.props.mainTokenFee) + BigInt(this.props.pricelist.dex_cmd_distribute);
      let operationCostPrettyView = `${valueProcessor.usCommasBigIntDecimals(operationCost, this.props.mainTokenDecimals, this.props.mainTokenDecimals)} ${this.props.networkInfo.native_token.ticker}`;
      let enxOut = `${valueProcessor.usCommasBigIntDecimals(this.props.managedPool.distributeResult.enxOut.value, this.props.managedPool.distributeResult.enxOut.decimals, this.props.managedPool.decimals_ENX)}`;

      return (
        <>
          <div className="stake-input-area px-3 py-3 mb-4">
            <div className="mb-4">
              <div>Trade <span className="text-color3">{lpAmount}</span> <span className="text-color4">{lpTicker}</span> for <span className="text-color4">{enxTicker}</span> in a <span className="text-color4">{`${lpTicker}-${enxTicker}`}</span> pool.</div>
              <div><span className="text-color3">{enxOut}</span>  <span className="text-color4">{enxTicker}</span> will be added to Space Station rewards proportionally to stakers shares.</div>
            </div>
            <div>
              Operation cost: {operationCostPrettyView}
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-4">
            <Button className='btn-secondary confirm-supply-button w-100 mr-2'
               onHide={this.closeModal.bind(this)}>
                {t('cancel')}
            </Button>
            <Button className='btn-secondary confirm-supply-button w-100 ml-2'
              onClick={this.distribute.bind(this, this.props.managedPool.asset_LP, operationCost, enxOut, enxTicker)}>
                {t('confirm')}
            </Button>                        
          </div>
        </>
      )  
    }

    distribute(LPTokenHash, cost, enxOut, enxTicker) {
      extRequests.dexCmdDistribute(this.props.pubkey, cost, {token_hash : LPTokenHash}).then(result => {
          console.log('Success', result.hash);
          lsdp.write(result.hash, 0, 'dex_cmd_distribute', {value: enxOut, ticker: enxTicker})
          this.closeModal();
      },
      error => {
          console.log(error, 'Error')
          //this.props.changeWaitingStateType('rejected');
      });         
    }

    getErrMsg() {
      return (
        <>
          <div className="h1">
            ERROR
          </div>
        </>
      )    
    }

    getWaiting() {
      console.log('Waiting')
      return (
        <>
          <div className="h1">
            Waiting
          </div>
        </>
      )    
    }

    getDistributeDataSet() {
      let dataset = {
        poolData         : this.props.managedPool,
        distributeCost   : this.props.mainTokenFee !== undefined && this.props.pricelist.dex_cmd_distribute !== undefined ? BigInt(this.props.mainTokenFee) + BigInt(this.props.pricelist.dex_cmd_distribute) : undefined,
        mainTokenBalance : {
          mainTokenAmount   : this.props.mainTokenAmount !== undefined ? this.props.mainTokenAmount : 0,
          mainTokenDecimals : this.props.mainTokenDecimals !== undefined ? this.props.mainTokenDecimals : 0,        
          mainTokenTicker   : this.props.networkInfo.native_token !== undefined ? this.props.networkInfo.native_token.ticker : ''
        }
      }
      return dataset            
    }

    showDistributeResume() {
      if (this.props.showDistributeModal) {
        let validationRules = new SpaceStationValidationRules(this.props.t);
        let amountOfRules = validationRules.amountOfRules;
        let dataset = this.getDistributeDataSet();
        
        let validator = new Validator;
        let validatonResult = undefined;
        let dataValid = true;
        for (let step = 0; step < (amountOfRules); step++) {
          if (dataValid) {
            if (step <= 3) {
              let arg = dataset.poolData;
              let currentRule = validationRules[`getValidationRulesStep_${step}`](arg);
              validatonResult = validator.batchValidate(arg, currentRule);
            } else {
              let arg_1 = dataset.mainTokenBalance;
              let arg_2 = dataset.distributeCost;
              let currentRule = validationRules[`getValidationRulesStep_${step}`](arg_1, arg_2);
              validatonResult = validator.batchValidate(arg_1, currentRule);          
            }            
          }
          
          if (validatonResult.dataValid === false) {
            dataValid = false;            
          }      
        }

        if (validatonResult === undefined) {
          return this.getWaiting()
        } else if (dataValid) {
          return this.getContent();
        } else if (dataValid === false) {
          return this.getErrMsg()
        }
      }
    }

    switchToPool() {          
      this.closeModal();       
      this.props.changeMenuItem('pool');      
    }

    render() {
        const t = this.props.t;
        
        return (

            <>
                <Modal
                    show={this.props.showDistributeModal}
                    aria-labelledby="example-custom-modal-styling-title"
                    onHide={this.closeModal.bind(this)}
                    centered 
                    animation={false}>
                    <Modal.Header closeButton className="mb-0 pb-0">
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    Distribute
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.showDistributeResume()}
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

const WDistributeModal = connect(mapStoreToProps(components.SPACE_STATION), mapDispatchToProps(components.SPACE_STATION))(withTranslation()(DistributeModal));

export default WDistributeModal;