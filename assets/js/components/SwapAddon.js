import React from "react"
import {connect} from "react-redux"
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps"
import {withTranslation} from "react-i18next"

import Tooltip from "../elements/Tooltip"

import swapUtils from "../utils/swapUtils"
import ValueProcessor from "../utils/ValueProcessor"
import testFormulas from "../utils/testFormulas"
import lsdp from "../utils/localStorageDataProcessor";

const vp = new ValueProcessor()


class SwapAddon extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            show : false
        }
    }

    countPriceImpact (pair) {
        let data = this.props.exchange
        let amountIn = {
            value : data.field0.value.value,
            decimals : data.field0.value.decimals,
            token : data.field0.token
        }, amountOut = {
            value : data.field1.value.value,
            decimals : data.field1.value.decimals,
            token : data.field1.token
        }
        return testFormulas.countPriceImpact(pair, amountIn, amountOut, this.props.tokens)
    }

    showPriceImpact (pair) {
        let priceImpact = this.countPriceImpact(pair)
        if (priceImpact.decimals - String(priceImpact.value).length > 2 || !Object.keys(priceImpact).length)
            return  "< 0.001"
        try {
            return vp.usCommasBigIntDecimals(priceImpact.value, priceImpact.decimals)
        } catch (e) {
            return ""
        }
    }

    showValues (value) {
        if (typeof value === "object" || typeof value === "string" && value.search("-") === -1)
            return value
        return "---"
    }

    render () {
        let data = this.props.exchange
        let pair = swapUtils.searchSwap(this.props.pairs, [data.field0.token, data.field1.token])
        if (!swapUtils.pairExists(pair))
            return (<></>)

        let t = this.props.t
        let provider = this.props.exchange.field0.token
        let received = this.props.exchange.field1.token

        let percent = vp.valueToBigInt(lsdp.simple.get("ENEXUserSlippage"), 8)
        percent.decimals += 2

        let minimumReceived, minimumReceivedUSD, maximumSent, maximumSentUSD, providerFeeUSD
        if (lsdp.simple.get("ENEXSwapCalcDirection", true) === "down") {
            percent = vp.sub(vp.valueToBigInt(1), percent)
            minimumReceived = vp.mul(this.props.exchange.field1.value, percent)
            minimumReceivedUSD = swapUtils.countUSDPrice(minimumReceived, this.props.exchange.field1.token)
            minimumReceived = vp.usCommasBigIntDecimals(minimumReceived.value, minimumReceived.decimals)
        } else {
            maximumSent = vp.mul(this.props.exchange.field0.value, percent)
            maximumSent = vp.add(this.props.exchange.field0.value, maximumSent)
            maximumSentUSD = swapUtils.countUSDPrice(maximumSent, this.props.exchange.field0.token)
            maximumSent = vp.usCommasBigIntDecimals(maximumSent.value, maximumSent.decimals)
        }
        let providerFee = swapUtils.countProviderFee(pair.pool_fee, this.props.exchange.field0.value)

        try {
            providerFeeUSD = swapUtils.countUSDPrice(providerFee, this.props.exchange.field0.token)
            providerFee = swapUtils.removeEndZeros(vp.usCommasBigIntDecimals(providerFee.value, providerFee.decimals))
        } catch (e) {
            providerFee = "0.0"
            providerFeeUSD = "0$"
        }

        return (
            <div className="general-card p-4">
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        {lsdp.simple.get("ENEXSwapCalcDirection", true) === "down" &&
                            <span className="mr-2">{t('trade.swapAddon.minimumReceived.header')}</span> ||
                            <span className="mr-2">{t('trade.swapAddon.maximumSent.header')}</span>
                        }
                        <Tooltip text={t('trade.swapAddon.minimumReceived.tooltip')} />
                    </div>
                    <div>
                        {lsdp.simple.get("ENEXSwapCalcDirection", true) === "down" &&
                            <>
                                <div className={"d-flex justify-content-end"}>
                                    {this.showValues(swapUtils.removeEndZeros(minimumReceived ? minimumReceived : "0.0"))} {received.ticker}
                                </div>
                                <small className={"d-flex justify-content-end usd-price"}>
                                    {this.showValues(swapUtils.showUSDPrice(minimumReceivedUSD))}
                                </small>
                            </>
                                ||
                            <>
                                <div className={"d-flex justify-content-end"}>
                                    {this.showValues(swapUtils.removeEndZeros(maximumSent ? maximumSent : "0.0"))} {provider.ticker}
                                </div>
                                <small className={"d-flex justify-content-end usd-price"}>
                                    {this.showValues(swapUtils.showUSDPrice(maximumSentUSD))}
                                </small>
                            </>
                        }
                    </div>
                </div>
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">{t('trade.swapAddon.priceImpact.header')}</span>
                        <Tooltip text={t('trade.swapAddon.priceImpact.tooltip')} />
                    </div>
                    <div>
                        <span className="text-color3">{ (minimumReceived && minimumReceived.search("-") === -1 || maximumSent && maximumSent.search("-") === -1) &&
                            this.showValues(this.showPriceImpact(pair)) || 0
                        }%</span>
                    </div>
                </div>
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">{t('trade.swapAddon.providerFee.header')}</span>
                        <Tooltip text={t('trade.swapAddon.providerFee.tooltip')} />
                    </div>
                    <div>
                        <div className={"d-flex justify-content-end"}>
                            {this.showValues(providerFee)} {provider.ticker}
                        </div>
                        <small className={"d-flex justify-content-end usd-price"}>
                            {this.showValues(swapUtils.showUSDPrice(providerFeeUSD))}
                        </small>
                    </div>
                </div>
            </div>
        )
    }
}


const WSwapAddon = connect(
    mapStoreToProps(components.SWAP_ADDON),
    mapDispatchToProps(components.SWAP_ADDON)
)(withTranslation()(SwapAddon))

export default WSwapAddon