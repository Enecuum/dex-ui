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
        percent = vp.sub(vp.valueToBigInt(1), percent)
        let minimumReceived = vp.mul(this.props.exchange.field1.value, percent)
        minimumReceived = vp.usCommasBigIntDecimals(minimumReceived.value, minimumReceived.decimals)
        let providerFee = swapUtils.countProviderFee(pair.pool_fee, this.props.exchange.field0.value)
        return (
            <div className="general-card p-4">
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">{t('trade.swapAddon.minimumReceived.header')}</span>
                        <Tooltip text={t('trade.swapAddon.minimumReceived.tooltip')} />
                    </div>
                    <div>
                        {swapUtils.removeEndZeros(minimumReceived ? minimumReceived : "0.0")} {received.ticker}
                    </div>
                </div>
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">{t('trade.swapAddon.priceImpact.header')}</span>
                        <Tooltip text={t('trade.swapAddon.priceImpact.tooltip')} />
                    </div>
                    <div>
                        <span className="text-color3">{this.showPriceImpact(pair)}%</span>
                    </div>
                </div>
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">{t('trade.swapAddon.providerFee.header')}</span>
                        <Tooltip text={t('trade.swapAddon.providerFee.tooltip')} />
                    </div>
                    <div>
                        {swapUtils.removeEndZeros(providerFee ? providerFee : "0.0")} {provider.ticker}
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