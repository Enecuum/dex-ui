import React from "react"
import {connect} from "react-redux"
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps"
import {withTranslation} from "react-i18next"

import Tooltip from "../elements/Tooltip"

import swapUtils from "../utils/swapUtils"
import ValueProcessor from "../utils/ValueProcessor"

const vp = new ValueProcessor()


class SwapAddon extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            show : false
        }
    }

    countPriceImpact (pair) {
        let data = this.props.exchange, fieldNum = (pair.token_0.hash === data.field0.token.hash) ? [0, 1] : [1, 0]
        let firstData = data["field" + fieldNum[0]]
        let secondData = data["field" + fieldNum[1]]

        let vol0 = {
            value : pair.token_0.volume,
            decimals : firstData.token.decimals
        }, vol1 = {
            value : pair.token_1.volume,
            decimals : secondData.token.decimals
        }

        let exchangeRate = vp.div(vol0, vol1)
        let pricePaidPerSwappedToken
        if (pair.token_0.hash === data.field0.token.hash)
            pricePaidPerSwappedToken = vp.div(data.field0.value, data.field1.value)
        else
            pricePaidPerSwappedToken = vp.div(data.field1.value, data.field0.value)
        let priceImpact = vp.div(vp.sub(pricePaidPerSwappedToken, exchangeRate), exchangeRate)
        return vp.mul(priceImpact, {value : 100, decimals : 0})
    }

    showPriceImpact (pair) {
        let priceImpact = this.countPriceImpact(pair)
        if (!Object.keys(priceImpact).length)
            return '< 0.001 '
        let res = vp.usCommasBigIntDecimals(priceImpact.value, priceImpact.decimals)
        let numFloat = Number.parseFloat(res.replace(',', ''))
        if (numFloat > 100)
            return '100 '
        else if (numFloat < 0.001)
            return '< 0.001 '
        else
            return res
    }

    render () {
        let data = this.props.exchange
        let pair = swapUtils.searchSwap(this.props.pairs, [data.field0.token, data.field1.token])
        if (!swapUtils.pairExists(pair))
            return (<></>)

        let provider = this.props.exchange.field0.token
        let t = this.props.t
        return (
            <div className="general-card p-4">
                {/*<div className="d-block d-md-flex align-items-center justify-content-between py-2">*/}
                {/*    <div className="mr-3 d-flex align-items-center">*/}
                {/*        <span className="mr-2">Mininmum received</span>*/}
                {/*        <Tooltip text='Mininmum received tooltip text' />*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        0.0009968 BRY*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">{t('trade.swapAddon.priceImpact')}</span>
                        <Tooltip text='The difference between the mid-price and the execution price of a trade' />
                    </div>
                    <div>
                        <span className="text-color3">{this.showPriceImpact(pair)}%</span>
                    </div>
                </div>
                <div className="d-block d-md-flex align-items-center justify-content-between py-2">
                    <div className="mr-3 d-flex align-items-center">
                        <span className="mr-2">{t('trade.swapAddon.providerFee')}</span>
                        <Tooltip text='Liquidity provider fee tooltip text' />
                    </div>
                    <div>
                        {vp.usCommasBigIntDecimals(pair.pool_fee, provider.decimals)} {provider.ticker}
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