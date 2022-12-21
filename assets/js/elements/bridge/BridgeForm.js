import React from "react"
import '../../../css/step.css';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class BridgeForm extends React.Component {
    constructor(props) {
        super(props)
    }

    render () {
        return (
            <>
            
                <Row>
                    <Col xs lg="4">
                        <div className="text-color4">From</div>
                    </Col>
                    <Col xs lg="8">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                            <div className="text-color4">Balance: 100,000,000.123456789</div>
                            <div className="text-color3 hover-pointer hover-color4">MAX</div>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col xs lg="4">
                        <Dropdown as={ButtonGroup} className="w-100">
                            <Dropdown.Toggle >Ethereum</Dropdown.Toggle>
                            <Dropdown.Menu className="super-colors">
                                <Dropdown.Item eventKey="1">Chain 1</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Chain 2</Dropdown.Item>
                                <Dropdown.Item eventKey="3" active>
                                    Chain 3
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col xs lg="8">
                        <Row>
                            <Col xs lg="6">
                                <Dropdown as={ButtonGroup} className="w-100">
                                    <Dropdown.Toggle >ETH</Dropdown.Toggle>
                                    <Dropdown.Menu className="super-colors">
                                        <Dropdown.Item eventKey="1">Token 1</Dropdown.Item>
                                        <Dropdown.Item eventKey="2">Token 2</Dropdown.Item>
                                        <Dropdown.Item eventKey="3" active>
                                            Token 3
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                            <Col xs lg="6">
                                <Form.Group controlId="balanceFrom" className="mb-0">        
                                    <Form.Control type="text" placeholder="0.00" />       
                                </Form.Group>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Button className="w-100 btn btn-secondary alt-submit w-100 pt-2">
                    0xd16f....568b
                </Button>
                <div id="exch" class="d-flex justify-content-center align-items-center mx-auto my-3"><span class="icon-Icon13 exch-button hover-pointer"></span></div>
                <div>
                    <Row className="mb-3">
                        <Col xs lg="4">
                            <div className="mb-2 text-color4">To</div>
                            <Dropdown as={ButtonGroup} className="w-100">
                                <Dropdown.Toggle >Enecuum</Dropdown.Toggle>
                                <Dropdown.Menu className="super-colors">
                                    <Dropdown.Item eventKey="1">Chain 1</Dropdown.Item>
                                    <Dropdown.Item eventKey="2">Chain 2</Dropdown.Item>
                                    <Dropdown.Item eventKey="3" active>
                                        Chain 3
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        <Col xs lg="8">
                            <div className="mb-2 d-flex justify-content-start text-color4">Destination address</div>
                            <Form.Group className="mb-0" controlId="balanceFrom">        
                                <Form.Control type="text" placeholder="Address"  value="02bfc6ae6c5ee85db39c29f74489834db3657013799ecc3e72fa945e74807aac91"/>       
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="mb-3">
                        <Button className="w-100 btn btn-secondary alt-submit w-100 pt-2">
                            Connect a wallet
                        </Button>
                    </div>
                    <div className="text-center mb-3">
                        <Button className="rounded-button">
                            <span className="mr-2"><i class="fas fa-info-circle"></i></span>
                            <span>Use as destination address</span>
                        </Button>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-3">
                        <Form.Check type='checkbox' id='understandCheckbox'>
                            <Form.Check.Input type='checkbox'/>
                            <Form.Check.Label>
                                <span>I understand <a href='#'>all risks</a></span>
                                
                            </Form.Check.Label>                            
                        </Form.Check>
                        <button className="btn btn-secondary px-4 button-bg-3">Send</button>
                    </div>                    
                </div>                
            </>
        )
    }
}

export default BridgeForm