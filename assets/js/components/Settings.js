import React from 'react'
import { withTranslation } from "react-i18next"
import { Form, Modal, InputGroup, FormControl } from "react-bootstrap"
import {initSettings, settings} from "../utils/tokensSettings"

import CommonModal from "../elements/CommonModal"
import Tooltip from "../elements/Tooltip"

import SlippageValidationRules from "../utils/slippageValidationRules"
import Validator from  "../utils/Validator"
import lsdp from "../utils/localStorageDataProcessor";

import "../../css/settings.css"


class Settings extends React.Component {
	constructor(props = {}) {
		super(props);
		this.customClassName = props.class_name ? props.class_name : ''
		this.defaultClassName = 'icon-Icon15 swap-card-top-items'

		this.slippageValidationRules = new SlippageValidationRules(this.props.t)
		this.validator = new Validator
		this.state = {
			activeStyle : "inactive",
			settingsVisibility : false,
			slippagePercent : 0.1,
			errorMessage : undefined
		}
		this.settingsRanges = [
			{
				value : 0.1,
				alias : this.props.t(`trade.swapCard.settings.autoButton`)
			},
			{
				value : 0.5,
				alias : '0.5%'
			},
			{
				value : 1,
				alias : '1%'
			},
			{
				value : 5,
				alias : '5%'
			}
		]
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		this.settingsRanges[0].alias = this.props.t(`trade.swapCard.settings.autoButton`)
	}

	componentDidMount() {
		this.initSlippage()
	}

	initSlippage () {
		this.intervalDescriptor = setInterval(() => {
			if (lsdp._pubKey) {
				clearInterval(this.intervalDescriptor)
				this.setSlippageFromStorage()
				this.setState({activeStyle : "active"})
			}
		}, 500)
	}

	resetInputs () {
		if (lsdp._pubKey)
			this.setSlippageFromStorage()
	}

	setSlippageFromStorage () {
		let userSlippage = lsdp.simple.get("ENEXUserSlippage")
		if (userSlippage === null) {
			this.writeUserSlippageValue(this.settingsRanges[0].value)
			this.setSlippagePercent(this.settingsRanges[0].value)
		} else
			this.setSlippagePercent(userSlippage)
	}

	componentWillUnmount() {
		clearInterval(this.intervalDescriptor)
	}

	openAction () {
        this.settings = initSettings()
		if (this.state.activeStyle === "active")
			this.setState({settingsVisibility: true})
	}

	closeAction () {
		this.setState({settingsVisibility : false})
		this.resetInputs()
	}

	writeUserSlippageValue (value) {
		lsdp.simple.write("ENEXUserSlippage", value)
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
    }

	renderModalHeader () {
		let t = this.props.t
		return(
			<Modal.Title id="example-custom-modal-styling-title">
				<div className="d-flex align-items-center justify-content-start">
					<span className="mr-3">
						{t('trade.swapCard.settings.header')}
					</span>
				</div>
			</Modal.Title>
		)
	}

	setSlippagePercent (value) {
		let rules = this.slippageValidationRules.getSlippageRules(value)
		let result = this.validator.batchValidate({slippageTolerance : true}, rules)
		if (result.dataValid) {
			this.writeUserSlippageValue(Number(value))
			this.setState({
				slippagePercent: value,
				errorMessage: undefined,
				errorParams: undefined
			})
		} else
			this.setState({
				slippagePercent : value,
				errorMessage : result.propsArr.slippageTolerance.msg,
				errorParams : result.propsArr.slippageTolerance.params
			})
	}

	renderRange () {
		return (
			<Form className="mb-0 w-100">
				<Form.Group controlId="formBasicRangeCustom" className="w-100">
					<Form.Control type="range"
								  value={this.state.slippagePercent}
								  min="0"
								  max="50"
								  step="0.01"
								  onChange = {e => this.setSlippagePercent(e.target.value)}
					/>
				</Form.Group>
			</Form>
		)
	}

	renderModalBody () {
		let t = this.props.t
		return(
            <div>
                <div className="d-flex justify-content-center px-3 w-100">
                    <div className="w-100">
                        <div className="row mb-2 mx-0">
                            <div className="mr-2">{t('trade.swapCard.settings.slippageHeader')}</div>
                            <Tooltip text={t('trade.swapCard.settings.slippageTooltip')}/>
                        </div>
                        <div className="d-flex justify-content-center mb-3">
                            <Form.Control onChange={e => this.setSlippagePercent(e.target.value)}
                                        className='text-input-1 form-control shadow-none text-right slippage-input'
                                        type='text'
                                        value={this.state.slippagePercent}
                                        autoComplete="off"
                                        autoFocus
                            />
                            <span className="d-flex align-items-center px-1 percent-span">%</span>
                        </div>
                        <div className="row mx-0">
                            {this.renderRange()}
                        </div>
                        <div className="d-flex align-items-center justify-content-between row mx-0">
                            {this.settingsRanges.map((item, index) => (
                                <button key={index+''}
                                        className="btn btn-secondary px-3 py-1 btn-sm"
                                        size="sm"
                                        onClick={this.setSlippagePercent.bind(this, item.value)}
                                >
                                    {item.alias}
                                </button>
                            ))}
                        </div>
                        {(this.state.errorMessage !== undefined) &&
                            <small className="row err-msg d-block form-text mx-0">
                                { t(`errorMsg.${this.state.errorMessage}`, this.state.errorParams) }
                            </small>
                        }
                    </div>
                </div>
                <div className="d-flex justify-content-between mt-4 px-3">
                    <div className="w-75 d-flex">
                        <div className="mr-2">{t('trade.swapCard.settings.routingSwitch')}</div>
                        <Tooltip text={t('trade.swapCard.settings.routingSwitchTooltip')}/>
                    </div>
                    <div className="">
                        {this.renderToggle(settings.routingSwitch, "")}
                    </div>
                </div>
            </div>
		)
	}

	renderSettings () {
		return (
			<CommonModal
				closeAction={this.closeAction.bind(this)}
				renderHeader={this.renderModalHeader.bind(this)}
				renderBody={this.renderModalBody.bind(this)}
			/>
		)
	}

    render () {
        return (
			<>
				<span className={`${this.defaultClassName} ${this.customClassName} ${this.state.activeStyle}`}
					  onClick={this.openAction.bind(this)}
				/>
				{this.state.settingsVisibility && this.state.activeStyle === "active" && this.renderSettings()}
			</>
        )
    }
}

const WSettings = withTranslation()(Settings)

export default WSettings
