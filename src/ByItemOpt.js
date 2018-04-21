import React from 'react'
import {
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Label, Input, FormGroup, Form,
    Container, Row, Col,
    ListGroup, ListGroupItem,
} from 'reactstrap';

class ByItemOpt extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           // items: [["apple",1], ["banana",2], "clementine", "dragonfruit"],
            // prices: [1.00, 2.00, 3.00, 4.00],
            total: 0
        }
        this.handleChange = this.handleChange.bind(this);
        if (this.props.items) {
            for (var i = 0; i < this.props.items.length; i++) {
                this.state[i] = "success";
            }
        }
    }

    calculateTotal = () => {
        let sum = 0;
        for (var i = 0; i < this.props.items.length; i++) {
            if (this.state[i] === "success") {
                sum += parseFloat(this.props.items[i][1]);
            }
        }

        return sum;
    }

    handleChange(event) {
        const name = event.currentTarget.getAttribute("name");
        let newVal;
        if (this.state[name] === "success") {
            newVal = undefined;
        } else {
            newVal = "success"
        }
        this.setState({
            [name]: newVal,
        });
        console.log(this.state);
    }
    /*
    handleRemoveItem = (event) => {
        event.stopPropagation();
        const items = this.state.items.slice();
        items.splice(event.currentTarget.name, 1);
        this.setState({items: items});
    }    
    */
    handleSubmit = () => {
        const items = this.props.items;
        let selectedItems = [];
        for (var i = 0; i < items.length; i++) {
            if (this.state[i] === "success") {
                selectedItems.push(items[i]);
            }
        }
        console.log(selectedItems);
        this.props.toggle();
    }

    render() {
        const total = this.calculateTotal().toFixed(2);
        let ItemList = this.props.items.map((item, index) => {
            return (
            <ListGroupItem color={this.state[index]} key={index} name={index} onClick={this.handleChange} action>
                <div className="row justify-content-between">
                    <div className="col-8">
                        {item[0]}
                    </div>
                    <div className="col-4">
                        {parseFloat(item[1]).toFixed(2)}
                    </div>
                    {/*}
                    <div className="col-4">
                        <Button color="danger" size="sm" style={{float: 'right'}} name={index} onClick={this.handleRemoveItem}>
                            <span aria-hidden="true">&times;</span>
                        </Button>
    </div>
    */}
                </div>
            </ListGroupItem>
        )});
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.props.toggle}>Split By Item</ModalHeader>
                    <ModalBody>
                        <FormGroup onSubmit={this.handleSubmit}>
                            <ListGroup>
                                {ItemList}
                            </ListGroup>
                        </FormGroup>
                        <Row>
                            <Col className='centerVertical' sm={{ size: 1, offset: 8}}>
                                    Total
                            </Col>
                            <Col sm={{ size: 4 }}>
                                <div className="input-group" >
                                    <div className="input-group-prepend">
                                        <span className="input-group-text" id="inputGroupPrepend2">$</span>
                                    </div>
                                    <input type="number"
                                        readOnly
                                        disabled
                                        value={total}
                                        className="form-control" id="totalAmount" placeholder="0.00">
                                    </input>
                                </div>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleSubmit}>Save</Button>{' '}
                        <Button color="secondary" onClick={this.props.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default ByItemOpt;