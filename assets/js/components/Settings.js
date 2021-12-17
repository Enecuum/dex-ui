import React from 'react'
import { withTranslation } from "react-i18next"
import { Form, Modal, InputGroup, FormControl } from "react-bootstrap"

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
			slippagePercent : 0.01,
			errorMessage : undefined
		}
		this.settingsRanges = [
			{
				value : 0.01,
				alias : this.props.t(`trade.swapCard.settings.autoButton`)
			},
			{
				value : 0.1,
				alias : '0.1%'
			},
			{
				value : 10,
				alias : '10%'
			},
			{
				value : 25,
				alias : '25%'
			}
		]
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		this.settingsRanges[0].alias = this.props.t(`trade.swapCard.settings.autoButton`)
	}

	componentDidMount() {
		this.intervalDescriptor = setInterval(() => {
			if (lsdp._pubKey) {
				clearInterval(this.intervalDescriptor)
				let userSlippage = lsdp.simple.get("ENEXUserSlippage")
				if (userSlippage === null) {
					this.writeUserSlippageValue(this.settingsRanges[0].value)
					this.setSlippagePercent(this.settingsRanges[0].value)
				} else {
					this.setSlippagePercent(userSlippage)
				}
				this.setState({activeStyle : "active"})
			}
		}, 500)
	}

	componentWillUnmount() {
		clearInterval(this.intervalDescriptor)
	}

	openAction () {
		if (this.state.activeStyle === "active")
		this.setState({settingsVisibility : true})
	}

	closeAction () {
		this.setState({settingsVisibility : false})
	}

	writeUserSlippageValue (value) {
		lsdp.simple.write("ENEXUserSlippage", value)
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
								  max="49.99"
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
