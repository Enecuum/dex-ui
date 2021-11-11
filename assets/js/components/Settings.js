import React from 'react'

class Settings extends React.Component {
	constructor(props = {}) {
		super(props);
		this.customClassName = props.class_name ? props.class_name : ''
		this.defaultClassName = 'icon-Icon15 swap-card-top-items inactive'
	}
    render () {
        return (
            <span className={this.defaultClassName + this.customClassName}/>
        )
    }
}

export default Settings