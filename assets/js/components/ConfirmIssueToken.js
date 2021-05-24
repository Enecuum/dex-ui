import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";

import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';

import '../../css/confirm-supply.css';

const valueProcessor = new ValueProcessor();

class ConfirmIssueToken extends React.Component {
    constructor(props) {
        super(props);
        this.tokenTypesTitles = {
            'type_0' : 'etm.nonReissuable',
            'type_1' : 'etm.reissuable',
            'type_2' : 'etm.mineable',
        }        

        this.tokenFeeTypesTitles = {
            'type_0' : 'etm.nonReissuable',
            'type_1' : 'etm.reissuable'
        }
    }

    closeCard () {
        console.log('dsfsdfsdfsdfsdfsdfsdsdf')
        this.props.closeConfirmCard();
    };

    sendIssueTokenTx() {
        this.issueTokenRequest();
        console.log('отправка транзакции')
    }
    // issueToken (pubKey, issueTokenCost, params)

   issueTokenRequest() {
        // this.props.openWaitingConfirmation();
        let parameters = {
                reissuable : parseInt(this.props.tokenData.reissuable),
                minable : parseInt(this.props.tokenData.mineable),
                fee_type : parseInt(this.props.tokenData.fee_type),
                fee_value : this.props.tokenBigIntData.fee_value.completeValue,
                fee_min: this.props.tokenData.fee_type === '1' ? this.props.tokenBigIntData.min_fee_for_percent_fee_type : this.props.tokenBigIntData.fee_value.completeValue,
                decimals : BigInt(this.props.tokenData.decimals),
                total_supply : this.props.tokenBigIntData.total_supply.completeValue,
                ticker : this.props.tokenData.ticker,
                name: this.props.tokenData.name
            }

        if (this.props.tokenData.mineable === '1') {
            let mineableTokenAdditionalPrams = ['max_supply','block_reward', 'min_stake', 'referrer_stake', 'ref_share'];
            let that = this;
            mineableTokenAdditionalPrams.forEach(function(param) {                
                parameters[param] = that.props.tokenBigIntData[param].completeValue;
            });
        }
        console.log(this.props.issueTokenTxAmount)

        extRequests.issueToken(this.props.pubkey, this.props.issueTokenTxAmount, parameters)
        .then(result => {
            console.log('Success', result.hash)
            // this.props.updCurrentTxHash(result.hash);
            // this.props.changeWaitingStateType('submitted');
        },
        error => {
            console.log('Error')
            // this.props.changeWaitingStateType('rejected');
        }); 

        // let tokenInfoRequest = swapApi.getTokenInfo(this.props.mainToken);
        // tokenInfoRequest.then(result => {
        //     if (!result.lock) {
        //         result.json().then(mainToken => {
        //             let mainTokenFee = BigInt(mainToken[0].fee_value);
        //             this.issueTokenTxAmount = BigInt(this.props.issueTokenCost) + BigInt(mainTokenFee);
        //             console.log(this.issueTokenTxAmount)
        //             this.mainTokenTicker = mainToken[0].ticker;
        //             extRequests.issueToken(this.props.pubkey, issueTokenTxAmount, parameters)
        //             .then(result => {
        //                 console.log('Success', result.hash)
        //                 // this.props.updCurrentTxHash(result.hash);
        //                 // this.props.changeWaitingStateType('submitted');
        //             },
        //             error => {
        //                 console.log('Error')
        //                 // this.props.changeWaitingStateType('rejected');
        //             });                                   
        //         })
        //     }
        // })
    };



//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!            
// BigInt($scope.mainToken.fee_value) + BigInt(contract_pricelist.create_token);



    // sendTransaction (pair) {
    //     this.closeCard();
    //     this.props.openWaitingConfirmation();
    //     let tx;
    //     if (utils.pairExists(pair)) {
    //         if (this.props.menuItem == 'exchange') {
    //             tx = extRequests.swap(this.props.pubkey, this.props.exchange);
    //         } else if (this.props.menuItem == 'liquidity') {
    //             tx = extRequests.addLiquidity(this.props.pubkey, this.props.liquidity);
    //         }
    //     } else {
    //         tx = extRequests.createPool(this.props.pubkey, this.props[this.props.menuItem]);
    //     }
    //     tx.then(result => {
    //         console.log(result);
    //         this.props.updCurrentTxHash(result.hash);
    //         this.props.changeWaitingStateType('submitted');
    //     },
    //     error => {
    //         this.props.changeWaitingStateType('rejected');
    //     });
    // };

    getBigIntValue (num) { 
        if (num && num !== Infinity) 
            return valueProcessor.valueToBigInt(num.toFixed(10)).value;
    };

    render() {
        const t = this.props.t;        
        //console.log(this.props.dataValid, this.props.possibleToIssueToken)
        return (

            <>
                <Modal
                    show={this.props.possibleToIssueToken}////////////////////////////////////////////////////
                    aria-labelledby="example-custom-modal-styling-title"
                    onHide={this.closeCard.bind(this)}/////////////////////////////////////////////////////
                    centered >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    {t('etm.issueToken')}
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>{t('etm.ticker')}</h5>
                        <p>{this.props.tokenData.ticker}</p>

                        <h5>{t('etm.name')}</h5>
                        <p>{this.props.tokenData.name}</p>

                        <h5>{t('etm.tokenType')}</h5>
                        <p>{t(this.tokenTypesTitles['type_' + this.props.tokenData.token_type])}</p>

                        <h5>{t('etm.decimals')}</h5>
                        <p>{this.props.tokenData.decimals}</p>


                        <h5>{this.props.tokenData.token_type === '2' ? t('etm.premine') : t('etm.emission')}</h5>
                        <p>{this.props.tokenData.total_supply}</p>

                        { (this.props.tokenData.mineable == "1") &&
                            <div>
                                <h5>{t('etm.maxSupply')}</h5>
                                <p>{this.props.tokenData.max_supply}</p>

                                <h5>{t('etm.blockReward')}</h5>
                                <p>{this.props.tokenData.block_reward}</p>

                                <h5>{t('etm.minStake')}</h5>
                                <p>{this.props.tokenData.min_stake}</p>

                                <h5>{t('etm.referrerStake')}</h5>
                                <p>{this.props.tokenData.referrer_stake}</p>

                                <h5>{t('etm.refShare')}</h5>
                                <p>{this.props.tokenData.ref_share}%</p>
                            </div>
                        }

                        <h5>{t('etm.feeType')}</h5>
                        <p>{t(this.tokenFeeTypesTitles['type_' + this.props.tokenData.fee_type])}</p>

                        <h5>{t('etm.fee')}</h5>
                        <p>{this.props.tokenData.fee_value} <span>{this.props.tokenData.fee_type === '0' ? this.props.tokenData.ticker : '%'}</span></p>

                        { (this.props.tokenData.fee_type == "1") &&
                            <div>
                                <h5>{t('etm.minFee')}</h5>
                                <p>{this.props.tokenData.min_fee_for_percent_fee_type} {this.props.tokenData.ticker}</p>
                            </div>
                        }
                        
                        <p className="h4 mt-5 mb-5">TOKEN_ISSUE_TOTAL_PAY: {this.props.issueTokenTxAmount} {this.props.mainTokenTicker}</p>                                                                                                       

                        <Button className='btn-secondary confirm-supply-button w-100'
                                onClick={this.sendIssueTokenTx.bind(this)}>
                            {t('trade.confirmCard.confirm')}
                        </Button>
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

const WConfirmIssueToken = connect(mapStoreToProps(components.CONFIRM_ISSUE_TOKEN), mapDispatchToProps(components.CONFIRM_ISSUE_TOKEN))(withTranslation()(ConfirmIssueToken));

export default WConfirmIssueToken;