import React from 'react';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import Card from 'react-bootstrap/Card';
import Tooltip from '../elements/Tooltip';
import Table from 'react-bootstrap/Table';
import {initSettings, settings} from "../utils/tokensSettings"
import ValueProcessor from '../utils/ValueProcessor';
import swapUtils from '../utils/swapUtils';
import testFormulas from '../utils/testFormulas';
import '../../css/top-pairs.css';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import PairLogos from './PairLogos'
import utils from '../utils/swapUtils'
import lsdp from '../utils/localStorageDataProcessor'

const valueProcessor = new ValueProcessor();

const PAIR_FILTERS = {
    totalSupply : "totalSupply",
    totalLiquidity : "totalLiquidity",
    volume1 : "volume1",
    volume2 : "volume2",
    myToken1 : "myToken1",
    myToken2 : "myToken2",
    myPoolShare : "myPoolShare"
}

class TopPairs extends React.Component {
    constructor(props) {
        super(props);
        this.pairsArr = '';   
        this.settings = initSettings()
        this.state = {
            pairFilter : PAIR_FILTERS.totalLiquidity,
            descFilter : true,
            trustedFilter : this.settings[settings.topPairsTrustedToken]
        }
    };

    populateTable() {
    	let balances = this.props.balances;
		let pairs = this.props.pairs;
		let tokens = this.props.tokens;
		let farmsList = this.props.farmsList;
        let _getVolumes = this.getVolumes;
        let _getUsdVolumes = this.getUsdVolumes;
    	let result = [];
    	let uniquePairsTokensList = {};
    	if (pairs !== undefined && Array.isArray(pairs) && pairs.length > 0 && tokens !== undefined && Array.isArray(tokens) && tokens.length > 0) {
			pairs.forEach(function(pair, i, pairsArr) {
				['token_0','token_1','lt'].forEach(function(tokenAlias, i, tokenIndexArr) {
					let hash = undefined;
					if (tokenAlias === 'token_0' || tokenAlias === 'token_1')
						hash = pair[tokenAlias].hash
					else if (tokenAlias === 'lt')
						hash = pair[tokenAlias]

					if (!uniquePairsTokensList.hasOwnProperty(pair[tokenAlias].hash))
						uniquePairsTokensList[hash] = {
							ticker : undefined,
							inWhiteList : false,
							decimals : undefined,
							total_supply : undefined
						}
				});
			});
	
			tokens.forEach(function(tokenInNetwork, i, tokensInNetworkArr) {
				if (uniquePairsTokensList.hasOwnProperty(tokenInNetwork.hash)) {
					// console.log(tokenInNetwork.ticker, tokenInNetwork.hash, tokenInNetwork.total_supply);
					uniquePairsTokensList[tokenInNetwork.hash] = {
						ticker : tokenInNetwork.ticker,
						inWhiteList : true,
						decimals : tokenInNetwork.decimals,
						total_supply : tokenInNetwork.total_supply
					}
				}
			});
			// console.log('_____________________________________________________________________')

			pairs.forEach(function(pair, i, pairsArr) {
				if ((uniquePairsTokensList[pair.token_0.hash].inWhiteList === true) && (uniquePairsTokensList[pair.token_1.hash].inWhiteList === true) && (uniquePairsTokensList[pair.lt].inWhiteList === true)) {
					let ltInBalance = balances.find(tokenBalance => tokenBalance.token === pair.lt);
					let amountLT = 0, decimalsLT = 0;

					if (ltInBalance !== undefined) {				
						amountLT = ltInBalance.amount;
						decimalsLT = ltInBalance.decimals;
					}

					let ltObj = swapUtils.getTokenObj(tokens, pair.lt);
					let ltBalance = utils.getBalanceObj(balances, pair.lt);
					ltBalance.value = ltBalance.amount
					let farm
					if (farmsList) {
						farm = farmsList.find(farm => farm.stake_token_hash === pair.lt && farm.stake)
						if (farm)
							ltBalance = valueProcessor.add(ltBalance, {value: farm.stake, decimals: 10})
					}
                    let ltDestructionResult = testFormulas.ltDestruction(tokens, pair, {
                        lt : {
							...ltBalance,
							total_supply : {
								value : ltObj.total_supply,
								decimals : ltObj.decimals
							}
                        }
                    }, 'ltfield');

                    pair.token_0.decimals = uniquePairsTokensList[pair.token_0.hash].decimals
                    pair.token_1.decimals = uniquePairsTokensList[pair.token_1.hash].decimals
                    let volumes = _getVolumes(pair)
                    let usdVolumes = _getUsdVolumes(volumes, tokens)
                    
					result.push({
						token_0 : {
							hash : pair.token_0.hash,
							ticker : uniquePairsTokensList[pair.token_0.hash].ticker,
							volume : pair.token_0.volume,
							decimals : uniquePairsTokensList[pair.token_0.hash].decimals,
						},
						token_1 : {
							hash : pair.token_1.hash,
							ticker : uniquePairsTokensList[pair.token_1.hash].ticker,
							volume : pair.token_1.volume,
							decimals : uniquePairsTokensList[pair.token_1.hash].decimals
						},
						lt : {
							hash : pair.lt,
							ticker : uniquePairsTokensList[pair.lt].ticker,
							decimals : uniquePairsTokensList[pair.lt].decimals,
							total_supply : uniquePairsTokensList[pair.lt].total_supply
						},
						your_lp_tokens : ltDestructionResult,
						your_pool_share : swapUtils.countPoolShare(pair, {
                            value0 : ltDestructionResult.t0, 
                            value1 : ltDestructionResult.t1
                        }, tokens),
                        totalLiquidity : usdVolumes.reduce((res, vol) => {
                            return valueProcessor.add(res, vol)
                        }, {value: 0, decimals: 0})
					})
				} else {
					console.log('Black list!!!')
				}
			})	
    	} else {
    		return result;
    	}
    	return result;    	
    }

    getTmpErrorElement() {
    	const t = this.props.t;
    	return (
	    	<div>
	    		{!this.props.connectionStatus &&
	    			<>
	    				<div className="mb-3 h5">{t('noConnection')}</div>
	    				<div className="mb-3 h6">{t('clickConnect')}</div>
	    			</>
	    		}
				{this.props.connectionStatus &&
					<div className="mb-3">{t('noData')}</div>
	    		}	    		 
	    	</div>
	    )	
    }

    switchToSwap() {
        this.props.changeMenuItem('exchange');
    }

    selectPairsFilter(filterName) {
        if (this.state.pairFilter === filterName) {
            this.setState({descFilter : !this.state.descFilter})
        } else {
            this.setState({
                pairFilter : filterName,
                descFilter : true
            })
        }
    }

    getPairsTable() {
    	const t = this.props.t;

        let tColumns = [
            {
                filter : PAIR_FILTERS.totalSupply,
                text : t('topPairs.ltTotalSupply')
            },
            {
                filter : PAIR_FILTERS.totalLiquidity,
                text : t('topPairs.totalLiquidity')
            },
            {
                filter : PAIR_FILTERS.volume1,
                text : t('topPairs.volumeInPair', {indexInPair : 1})
            },
            {
                filter : PAIR_FILTERS.volume2,
                text : t('topPairs.volumeInPair', {indexInPair : 2})
            },
            {
                filter : PAIR_FILTERS.myToken1,
                text : t('topPairs.yourTokensInPair', {indexInPair : 1})
            },
            {
                filter : PAIR_FILTERS.myToken2,
                text : t('topPairs.yourTokensInPair', {indexInPair : 2})
            },
            {
                filter : PAIR_FILTERS.myPoolShare,
                text : t('topPairs.yourPoolShare')
            }
        ]

    	return (    		
            <div>
                <div className="d-flex justify-content-start mb-3 ml-2">
                    {this.renderToggle(settings.topPairsTrustedToken)}
                    <div className="pl-2">{t("trade.tokenCard.raiseUpTrustedTokens")}</div>
                </div>
                <div className="pairs-table-wrapper">
                    <SimpleBar style={{paddingBottom: '25px', paddingTop : '10px'}} autoHide={false}>	
                        <Table hover variant="dark" style={{tableLayout : 'auto'}}>
                            <thead>
                                <tr>
                                    <th key="ns">{t('numberSign')}</th>
                                    <th key="n">{t('name')}</th>
                                    {tColumns.map((col, index) => {
                                        let chevronClass = this.state.pairFilter === col.filter ? "fas fa-chevron-down accordion-chevron ml-2" : ""
                                        let chevronDirection = ""
                                        if (chevronClass)
                                            chevronDirection = this.state.descFilter ? "" : "rotate-180"
                                        return (
                                            <th key={index} className="cursor-pointer col-button" onClick={() => this.selectPairsFilter(col.filter)}>
                                                {col.text}
                                                <i className={`${chevronClass} ${chevronDirection}`}/>
                                            </th>
                                        )
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {this.pairsArr.map(( pair, index ) => {
                                    let totalSupply = valueProcessor.usCommasBigIntDecimals((pair.lt.total_supply !== undefined ? pair.lt.total_supply : '---'), pair.lt.decimals, pair.lt.decimals)
                                    let totalLiquidity = valueProcessor.usCommasBigIntDecimals((pair.totalLiquidity.value !== undefined ? pair.totalLiquidity.value : '---'), pair.totalLiquidity.decimals, pair.lt.decimals)
                                    let token0 = valueProcessor.usCommasBigIntDecimals((pair.token_0.volume !== undefined ? pair.token_0.volume : '---'), pair.token_0.decimals, pair.token_0.decimals)
                                    let token1 = valueProcessor.usCommasBigIntDecimals((pair.token_1.volume !== undefined ? pair.token_1.volume : '---'), pair.token_1.decimals, pair.token_1.decimals)
                                    let t_0 = valueProcessor.usCommasBigIntDecimals((pair.your_lp_tokens.t0.value !== undefined ? pair.your_lp_tokens.t0.value : '---'), pair.your_lp_tokens.t0.decimals)
                                    let t_1 = valueProcessor.usCommasBigIntDecimals((pair.your_lp_tokens.t1.value !== undefined ? pair.your_lp_tokens.t1.value : '---'), pair.your_lp_tokens.t1.decimals)

                                    let renderTooltip = (manText, tooltipText) => {
                                        return <Tooltip 
                                            triggerContent={
                                                <div className='cursor-pointer top-pairs-cells' onClick={() => {
                                                    navigator.clipboard.writeText(tooltipText.replace(",", ""))
                                                }}>
                                                    {manText}
                                                </div>
                                            }
                                            text={tooltipText}
                                            placement="left"
                                        />
                                    }

                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className="text-nowrap d-flex">
                                                <PairLogos
                                                    logos={{
                                                        logo1 : swapUtils.getTokenObj(this.props.tokens, pair.token_0.hash).logo,
                                                        logo2 : swapUtils.getTokenObj(this.props.tokens, pair.token_1.hash).logo,
                                                        net : this.props.net,
                                                        size : 'xs'
                                                    }}
                                                />
                                                <a
                                                    href = {"/#!action=swap&pair=" + pair.token_0.ticker + "-" + pair.token_1.ticker + '&from=' + pair.token_0.hash + "&to=" + pair.token_1.hash}
                                                    onClick={this.switchToSwap.bind(this)}
                                                    className="text-color4-link hover-pointer ml-2">
                                                    {pair.token_0.ticker}-{pair.token_1.ticker}
                                                </a>
                                            </td>
                                            <td>
                                                {renderTooltip(
                                                    <div>{swapUtils.removeEndZeros(totalSupply.slice(0, -6))} {pair.lt.ticker}</div>,
                                                    totalSupply
                                                )}
                                            </td>
                                            <td>
                                                {renderTooltip(
                                                    <div>${swapUtils.removeEndZeros(totalLiquidity.slice(0, -8))}</div>,
                                                    totalLiquidity
                                                )}
                                            </td>
                                            <td>
                                                {renderTooltip(
                                                    <div>{swapUtils.removeEndZeros(token0.slice(0, -6))} {pair.token_0.ticker}</div>,
                                                    token0
                                                )}
                                            </td>
                                            <td>
                                                {renderTooltip(
                                                    <div>{swapUtils.removeEndZeros(token1.slice(0, -6))} {pair.token_1.ticker}</div>,
                                                    token1
                                                )}
                                            </td>
                                            <td>
                                                {renderTooltip(
                                                    <div>{swapUtils.removeEndZeros(t_0.slice(0, -6))} {pair.token_0.ticker}</div>,
                                                    t_0
                                                )}
                                            </td>
                                            <td>
                                                {renderTooltip(
                                                    <div>{swapUtils.removeEndZeros(t_1.slice(0, -6))} {pair.token_1.ticker}</div>,
                                                    t_1
                                                )}
                                            </td>
                                            <td>{swapUtils.removeEndZeros(pair.your_pool_share)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </SimpleBar>
                </div>	
            </div>			
    	)
    }

    getVolumes(pair) {
        return [
            {
                value : BigInt(pair.token_0.volume),
                decimals : pair.token_0.decimals,
                hash : pair.token_0.hash
            },
            {
                value : BigInt(pair.token_1.volume),
                decimals : pair.token_1.decimals,
                hash : pair.token_1.hash
            }                
        ]
    }

    getUsdVolumes(volumes, tokens) {
        return volumes.reduce((res, vol) => {
            let tokenObj = utils.getTokenObj(tokens, vol.hash)
            if (!tokenObj.price_raw)
                return res
                
            let usdPrice
            if (tokenObj.price_raw.dex_price)
                usdPrice = tokenObj.price_raw.dex_price
            // if (tokenObj.price_raw.cg_price)
            //     usdPrice = tokenObj.price_raw.cg_price
            if (!usdPrice)
                return res

            usdPrice = {
                value : usdPrice,
                decimals : tokenObj.price_raw.decimals
            }
            res.push(valueProcessor.mul(vol, usdPrice))
            return res
        }, [])
    }

    sortTableByTotalLiquidity(pairsArr) {
        let sumVols = function(volumes) {
            return volumes.reduce((res, vol) => {
                return valueProcessor.add(res, vol)
            }, {value: 0, decimals: 0})
        }

        let volSort = function(volumes1, volumes2) {
            try {
                let tvl1 = sumVols(volumes1)
                let tvl2 = sumVols(volumes2)
                let { f, s } = utils.realignValueByDecimals(tvl1, tvl2)
                return f > s ? -1 : f == s ? 0 : 1
            } catch (e) {
                return 0
            }
        }
        let sortDirection = this.state.descFilter ? 1 : -1
        return pairsArr.sort((pair1, pair2) => {
            let volumes1 = this.getVolumes(pair1)
            let volumes2 = this.getVolumes(pair2)

            if (volumes1[0].value + volumes1[1].value === 0n)
                return 1 * sortDirection
            if (volumes2[0].value + volumes2[1].value === 0n)
                return -1 * sortDirection

            let usdVolumes1 = this.getUsdVolumes(volumes1, this.props.tokens)
            let usdVolumes2 = this.getUsdVolumes(volumes2, this.props.tokens)
           
            if (usdVolumes1.length && !usdVolumes2.length)
                return -1 * sortDirection
            else if (!usdVolumes1.length && usdVolumes2.length)
                return 1 * sortDirection
            else if (!usdVolumes1.length && !usdVolumes2.length)
                return volSort(volumes1, volumes2, sortDirection) * sortDirection
            else
                return volSort(usdVolumes1, usdVolumes2, sortDirection) * sortDirection
        })
    }

    sortTableByTotalSupply(pairsArr) {
        let sortDirection = this.state.descFilter ? 1 : -1
        return pairsArr.sort((pair1, pair2) => {
            let ts1 = BigInt(pair1.lt.total_supply)
            let ts2 = BigInt(pair2.lt.total_supply)
            let res = ts1 > ts2 ? -1 : ts1 < ts2 ? 1 : 0
            return res * sortDirection
        })
    }

    sortByPoolShare(pairsArr) {
        let sortDirection = this.state.descFilter ? 1 : -1
        return pairsArr.sort((pair1, pair2) => {
            let integer1 = 0n, fractional1 = 0
            if (pair1.your_pool_share !== undefined)
                [integer1, fractional1] = pair1.your_pool_share.split(".")
            let integer2 = 0n, fractional2 = 0
            if (pair2.your_pool_share !== undefined)
                [integer2, fractional2] = pair2.your_pool_share.split(".")
            integer1 = BigInt(integer1)
            integer2 = BigInt(integer2)
            let res
            if (integer1 > integer2)
                res = -1
            else if (integer1 < integer2)
                res = 1
            else {
                res = fractional1 > fractional2 ? -1 : fractional1 < fractional2 ? 1 : 0 
            }
            return res * sortDirection
        })
    }

    sortByVolume(pairsArr, sortCallback) {
        let sortDirection = this.state.descFilter ? 1 : -1
        let commonVolumesSort = function(callback) {
            return pairsArr.sort((pair1, pair2) => {
                let { f, s } = callback(pair1, pair2)
                let res = f > s ? -1 : f < s ? 1 : 0 
                return res * sortDirection
            })
        }
        return commonVolumesSort(sortCallback)
    }

    sortTable(pairsArr) {
        switch (this.state.pairFilter) {
            case PAIR_FILTERS.totalLiquidity:
                return this.sortTableByTotalLiquidity(pairsArr)
            case PAIR_FILTERS.totalSupply:
                return this.sortTableByTotalSupply(pairsArr)
            case PAIR_FILTERS.myPoolShare:
                return this.sortByPoolShare(pairsArr)
            case PAIR_FILTERS.myToken1:
                return this.sortByVolume(pairsArr, (pair1, pair2) => {
                    return utils.realignValueByDecimals(pair1.your_lp_tokens.t0, pair2.your_lp_tokens.t0)
                })
            case PAIR_FILTERS.myToken2:
                return this.sortByVolume(pairsArr, (pair1, pair2) => {
                    return utils.realignValueByDecimals(pair1.your_lp_tokens.t1, pair2.your_lp_tokens.t1)
                })
            case PAIR_FILTERS.volume1:
                return this.sortByVolume(pairsArr, (pair1, pair2) => {
                    return utils.realignValueByDecimals({
                        value : pair1.token_0.volume,
                        decimals : pair1.token_0.decimals
                    }, {
                        value : pair2.token_0.volume,
                        decimals : pair2.token_0.decimals
                    })
                })
            case PAIR_FILTERS.volume2:
                return this.sortByVolume(pairsArr, (pair1, pair2) => {
                    return utils.realignValueByDecimals({
                        value : pair1.token_1.volume,
                        decimals : pair1.token_1.decimals
                    }, {
                        value : pair2.token_1.volume,
                        decimals : pair2.token_1.decimals
                    })
                })
            default:
                return pairsArr
        }
    }

    renderToggle (localStorageKey) {
        return (
            <>
                <div className="row mt-1">
                    <div className="col d-flex align-items-center">
                        <input  type="checkbox"
                                className="c-toggle mx-0"
                                onClick={e => this.updFlag(localStorageKey, e.target.checked)}
                                defaultChecked={this.settings[localStorageKey]}
                        />
                    </div>
                </div>
            </>
        )
    }

    
    updFlag (key, value) {
        lsdp.simple.write(key, value, true)
        this.setState({trustedFilter : value})
    }

    trustedTokensSort(pairsArr) {
        if (!this.state.trustedFilter)
            return pairsArr
        else
            return pairsArr.sort((pair1, pair2) => {
                let tt = this.props.networkInfo.dex.DEX_TRUSTED_TOKENS
                let isTrustedPair1 = tt.indexOf(pair1.token_0.hash) !== -1 || tt.indexOf(pair1.token_1.hash) !== -1
                let isTrustedPair2 = tt.indexOf(pair2.token_0.hash) !== -1 || tt.indexOf(pair2.token_1.hash) !== -1

                if (isTrustedPair1 && isTrustedPair2)
                    return 0
                else if (isTrustedPair1)
                    return -1
                else if (isTrustedPair2)
                    return 1
                else 
                    return 0
            })
    }

    render() {
		const t = this.props.t;
		this.pairsArr = this.populateTable();
        this.pairsArr = this.sortTable(this.pairsArr);
        this.pairsArr = this.trustedTokensSort(this.pairsArr);
    	return (
    		<div className="row">
    			<div className={!this.props.connectionStatus ? 'swap-card-wrapper px-2 pt-0 mt-0' : 'col-12 col-lg-10 offset-lg-1 col-xl-10 offset-xl-1'}>    			
					<Card className="c-card-1" id="topPairsCard">
					  <Card.Body>
					    <Card.Title>
					    	<div className="h4 py-3">{t('topPairs.title')}</div>
					    </Card.Title>
					    <Card.Text as="div">
						    {this.pairsArr.length > 0 ? this.getPairsTable() : this.getTmpErrorElement()}						    
					    </Card.Text>
					  </Card.Body>
					</Card>    			
    			</div>
    		</div>
        )
    }        
};

const WTopPairs = connect(mapStoreToProps(components.TOP_PAIRS), mapDispatchToProps(components.TOP_PAIRS))(withTranslation()(TopPairs));

export default WTopPairs;    