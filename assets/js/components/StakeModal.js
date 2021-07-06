import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';

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

   //  sendIssueTokenTx() {
   //      this.props.openWaitingConfirmation();
   //      this.issueTokenRequest();
   //      this.props.updatePossibleToIssueToken({
   //          value : false
   //      });
   //  }

   // issueTokenRequest() {
   //      let parameters = {
   //              reissuable : parseInt(this.props.tokenData.reissuable),
   //              minable : parseInt(this.props.tokenData.mineable),
   //              fee_type : parseInt(this.props.tokenData.fee_type),
   //              fee_value : this.props.tokenBigIntData.fee_value.completeValue,
   //              fee_min: this.props.tokenData.fee_type === '1' ? this.props.tokenBigIntData.min_fee_for_percent_fee_type : this.props.tokenBigIntData.fee_value.completeValue,
   //              decimals : BigInt(this.props.tokenData.decimals),
   //              total_supply : this.props.tokenBigIntData.total_supply.completeValue,
   //              ticker : this.props.tokenData.ticker,
   //              name: this.props.tokenData.name
   //          }

   //      if (this.props.tokenData.mineable === '1') {
   //          let mineableTokenAdditionalPrams = ['max_supply','block_reward', 'min_stake', 'referrer_stake', 'ref_share'];
   //          let that = this;
   //          mineableTokenAdditionalPrams.forEach(function(param) {                
   //              parameters[param] = that.props.tokenBigIntData[param].completeValue;
   //          });
   //      }

   //      extRequests.issueToken(this.props.pubkey, this.props.issueTokenTxAmount, parameters)
   //      .then(result => {
   //          console.log('Success', result.hash)
   //          this.props.updCurrentTxHash(result.hash);
   //          this.props.changeWaitingStateType('submitted');
   //          this.props.resetStore();
   //      },
   //      error => {
   //          console.log('Error')
   //          this.props.changeWaitingStateType('rejected');
   //      });
   //  };

    // getBigIntValue (num) { 
    //     if (num && num !== Infinity) 
    //         return valueProcessor.valueToBigInt(num.toFixed(10)).value;
    // };

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
                                    <div>0.176</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>0</div>
                                <div className="d-flex flex-nowrap">
                                    <div className="mr-2 set-max text-color3 hover-pointer">{t('max')}</div>
                                    <div>CAKE-BNB LP</div>
                                </div>
                            </div>                                                         
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            {this.modifyStakeRanges.ranges.map((item, index) => (
                                <button key={index+''} className="btn btn-secondary px-3 py-1 text-color4" >{item.alias}</button>
                            ))}
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <Button className='btn-secondary confirm-supply-button w-100 mr-2'
                                    onClick={this.sendIssueTokenTx.bind(this)}>
                                {t('cancel')}
                            </Button>
                            <Button className='btn-secondary confirm-supply-button w-100 ml-2'
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