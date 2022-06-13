import React from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'

import '../../css/tooltip.css'


class Tooltip extends React.Component {
    constructor (props) {
        super(props)
        this.text = props.text
        this.placement = props.placement ? props.placement : "bottom"
        this.defaultTriggerContent = <span className="icon-Icon4 fire-tooltip hover-pointer" />
        this.triggerContent = props.triggerContent ? props.triggerContent : this.defaultTriggerContent
        this.customClasses = props.customClasses ? props.customClasses : "tooltip-info"
        this.show = props.show
    }

    render() {
        const popover = (
            <Popover className={this.customClasses}>
              <Popover.Content>
                  {this.text}
              </Popover.Content>
            </Popover>
          )

        return (
            <OverlayTrigger show={this.show} placement={this.placement} overlay={popover}>
                {this.triggerContent}
            </OverlayTrigger>
        )
    }
}

export default Tooltip