import React from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import presets from '../../store/pageDataPresets';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import utils from '../utils/swapUtils';
import Tooltip from '../elements/Tooltip';
import { FixedSizeList } from "react-window"

import '../../css/token-card.css'
import '../../css/custom-toggle.css'

import {LogoToken, LogoTokenLP, LogoTokenTrusted} from "../elements/LogoToken"
import TokenCardSettings from "./TokenCardSettings"
import ModalMultiTab from "../elements/ModalMultiTab"

import ValueProcessor from "../utils/ValueProcessor"
import swapUtils from "../utils/swapUtils"
import lsdp from "../utils/localStorageDataProcessor"

const vp = new ValueProcessor()

import {initSettings, settings} from "../utils/tokensSettings"
import enqLogo from "../../img/ENEXlogo.png";
import _ from 'lodash'


class TokenCardBridge extends React.Component  {
    constructor(props) {
        super(props)
        this.tokenFilter = ''
        this.trustedTokens = []
        // this.maxTokensForRender = 500
        this.updTokens()

        this.state = {
            tabsPointer : "main"
        }
    }

    componentDidMount () {
        // let tokenListEl = document.getElementById("tokensList")
        // this.maxScroll = tokenListEl.scrollHeight - tokenListEl.offsetHeight
        // this.updateBoundary = this.maxScroll - 200
        document.getElementById("token-filter-field").focus()
    }

    componentDidUpdate(prevProps) {
        if (this.props.tokens.length !== prevProps.tokens.length || this.props.net.url !== prevProps.net.url)
            this.updTokens()
    }

    updTokens() {
        this.props.assignTokenList(this.makeList(this.props.sort))
    }

    getTokens (searchWord) {
        let word = searchWord.trim().toLowerCase()
        let regExpWord = new RegExp(`.*${word}.*`)
        return this.props.tokens.filter(token => regExpWord.test(token.ticker.toLowerCase()) || word === token.hash)
    }

    setTrustedTokens () {
        let trustedTokens = []
        if (this.props.networkInfo.native_token)
            trustedTokens = [this.props.networkInfo.native_token.hash]
        if (this.props.networkInfo.dex && this.props.networkInfo.dex.DEX_TRUSTED_TOKENS)
            trustedTokens = trustedTokens.concat(this.props.networkInfo.dex.DEX_TRUSTED_TOKENS)
        this.trustedTokens = trustedTokens
    }

    getCField (activeField) {
        const fields = ["field0", "field1"]
        return fields[(fields.indexOf(activeField) + 1) % 2]
    }

    assignToken(token) {
        console.log(token)
        this.props.updateSrcTokenObj(token);
        this.props.updateShowTokenList(false);
        console.log(this.props.balances)
        if (this.props.balances.length > 0) {
            let balance = this.props.balances.find(function(elem) {
                return elem.token === token.hash
            });

            if (balance !== undefined)
                this.props.updateSrcTokenBalance(balance.amount);
        }
        // let mode = this.props.getMode()
        // let modeAlias = presets.paths[mode]
        // if (!modeAlias && mode === "removeLiquidity")
        //     modeAlias = "pool"

        // if (this.props.getMode() === "exchange" || this.props.getMode() === "liquidity") {
        //     let cField = this.getCField(this.props.activeField)
        //     if (this.props[mode][cField].token.hash === token.hash) {
        //         this.props.closeTokenList({}, this.props.activeField)
        //         this.props.swapPair()
        //         return
        //     }
        // }

        // if (this.props.activeField === 'field0' && this.props[mode].field1.token.hash !== undefined) {
        //     window.location.hash = '#!action=' + modeAlias + '&pair=' + token.ticker + '-' + this.props[mode].field1.token.ticker + '&from=' + token.hash + '&to=' +  this.props[mode].field1.token.hash;
        // } else if (this.props.activeField === 'field1' && this.props[mode].field0.token.hash !== undefined) {
        //     window.location.hash = '#!action=' + modeAlias + '&pair=' + this.props[mode].field0.token.ticker + '-' + token.ticker + '&from=' + this.props[mode].field0.token.hash + '&to=' +  token.hash;
        // }
        // this.props.recalculateSwapForNewToken(this.props.getMode(), this.props[mode][this.props.activeField].token.hash, this.props.activeField)
        // let tokenObj = utils.getTokenObj(this.props.tokens, token.hash)
        // this.props.assignTokenValue(this.props.getMode(), this.props.activeField, tokenObj)
        // this.props.closeTokenList(tokenObj, this.props.activeField)
        // this.props.changeBalance(this.props.activeField, token.hash)
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
        this.props.assignTokenList(this.makeList(sortOrder));
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

    isTrustedToken (hash) {
        return this.trustedTokens.indexOf(hash) !== -1
    }

    isLpToken (hash) {
        let res = swapUtils.searchByLt(this.props.pairs, hash)
        if (res === undefined)
            return false
        return res
    }

    isNonZeroToken (hash) {
        return swapUtils.getBalanceObj(this.props.balances, hash).amount != 0
    }

    checkSettings (token) {
        let result = false
        if (this.settings[settings.upBalances].toString() === "true")
            result ||= this.isNonZeroToken(token.hash)
        if (this.settings[settings.upTrustedTokens].toString() === "true")
            result ||= this.isTrustedToken(token.hash)
        if (this.settings[settings.upLpTokens].toString() === "true")
            result ||= this.isLpToken(token.hash)
        return result
    }

    traverseRules (tokens) {
        let raisedUpTokens = []
        this.settings = initSettings()
        for (let i = 0; i < tokens.length; i++)
            if (this.checkSettings(tokens[i])) {
                raisedUpTokens.push(tokens[i])
                tokens.splice(i, 1)
                i--
            }
        tokens = raisedUpTokens.concat(tokens)
        return tokens
    }



    makeList(sortDirection = 'asc') { //allowable values are: 'asc','desc','unsort'
        this.setTrustedTokens()
        let sorted = this.getTokens(this.tokenFilter).sort(this.comparator(sortDirection))
        sorted = this.traverseRules(sorted)
        return(
            <FixedSizeList
                innerElementType="ul"
                itemCount={sorted.length}
                itemSize={60}
                height={340}
                width={350}
            >
                {({ index, style }) => {
                    let el = sorted[index]
                    // if (index > this.maxTokensForRender)
                    //     return (<></>)
                    let logoData = {
                        url : el.logo,
                        value : el.ticker,
                        hash : el.hash,
                        net : this.props.net
                    }

                    let lpPair = this.isLpToken(el.hash), fToken, sToken
                    if (lpPair) {
                        fToken = swapUtils.getTokenObj(this.props.tokens, lpPair.token_0.hash)
                        sToken = swapUtils.getTokenObj(this.props.tokens, lpPair.token_1.hash)
                    }

                    let tBalance = swapUtils.getBalanceObj(this.props.balances, el.hash)

                    return (
                        <div style={style} key={index}>
                            <div onClick={this.assignToken.bind(this, el)} className="d-flex justify-content-between hover-pointer token-option">
                                {
                                    this.isTrustedToken(el.hash) && <LogoTokenTrusted customClasses='py-1 my-1 px-1' data = {logoData} /> ||
                                    lpPair && <LogoTokenLP customClasses='py-1 my-1 px-1'
                                                        data = {logoData}
                                                        fToken={fToken}
                                                        sToken={sToken}
                                    /> ||
                                    <LogoToken customClasses='py-1 my-1 px-1' data = {logoData} />
                                }
                                <div className={"ml-3 pt-2 text-muted"}>
                                    <small className="mr-2 justify-content-end row">
                                        {swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(tBalance.amount, tBalance.decimals))}
                                    </small>
                                    <small className="mr-2 usd-price justify-content-end row" style={{marginRight: "9px"}}>
                                        {(el.price_raw && el.price_raw.dex_price) && this.getUSDPrice(tBalance, el) || 0}$
                                    </small>
                                </div>
                            </div>
                        </div>
                    )
                }}
            </FixedSizeList>
        )
    }

    getUSDPrice (balance, tokenInfo) {
        balance.value = balance.amount
        return swapUtils.countUSDPrice(balance, tokenInfo)
    }

    changeList(value) {
        this.tokenFilter = value
        this.props.assignTokenList(this.makeList(this.props.sort))
    }

    closeTokenList (tokenObj, activeField) {
        this.props.closeTokenList(tokenObj, activeField)
    }

    renderTokenListHeader () {
        const t = this.props.t
        return (
            <div className="d-flex align-items-center justify-content-start">
                <span className="mr-3">
                    {t('trade.tokenCard.header')}
                </span>
                <Tooltip text={t('trade.tokenCard.tooltipText')}/>
            </div>
        )
    }

    renderTokenListBody () {
        const t = this.props.t
        return (
            <>
                <div className="row">
                    <div className="col">
                        <Form.Control
                            id='token-filter-field'
                            onChange={e => {
                                this.changeList(e.target.value)
                            }}
                            className='text-input-1 form-control shadow-none'
                            type='text'
                            placeholder={t('trade.tokenCard.search')}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-between my-4">
                    <div className="d-flex justify-content-start">
                        <span>{t('trade.tokenCard.tokenName')}</span>

                        <div className="d-flex align-items-center">
                            <span className={`icon-Icon15 ml-3 token-card-settings`}
                                  onClick={() => this.updTabsPointer("settings")}
                            />
                        </div>

                    </div>
                    <span className="sort-direction-toggler" onClick={this.toggleSortList.bind(this)}>
                        <i className={'fas ' + 'fa-arrow-' + (this.props.sort === 'desc' ? 'up' : 'down') + ' hover-pointer'}/>
                    </span>
                </div>

                <div id="tokensList"
                    //  onScroll={e => {
                    //     console.log(e.target.scrollTop, this.updateBoundary)
                    //     if (e.target.scrollTop > this.updateBoundary) {
                    //         this.maxTokensForRender += this.maxTokensForRender
                    //         this.updateBoundary += this.maxScroll
                    //         this.props.assignTokenList(this.makeList(this.props.sort))
                    //     }
                    // }}
                >
                    { this.props.list }
                </div>
            </>
        )
    }

    updateShowTokenList() {
        this.props.updateShowTokenList(false)
    }

    updTabsPointer (pointer) {
        if (pointer === "main")
            this.props.assignTokenList(this.makeList(this.props.sort))
        this.setState({tabsPointer : pointer})
    }

    getTabs () {
        return {
            main : {
                header : this.renderTokenListHeader(),
                body : this.renderTokenListBody()
            },
            settings : {
                header : "Settings",
                body : <TokenCardSettings />
            }
        }
    }

    render() {
        return (
            <>
                <ModalMultiTab tabs={this.getTabs()}
                               pointer={this.state.tabsPointer}
                               updPointer={this.updTabsPointer.bind(this)}
                               closeAction={this.updateShowTokenList.bind(this)}
                />
            </>
        )
    }
}

const WTokenCardBridge = connect(
    mapStoreToProps(components.TOKEN_CARD_BRIDGE),
    mapDispatchToProps(components.TOKEN_CARD_BRIDGE)
)(withTranslation()(TokenCardBridge))

export default WTokenCardBridge