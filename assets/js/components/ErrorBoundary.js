import React from "react"
import {withTranslation} from "react-i18next"

import BlankPage from "../pages/blankPage"


class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    renderErrorWindow () {
        return (
            <div className="position-absolute w-100">
                <BlankPage text={this.props.t("errorBoundary.header")}
                           addition={this.props.t("errorBoundary.advice")}
                />
            </div>
        )
    }

    render() {
        if (this.state.hasError)
            return this.renderErrorWindow()

        return this.props.children
    }
}

export default withTranslation()(ErrorBoundary)