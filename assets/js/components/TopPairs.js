import React from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import '../../css/top-pairs.css';

class TopPairs extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
		const t = this.props.t;
    	return (
    		<div className="row">
    			<div className="col-12 col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
					<Card className="c-card-1" id="topPairsCard">
					  <Card.Body>
					    <Card.Title>
					    	<div className="h4 py-3">{t('topPairs.title')}</div>
					    </Card.Title>
					    <Card.Text as="div">
					    	<div className="pairs-table-wrapper">
							    <Table hover variant="dark">
								  <thead>
								    <tr>
								      <th>#</th>
								      <th>First Name</th>
								      <th>Last Name</th>
								      <th>Username</th>
								    </tr>
								  </thead>
								  <tbody>
								    <tr>
								      <td>1</td>
								      <td>Mark</td>
								      <td>Otto</td>
								      <td>@mdo</td>
								    </tr>
								    <tr>
								      <td>2</td>
								      <td>Jacob</td>
								      <td>Thornton</td>
								      <td>@fat</td>
								    </tr>
								    <tr>
								      <td>3</td>
								      <td>Larry the Bird</td>
								      <td>Thornton</td>
								      <td>@fat</td>
								    </tr>
								  </tbody>
								</Table>			    	
					    	</div>
					    </Card.Text>
					  </Card.Body>
					</Card>    			
    			</div>
    		</div>

        )
    }        
};

const WTopPairs = connect(mapStoreToProps(components.TOP_PAIRS), mapDispatchToProps(components.TOP_PAIRS))(withTranslation()(TopPairs));

export default WTopPairs;    