import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import presets from '../../store/pageDataPresets';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import utils from '../utils/swapUtils';
import Tooltip from '../elements/Tooltip';

import '../../css/token-card.css'
import '../../css/custom-toggle.css'

import LogoToken from "../elements/LogoToken"

import ValueProcessor from "../utils/ValueProcessor"
import swapUtils from "../utils/swapUtils"
const vp = new ValueProcessor()


class TokenCard extends React.Component {
    constructor(props) {
        super(props)
        this.tokenFilter = ''
        this.showTrustedTokens = false
        this.trustedTokens = []
        this.updTokens()
    }

    componentDidMount () {
        document.getElementById("token-filter-field").focus()
    }

    componentDidUpdate(prevProps) {
        if (this.props.tokens.length !== prevProps.tokens.length || this.props.net.url !== prevProps.net.url)
            this.updTokens()
    }

    updTokens() {
        this.props.assignTokenList(this.makeList())
    }

    getTokens (searchWord) {
        let word = searchWord.trim().toLowerCase()
        let regExpWord = new RegExp(`.*${word}.*`)
        return this.props.tokens.filter(token => regExpWord.test(token.ticker.toLowerCase()) || word === token.hash)
    }

    raiseUpTrustedTokens (tokens) {
        if (this.props.networkInfo.native_token) {
            let trustedTokensList = []
            for (let i = 0; i < tokens.length; i++)
                if (this.isTrustedToken(tokens[i].hash)) {
                    trustedTokensList.push(tokens[i])
                    tokens.splice(i, 1)
                    i--
                }
            tokens = trustedTokensList.concat(tokens)
        }
        return tokens
    }

    setTrustedTokens () {
        let trustedTokens = []
        if (this.props.networkInfo.native_token)
            trustedTokens = [this.props.networkInfo.native_token.hash]
        if (this.props.networkInfo.dex && this.props.networkInfo.dex.DEX_TRUSTED_TOKENS)
            trustedTokens = trustedTokens.concat(this.props.networkInfo.dex.DEX_TRUSTED_TOKENS)
        this.trustedTokens = trustedTokens
    }

    isTrustedToken (hash) {
        return this.trustedTokens.indexOf(hash) !== -1
    }

    assignToken(token) {
        let mode = this.props.getMode();
        let modeAlias = presets.paths[mode];
        if (this.props.activeField === 'field0' && this.props[mode].field1.token.hash !== undefined) {
            window.location.hash = '#!action=' + modeAlias + '&pair=' + token.ticker + '-' + this.props[mode].field1.token.ticker + '&from=' + token.hash + '&to=' +  this.props[mode].field1.token.hash;
        } else if (this.props.activeField === 'field1' && this.props[mode].field0.token.hash !== undefined) {
            window.location.hash = '#!action=' + modeAlias + '&pair=' + this.props[mode].field0.token.ticker + '-' + token.ticker + '&from=' + this.props[mode].field0.token.hash + '&to=' +  token.hash;
        }

        let tokenObj = utils.getTokenObj(this.props.tokens, token.hash)
        this.props.assignTokenValue(this.props.getMode(), this.props.activeField, tokenObj)
        this.props.closeTokenList(tokenObj, this.props.activeField)
        this.props.changeBalance(this.props.activeField, token.hash)
    };

    toggleSortList() {
        let sortOrder = 'unsort';
        if (this.props.sort === 'unsort' || this.props.sort === 'desc')
            sortOrder = 'asc';       
        else if (this.props.sort === 'asc')
            sortOrder = 'desc';        
        else
            sortOrder = 'asc';
        this.props.changeSort(sortOrder);
        this.props.assignTokenList(this.makeList(this.props.sort));
    }

    comparator(sortDirection) {
        let allowedSortDirections = ['asc','desc','unsort'];
        let defaultComparator = function(a,b) {
                                return 0; //default return value (no sorting)
                            }
        if (sortDirection === undefined || allowedSortDirections.indexOf(sortDirection) !== -1) {
            if (sortDirection === 'asc') {
                return function(a,b) {
                    var nameA=a.ticker.toLowerCase(), nameB=b.ticker.toLowerCase();
                    if (nameA < nameB) //sortDirection string ascending
                    return -1;
                    if (nameA > nameB)
                    return 1;
                    return 0; //default return value (no sorting)
                }
            } else if (sortDirection === 'desc') {
                return function(a,b) {
                    var nameA=a.ticker.toLowerCase(), nameB=b.ticker.toLowerCase();
                    if (nameA < nameB) //sortDirection string descending
                    return 1;
                    if (nameA > nameB)
                    return -1;
                    return 0; //default return value (no sorting)
                }
            } else if (sortDirection === 'unsort') {
                return defaultComparator;
            }
        } else {
            console.log('Such sortDirection is not allowed. Sort by default direction - "unsort"')
            return defaultComparator;
        }
    }

    getTokenBalance (hash) {
        let balance = swapUtils.getBalanceObj(this.props.balances, hash)
        return swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(balance.amount, balance.decimals))
    }

    makeList(sortDirection = 'asc') { //allowable values are: 'asc','desc','unsort'
        this.setTrustedTokens()
        let sorted = this.getTokens(this.tokenFilter).sort(this.comparator(sortDirection))
        if (this.showTrustedTokens)
            sorted = this.raiseUpTrustedTokens(sorted)
        return sorted.map((el, i) => {
            return (
                <div>
                    <div onClick={this.assignToken.bind(this, el)} className="d-flex justify-content-between hover-pointer token-option">
                        <LogoToken customClasses='py-1 my-1 px-1'
                                   data = {{
                                       url : el.logo,
                                       value : el.ticker,
                                       hash : el.hash,
                                       net : this.props.net,
                                       trustedToken : this.trustedTokens.indexOf(el.hash) !== -1
                                   }}
                                   key={i}
                        />
                        <small className="mr-2 mt-3 text-muted">
                            {this.getTokenBalance(el.hash)}
                        </small>
                    </div>
                </div>
            )
        })
    }

    changeList() {
        if (['insertText', 'deleteContentBackward', 'deleteContentForward', 'deleteWordBackward', 'deleteWordForward'].indexOf(event.inputType) !== -1) {
            this.tokenFilter = document.getElementById('token-filter-field').value;
            this.props.assignTokenList(this.makeList())
        }
    }

    closeTokenList (tokenObj, activeField) {
        this.props.closeTokenList(tokenObj, activeField)
    }

    updTrustedTokenFlag (value) {
        if (value === true)
            document.getElementById("tokensList").scrollTo(0, 0)
        this.showTrustedTokens = value
        this.updTokens()
    }

    render() {
        const t = this.props.t
        return (
            <>
              <Modal
                show={true}
                aria-labelledby="example-custom-modal-styling-title"
                onHide={this.closeTokenList.bind(this)}
                centered
                animation={false}
              >
                <Modal.Header closeButton className="pb-0">
                  <Modal.Title id="example-custom-modal-styling-title">
                    <div className="d-flex align-items-center justify-content-start">
                        <span className="mr-3">
                            {t('trade.tokenCard.header')}
                        </span>
                        <Tooltip text={t('trade.tokenCard.tooltipText')}/>
                    </div>
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                        <Form.Control
                            id='token-filter-field'
                            onChange={this.changeList.bind(this)}
                            className='text-input-1 form-control shadow-none'
                            type='text'
                            placeholder={t('trade.tokenCard.search')}
                            autoFocus/>
                    </div>

                    <div className="row">
                        <div className="col d-flex align-items-center">
                            <input  type="checkbox"
                                    className="c-toggle mx-1"
                                    onClick={e => this.updTrustedTokenFlag(e.target.checked)}
                            />
                            <div className="col text mb-0 ml-1"> show trusted tokens</div>
                        </div>
                        {/*<span className={`icon-Icon15 swap-card-top-items mr-3`}/>*/}
                    </div>

                    <hr/>

                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <span>{t('trade.tokenCard.tokenName')}</span>
                        <span className="sort-direction-toggler" onClick={this.toggleSortList.bind(this)}>
                            <i className={'fas ' + 'fa-arrow-' + (this.props.sort === 'desc' ? 'up' : 'down') + ' hover-pointer'}/>
                        </span>
                    </div>

                    <div id="tokensList">
                        { this.props.list }
                    </div>
                </Modal.Body>
              </Modal>
            </>
        )
    }
}

const WTokenCard = connect(
    mapStoreToProps(components.TOKEN_CARD),
    mapDispatchToProps(components.TOKEN_CARD)
)(withTranslation()(TokenCard))

export default WTokenCard