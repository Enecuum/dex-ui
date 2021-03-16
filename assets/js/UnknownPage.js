import React from 'react';
import '../css/unknown-page.css';

class UnknownPage extends React.Component {
    render () {
        return (
            <h2 className='msg d-flex justify-content-center'>Oops! There is no content at this page</h2>
        );
    };
};

export default UnknownPage;