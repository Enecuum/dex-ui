import React from "react"
import {connect} from "react-redux"
import {components, mapDispatchToProps, mapStoreToProps} from "../../store/storeToProps"
import {withTranslation} from "react-i18next"

import {Button, Card} from "react-bootstrap"
import CommonToast from "../elements/CommonToast"
import RecentTransactions from "./RecentTransactions";

import "../../css/account-short-info.css"

class AccountShortInfo extends React.Component {
    constructor(props) {
        super(props)
    }

    renderHeader () {
        return (
            <>
                <strong className="mr-auto">Account</strong> {/* TODO - i18 translation */}
            </>
        )
    }

    renderBody () {
        return (
            <>
                <Card className='account-card'>
                    <Card.Body>
                        <div>
                            {/* subheader */}
                        </div>
                        <div>
                            {/* account addr */}
                        </div>
                        <div>
                            {/* functional buttons */}
                        </div>
                    </Card.Body>
                </Card>
                <RecentTransactions />
            </>
        )
    }

    render() {
        return (
            <CommonToast renderHeader={this.renderHeader.bind(this)} renderBody={this.renderBody.bind(this)}/>
        )
    }
}

const WAccountShortInfo = connect(
    mapStoreToProps(components.ACCOUNT_SHORT_INFO),
    mapDispatchToProps(components.ACCOUNT_SHORT_INFO)
)(withTranslation()(AccountShortInfo))

export default WAccountShortInfo