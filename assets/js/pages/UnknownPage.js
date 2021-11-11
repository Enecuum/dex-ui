import React from 'react';

import img from '../img/unknownPage.png';
import '../../css/unknown-page.css';

class UnknownPage extends React.Component {
    render () {
        return (
            <div className='d-flex justify-content-center align-items-center'>
                <img src={img} className='unknown-img'></img>
                {/* <h2 className='msg d-flex align-items-center'>There is no content here</h2> */}
            </div>
        );
    };
};

export default UnknownPage;