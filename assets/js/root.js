/* ======== code for auto reloading in dev-mode ======== */

console.log(`Version ${VERSION}`)
console.log(`Mode ${MODE}`)
if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => location.reload())
}

/* --------------- React, Redux, Bootstrap --------------- */
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import "regenerator-runtime/runtime.js"

/* ---------------------- I18 next ----------------------- */
import i18n from "./utils/i18n"
import { withTranslation, I18nextProvider } from "react-i18next"

/* --------------------- Redux store --------------------- */
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps'
import pageDataPresets from '../store/pageDataPresets'
import store from '../store/store'

/* ------------------ Dex-ui components ------------------ */
import LPTokensWalletInfo from './components/LPTokensWalletInfo'
import { Navbar, Aside, SwapCard, Switch,
         WaitingIssueTokenConfirmation } from './components/entry'
import ErrorBoundary from  "./components/ErrorBoundary"

const SwapAddon = React.lazy(() => import('./components/SwapAddon'))
import TopPairs from './components/TopPairs'
import Etm from './pages/Etm'
import Farms from './pages/Farms'
import Drops from './pages/Drops'
import SpaceStation from './pages/SpaceStation'

/* -------------------- Dex-ui pages --------------------- */
import BlankPage from './pages/blankPage'

/* -------------------- Request util --------------------- */
import swapApi from './requests/swapApi'
import networkApi from './requests/networkApi'

/* --------------------- Other utils --------------------- */
import utils from './utils/swapUtils'
import '../../node_modules/enq-web3/dist/enqweb3lib.node.min'
import {cookieProcessor as cp} from "./utils/cookieProcessor"
import lsdp from "./utils/localStorageDataProcessor"


class Root extends React.Component {
    constructor (props) {
        super(props)
        this.intervalDescriptors = []
        this.supersonicIntervalFlag = true
        this.supersonicUpdDexData()
        this.intervalDescriptors.push(this.circleBalanceUpd())
        this.updNativeTokenData()
        this.setPath()
        window.addEventListener('hashchange', () => {
            this.setPath()
        })
        this.updNetworkInfo()
    }

    componentDidUpdate(prevProps) {
        if (this.props.net.url !== prevProps.net.url) {
            this.supersonicUpdDexData()
            this.updNetworkInfo()
            this.mustChangeLogos = true
        }
    }

    componentWillUnmount () {
        this.intervalDescriptors.forEach(descriptor => clearInterval(descriptor))
        clearInterval(this.updDexDataDescriptor)
    }

    setUpdDataDescriptor (timeout) {
        if (this.updDexDataDescriptor)
            clearInterval(this.updDexDataDescriptor)
        this.updDexDataDescriptor = setInterval(() => {
            this.updDexData(this.props.pubkey)
        }, timeout)
    }

    supersonicUpdDexData () {
        this.supersonicIntervalFlag = true
        this.setUpdDataDescriptor(1000)
    }

    slowDownUpdDexDataInterval () {
        this.setUpdDataDescriptor(5000)
    }

    /* ---------------------- Routing ------------------------ */

    setPath() {
        let action = this.getPathFromURLsHash()
        if (action !== undefined) {
            this.props.changeMenuItem(action)
        } else
            window.location.hash = '#!action=swap'
    }

    getPathFromURLsHash() {
        let res = undefined;
        window.location.hash
        .split('&')
        .map(elem => {
            elem = elem.replace('#!', '');
            let tmpArr = elem.split('=');
            if (tmpArr[0] === 'action') {
                for (let path in pageDataPresets.paths) {
                    if (pageDataPresets.paths[path] === tmpArr[1])
                        res = path;
                }
            }
        });
        return res;
    }

    /* ---------------- Data transformation ------------------ */

    convertPools (pools) {
        return pools.map(element => {
            return {
                token_0 : {
                    hash : element.asset_1,
                    volume : element.volume_1
                },
                token_1 : {
                    hash :  element.asset_2,
                    volume : element.volume_2
                },
                pool_fee : element.pool_fee,
                lt : element.token_hash
            };
        });
    };

    /* -------------------- Data loading --------------------- */

    updNetworkInfo () {
        let networkInfo = networkApi.networkInfo();
        networkInfo.then(result => {
            if (!result.lock) {
                result.json().then(info => {
                    this.props.updateNetworkInfo(info);
                })
            }
        })
    }

    updDexData (pubkey) {
        if (this.props.connectionStatus) {
            if (this.supersonicIntervalFlag) {
                this.supersonicIntervalFlag = false
                setTimeout(() => {
                    clearInterval(this.updDexDataDescriptor)
                    this.slowDownUpdDexDataInterval()
                }, 5 * 1000)
            }
            this.updBalances(pubkey)
            this.updPools()
            this.updTokens()
            this.updNetworkInfo()
        }
    }

    updNativeTokenData () {
        swapApi.getNativeTokenData()
        .then(res => {
            if (!res.lock)
                res.json()
                .then(res => this.props.updNativeToken(res.native_token))
        })
    }

    updBalances (pubkey) {
        if(pubkey != '')
            swapApi.getFullBalance(pubkey)
            .then(res => {
                if (!res.lock)
                    res.json()
                    .then(res => {
                        res = res.filter(el => el.amount !== 0) // TMP solution
                        this.props.updBalances(res)
                    })
            })
    }

    updPools () {
        swapApi.getPairs()
        .then(res => {
            if (!res.lock)
                res.json()
                .then(res => this.props.updPairs(this.convertPools(res)))
        })
    }

    updTokens() {
        swapApi.getTokens()
        .then(res => {
            if (!res.lock)
                res.json()
                .then(tokens => {
                    let tokenHashArr = []
                    this.props.balances.forEach(balance => {
                        tokenHashArr.push({hash : balance.token})
                    });
                    this.props.pairs.forEach(pair => {
                        const keys = Object.keys(pair)
                        for (const key of keys) {
                            let hash = undefined
                            if (key === 'token_0' || key === 'token_1')
                                hash = pair[key].hash
                            else if (key === 'lt')
                                hash = pair[key]
                            if (hash !== undefined) {
                                let isInArr = tokenHashArr.find(elem => elem.hash === hash)
                                if (!isInArr)
                                    tokenHashArr.push({hash : hash})                                
                            }
                        }
                    })
                    this.addOptionalTokenInfo(tokens, tokenHashArr)
                })
        })
    }

    addOptionalTokenInfo (tokens, subset) {
        let promises = []
        let indexes = []
        let iCounter = 0
        if (!subset.length)
            return
        subset.forEach(elem => {
            let isInTokensArr = tokens.find(token => token.hash === elem.hash)
            if (isInTokensArr) {
                let j = tokens.indexOf(isInTokensArr)
                if (j !== -1) {
                    let inRootProps = this.props.tokens.find(token => token.hash === elem.hash)

                    if (!inRootProps) {
                        indexes[iCounter++] = j
                        promises.push(swapApi.getTokenInfo(tokens[j].hash))
                    } else {
                        if(inRootProps.decimals === undefined || inRootProps.total_supply === undefined) {
                            indexes[iCounter++] = j
                            promises.push(swapApi.getTokenInfo(inRootProps.hash))
                        } else {
                            tokens[j].decimals = inRootProps.decimals
                            tokens[j].total_supply = inRootProps.total_supply
                        }
                    }
                }
            }
        })
        Promise.allSettled(promises)
        .then(results => {
            promises = []
            for (let i in results) {
                promises.push(
                    results[i].value.json()
                    .then(info => {
                        if (!info.length)
                            return;
                        info = info[0]
                        tokens[indexes[i]].decimals = info.decimals
                        tokens[indexes[i]].total_supply = info.total_supply
                    })
                )
            }
            Promise.all(promises)
            .then(() => {
                if (this.mustChangeLogos) {
                    this.mustChangeLogos = false
                    tokens = this.clearLogoInfo(tokens)
                }
                let withoutImagePlaces = this.getTokensWithoutImageName(tokens)
                if (withoutImagePlaces.length)
                    this.updTokensImageInfo(tokens, withoutImagePlaces)
                    .then(tokens => this.props.assignAllTokens(tokens))
                else
                    this.props.assignAllTokens(tokens)
            })
        })
    }

    clearLogoInfo (tokens) {
        return tokens.map(token => {
            token.logo = undefined
            return token
        })
    }

    getTokensWithoutImageName (tokens) {
        return tokens.reduce((emptyPlaces, cur, place) => {
            if (cur.logo === undefined)
                emptyPlaces.push(place)
            return emptyPlaces
        }, [])
    }

    updTokensImageInfo (tokens, withoutImagePlaces) {
        return new Promise(resolve => {
            let p = (this.props.net.name === "bit") ? networkApi.tokenInfoStorageBit() : networkApi.tokenInfoStorageEnq()
            p.then(result => {
                if (!result.lock) {
                    result.json().then(infoStorageEnq => {
                        for (let index of withoutImagePlaces)
                            tokens[index].logo = this.findLogo(infoStorageEnq, tokens[index].hash)
                        resolve(tokens)
                    }).catch(() => resolve())
                } else
                    resolve(tokens)
            })
        })
    }

    findLogo (infoStorageEnq, tokenHash) {
        let res = infoStorageEnq.find(el => el.token_id === tokenHash)
        return res ? res.logo : null
    }

    /* -------------- Upd balances in swapCard --------------- */

    circleBalanceUpd () {
        this.updBalanceForms()
        return setInterval(() => {
            this.updBalanceForms()
        }, 1000)
    }

    updBalanceObj (menuItem, field) {
        let balanceObj = utils.getBalanceObj(this.props.balances, this.props[menuItem][field].token.hash)
        let tokenObj = utils.getTokenObj(this.props.tokens, this.props[menuItem][field].token.hash)
        if (tokenObj.ticker === '---') {
            if (field === 'field0')
                this.props.assignTokenValue(menuItem, field, utils.getTokenObj(this.props.tokens, this.props.mainToken))
            else
                this.props.assignTokenValue(menuItem, field, utils.getTokenObj(this.props.tokens, this.props[menuItem][field].token.hash))
        }
        this.props.assignBalanceObj(menuItem, field, balanceObj)
    }

    updBalanceForms () {
        if (this.props.menuItem === 'exchange') {
            this.updBalanceObj('exchange', 'field0')
            this.updBalanceObj('exchange', 'field1')
        } else if (this.props.menuItem === 'liquidity' && !this.props.liquidityMain && !this.props.liquidityRemove) {
            this.updBalanceObj('liquidity', 'field0')
            this.updBalanceObj('liquidity', 'field1')
        } else if (this.props.menuItem === 'liquidity' && this.props.liquidityRemove) {
            this.updBalanceObj('removeLiquidity', 'field0')
            this.updBalanceObj('removeLiquidity', 'field1')
            this.updBalanceObj('removeLiquidity', 'ltfield')
        }
    }

    /* ------------------------ Menu ------------------------- */

    menuViewController () {
        switch (this.props.menuItem) {
            case 'exchange' :
            case 'liquidity':
                return (
                    <div className="swap-card-wrapper px-2">
                        <div className='swap-card position-relative'>
                            <div id='switch'>
                                <Suspense fallback={<div>---</div>}>
                                    <Switch />
                                </Suspense>    
                            </div>
                            <Suspense fallback={<div>---</div>}>
                                <SwapCard updDexData = {this.updDexData.bind(this)} />
                            </Suspense>
                        </div>
                        <div className="addon-card-wrapper mt-4">
                            {this.props.menuItem === 'exchange' &&
                                <SwapAddon useSuspense={false}/> || <LPTokensWalletInfo useSuspense={false}/>
                            }
                        </div>
                    </div>    
                );
            case 'etm':
                return (
                    <div id="ETMPage" className="regular-page p-2 p-md-5 px-lg-0" >
                        <Suspense fallback={<div>---</div>}>
                            <Etm/>
                        </Suspense>
                        <Suspense fallback={<div>---</div>}>
                            <WaitingIssueTokenConfirmation />
                        </Suspense>
                    </div>
                );
            case 'topPairs':
                return (
                    <div className="regular-page p-2 p-md-5 px-lg-0" >
                        <TopPairs  useSuspense={false}/>
                    </div>                    
                );
            case 'farms':
                return (
                    <div className="regular-page p-2 p-md-5 px-lg-0" >
                        <Farms useSuspense={false}/>
                    </div>                    
                );
            case 'drops':
                return (
                    <div className="regular-page p-2 p-md-5 px-lg-0" >
                        <Drops useSuspense={false}/>
                    </div>                    
                );
            case 'spaceStation' :
                return (
                    <div className="regular-page p-2 p-md-5 px-lg-0" >
                        <SpaceStation useSuspense={false}/>
                    </div>                    
                );                                                     
            default:
                return (
                    <BlankPage text="Coming soon"/>
                );
        }
    };

    changeMenuItem (newItem) {
        this.props.changeMenuItem(newItem);
    };

    render () {
        return (
            <div className={this.props.menuItem === 'etm' ? 'background-opaque' : ''}>
                <Suspense fallback={<div>---</div>}>
                    <Navbar updDexData = {this.updDexData.bind(this)} useSuspense={true}/>
                </Suspense>
                <main role='main' className={`container-fluid px-0 position-relative aside-${this.props.navOpened ? 'open' : 'closed'}`}>
                    <div id="contentWrapper" className='d-flex pb-5'>
                        <Suspense fallback={<div>---</div>}>
                            <Aside useSuspense={true} />
                        </Suspense>
                        {this.menuViewController()}
                    </div>
                    <div className="tech-info">
                        { MODE === "development" &&
                            <div>
                                <small>v:{VERSION}</small>
                            </div>
                        }
                    </div>
                </main>
            </div>
        )
    }
}

const WRoot = connect(
    mapStoreToProps(components.ROOT),
    mapDispatchToProps(components.ROOT)
)(withTranslation()(Root))

ReactDOM.render(
    <I18nextProvider i18n={i18n}>
        <Provider store={ store } >
            <Suspense fallback={<div>---</div>}>
                <ErrorBoundary>
                    <WRoot />
                </ErrorBoundary>
            </Suspense>
        </Provider>
    </I18nextProvider>,
    document.getElementById('root')
);