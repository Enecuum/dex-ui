import React from "react"
import {connect} from "react-redux"
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps"
import {withTranslation} from "react-i18next"

import {Card} from "react-bootstrap"
import CommonToast from "../elements/CommonToast"
import RecentTransactions from "./RecentTransactions";

import utils from "../utils/swapUtils";

import "../../css/account-short-info.css"
import img from "../../img/ENEXlogo.png";

class AccountShortInfo extends React.Component {
    constructor(props) {
        super(props)
    }

    openAccountInExplorer () {
        window.open(this.props.net.url + '#!/account/' + this.props.pubkey, '_blank').focus()
    }

    copyPubKey () {
        navigator.clipboard.writeText(this.props.pubkey).then(() => {})
    }

    closeAccountCard () {
        this.props.changeAccountInfoVisibility()
    }

    renderHeader () {
        return (
            <>
                <strong className="mr-auto text-white">Account</strong> {/* TODO - i18 translation */}
            </>
        )
    }

    renderBody () {
        return (
            <>
                <Card className='account-card'>
                    <Card.Body>
                        <div className="d-flex justify-content-between mt-2">
                            <small className="mr-4 connected-with">Connected with enq-wallet</small>
                            <button className="ml-5 extra-small-button">Change</button>
                        </div>
                        <div className="d-flex justify-content-start mt-2">
                            <div className="mr-3">
                                <div className="white-circle"/>
                                <img className="account-image" src={img} alt="account img"/>
                            </div>
                            <strong>{utils.packAddressString(this.props.pubkey)}</strong>
                        </div>
                        <div>
                            <a className="mr-2 functional-ref" onClick={this.copyPubKey.bind(this)}>
                                <span className='icon-Icon12 mr-1'/>
                                copy address
                            </a>
                            <a className="ml-2 functional-ref" onClick={this.openAccountInExplorer.bind(this)}>
                                <span className='icon-Icon11 mr-1'/>
                                view on pulse
                            </a>
                        </div>
                    </Card.Body>
                </Card>
                <RecentTransactions />
            </>
        )
    }

    render() {
        return (
            this.props.accountInfoVisibility &&
            <CommonToast renderHeader={this.renderHeader.bind(this)}
                         renderBody={this.renderBody.bind(this)}
                         closeAction={this.closeAccountCard.bind(this)}/>
        )
    }
}

const WAccountShortInfo = connect(
    mapStoreToProps(components.ACCOUNT_SHORT_INFO),
    mapDispatchToProps(components.ACCOUNT_SHORT_INFO)
)(withTranslation()(AccountShortInfo))

export default WAccountShortInfo