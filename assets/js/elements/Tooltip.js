import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import '../../css/tooltip.css';

class Tooltip extends React.Component {
    constructor (props) {
        super(props);
        this.text = props.text;              
    };

    render() {
        const popover = (
            <Popover className="tooltip-info">
              <Popover.Content>
                  {this.text}
              </Popover.Content>
            </Popover>
          );

        return (
            <OverlayTrigger placement="bottom" overlay={popover}>
                <span className="icon-Icon4 fire-tooltip hover-pointer" />
            </OverlayTrigger>
        );
    };     
};

export default Tooltip;