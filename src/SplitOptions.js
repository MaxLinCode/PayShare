import React from 'react'
import './Expenses.css'
import {calculateWithPayer, calculateMoneyOwed, dRound, getError} from './algs.js'
import ByItemOpt from './ByItemOpt'
import {
    Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter,
    FormGroup,
    Container, Row, Col,
    ListGroupItem
} from 'reactstrap';
import { firebase, auth, db } from './fire'

class UnequalOpt extends React.Component {
    constructor(props) {
        super(props);
        var selectedUsers = [];
        for (var i = 0; i < this.props.users.length; i++) {
            selectedUsers.push(1);
        }
        this.state = {selectedUsers: selectedUsers};
    }
    
    handleChange = (event) => {
        const target = event.target;
        const name = target.name;
        this.setState({
            [name]: target.value
        });
    }

    updateExpenseCosts = (owesList) => {
        let usersObj = {...this.props.splitUsersObj} 
        Object.keys(usersObj).forEach(function(key, index) {
            usersObj[key].userOwe = 0
            usersObj[key].userCost = 0
        })
        for (let i = 0; i < owesList.length; i++) {
            let userEmail = owesList[i][0]
            let owePrice  = owesList[i][1]
            usersObj[userEmail].userOwe = owePrice
            console.log(userEmail, owePrice)
        }
        // Send to parent
        this.props.updateExpenseCosts(usersObj)
    }

    handleSubmit = () => {
        //console.log(this.props)
        let payingUsers = [];
        for (var i = 0; i < this.props.users.length; i++) {
            if (this.state[this.props.users[i] + i] === undefined) {
                payingUsers.push([this.props.EmailIds[i], 0]); 
                continue;
            }
            payingUsers.push([this.props.EmailIds[i], parseFloat(this.state[this.props.users[i] + i])]);
        }
        //console.log(payingUsers);
        let payer = [];
        payer.push([this.props.payerEmail, parseFloat(this.props.totalAmount)]);
        //console.log(payer);
        let totalPay = 0;
        let totalUsr = 0;
        for (let i = 0; i < payingUsers.length; ++i) {
            totalUsr = dRound(totalUsr + payingUsers[i][1], 2);
        }
        for (let i = 0; i < payer.length; ++i) {
            totalPay = dRound(totalPay + payer[i][1], 2);
        }
        let result = [];
        if (totalPay !== totalUsr) {
            result.push(["ERROR", 0, 99]);
        }
        else {
            result = calculateWithPayer(payingUsers, payer, 1, null, null);
        }
        console.log(result);
        // Update Expenses
        this.updateExpenseCosts(result);
        if (result[0][0] === "ERROR") {
            alert(getError(result));
            return;
        }
        
        result = calculateMoneyOwed(result);
        console.log(result);
        if (result[0][0] === "ERROR") {
            alert(getError(result));
            return;
        }
        this.props.toggle();
    }

    render() {
        const nameBoxes = this.props.users.map((user, index) =>
        <div key={index}>
        <Container>
            <Row>
                <Col className="centerVertical">
                    {user}
                </Col>
                <Col>
                <div className="input-group" style={{padding: '0.25em'}}>
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="inputGroupPrepend2">$</span>
                    </div>
                    <input type="number"
                        name={user+index}
                        onChange={this.handleChange}
                        className="form-control" id="totalAmount" placeholder="0.00" required>
                    </input>
                </div>
                </Col>
            </Row>
        </Container>
        </div>
        );
        return (
        <div>
        <Modal isOpen={this.props.modal} toggle={this.props.toggle} className={this.props.className}>
            <ModalHeader toggle={this.props.toggle}>Split Unequally</ModalHeader>
                    <ModalBody>
                        <FormGroup onSubmit={this.handleSubmit}>
                            {nameBoxes}
                        </FormGroup>
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

class EqualOpt extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        for (var i = 0; i < this.props.users.length; i++) {
            this.state[i] = "success";
        }
    }

    componentDidMount() {
        for (var i = 0; i < this.props.users.length; i++) {
            var key = this.props.users[i] + i;
            this.setState({[key]: "success"})
        }
    }
    updateExpenseCosts = (owesList) => {
        let usersObj = {...this.props.splitUsersObj} 
        Object.keys(usersObj).forEach(function(key, index) {
            usersObj[key].userOwe = 0
            usersObj[key].userCost = 0
        })
        for (let i = 0; i < owesList.length; i++) {
            let userEmail = owesList[i][0]
            let owePrice  = owesList[i][1]
            usersObj[userEmail].userOwe = owePrice
            console.log(userEmail, owePrice)
        }
        this.props.updateExpenseCosts(usersObj)
        // Send to parent
    }

    handleSubmit = () => {
        //console.log(this.props)
        //let isSelected;
        let payingUsers = [];
        for (var i = 0; i < this.props.EmailIds.length; i++) {
            let value = this.state[this.props.users[i] + i];
            if (value === 'success' || value === undefined) {
                //isSelected = true;
                payingUsers.push([this.props.EmailIds[i], 0]);
            }
            else {
                //isSelected = false;
            }
        }
        //console.log("PayingUsers", payingUsers);
        let payer = [];
        payer.push([this.props.payerEmail, parseFloat(this.props.totalAmount)]);
        let result = calculateWithPayer(payingUsers, payer, 0, null, null);
        if (result[0][0] === "ERROR") {
            alert(getError(result));
            return;
        }
        // Update user owe
        this.updateExpenseCosts(result)
        for (let i = 0; i < payer.length; ++i) {
            let j = 0;
            for (; j < result.length; ++j) {
                if (result[j][0] === payer[i][0]) {
                    break;
                }
            }
            if (j === result.length) {
                result.push([payer[i][0], payer[i][1]]);
            }
        }
        result = calculateMoneyOwed(result);
        console.log(result);
        if (result[0][0] === "ERROR") {
            alert(getError(result));
            return;
        }
        //console.log(this.props.payerEmail)
        this.props.toggle();
    }
    
    handleChange  = (event) => {
        const name = event.currentTarget.getAttribute("name");
        let newVal;
        if (this.state[name] === undefined || this.state[name] === "success") {
            newVal = "notselected";
        } else {
            newVal = "success"
        }
        this.setState({
            [name]: newVal,
        });
    }

    render() {
        let numSelected = 0;
        for (var i = 0; i < this.props.users.length; i++) {
            var key = this.props.users[i] + i;
            if (this.state[key] === "success" || this.state[key] === undefined) {
                numSelected += 1;
            }
        }
        let UserList = this.props.users.map((user, index) => {
            if (this.state[user + index] === "success" || this.state[user + index] === undefined) {
                return (
                    <ListGroupItem color="success" key={index} name={user + index} onClick={this.handleChange} action>
                        <div className="row justify-content-between">
                            <div className="col-4">
                                {user}
                            </div>
                            <div className="col-4">
                                {(parseFloat(this.props.totalAmount) / numSelected).toFixed(2)}
                            </div>
                        </div>
                    </ListGroupItem>
                );
            } else {
                return (
                    <ListGroupItem color={this.state[user + index]} key={index} name={user + index} onClick={this.handleChange} action>
                        <div className="row justify-content-between">
                            <div className="col-4">
                                {user}
                            </div>
                            <div className="col-4">
                                {(0).toFixed(2)}
                            </div>
                        </div>
                    </ListGroupItem>
                );
            }
        });
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.props.toggle}>Split Equally</ModalHeader>
                    <ModalBody>
                        <FormGroup check>
                            {UserList}
                        </FormGroup>
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

class SplitOptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            equalModal: false,
            unequalModal: false,
            byItemModal: false,
            users: this.props.users,
            totalAmount: this.props.totalAmount
        }
        this.toggleEqualModal = this.toggleEqualModal.bind(this);
        this.toggleUnequalModal = this.toggleUnequalModal.bind(this);
        this.toggleByItemModal = this.toggleByItemModal.bind(this);
    }

    componentDidMount() {
        this.setState({
            users: this.props.users,
            totalAmount: this.props.totalAmount
        });
    }

    toggleUnequalModal() {
        this.componentDidMount();
        this.setState({
            unequalModal: !this.state.unequalModal
        });
    }
    toggleEqualModal() {
        this.componentDidMount();
        this.setState({
            equalModal: !this.state.equalModal
        });
    }
    toggleByItemModal() {
        this.componentDidMount();
        // If it was just opened
        if (this.state.byItemModal === false) {
            this.setState({
                itemsave: this.state,
                byItemModal: true
            });
        } else {
            // If closing without changes
            this.setState(this.state.itemsave);
            this.setState({ byItemModal: false });
        }
    }

    render() {
        return (
            <div>
                <ButtonGroup>
                    <Button outline onClick={this.toggleEqualModal} color="primary">Equally</Button>
                    <EqualOpt {...this.props} updateExpenseCosts={this.props.updateExpenseCosts} totalAmount={this.state.totalAmount} users={this.state.users} modal={this.state.equalModal} toggle={this.toggleEqualModal} />
                    <UnequalOpt {...this.props} updateExpenseCosts={this.props.updateExpenseCosts} totalAmount={this.state.totalAmount} users={this.state.users} modal={this.state.unequalModal} toggle={this.toggleUnequalModal} />
                    <Button outline onClick={this.toggleUnequalModal} color="primary">Unequally</Button>
                    {this.props.expenseReference !== undefined && <ByItemOpt {...this.props} updateExpenseCosts={this.props.updateExpenseCosts} items={this.props.items} totalAmount={this.state.totalAmount} users={this.state.users} modal={this.state.byItemModal} toggle={this.toggleByItemModal} />}
                    {this.props.expenseReference !== undefined && <Button outline onClick={this.toggleByItemModal} color="primary">By Item</Button>}
                    
                </ButtonGroup>
            </div>
        );
    }
}
export default SplitOptions;
