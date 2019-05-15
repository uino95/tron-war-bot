import React from "react";
import {
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Form,
  FormInput,
  FormGroup,
  FormCheckbox,
  FormSelect,
  Button,
  InputGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Alert
} from "shards-react";

import axios from 'axios'

import {connect} from 'react-redux'
import {selectedNations} from '../redux/selector'
import {selectNation} from '../redux/actions'

class BetBox extends React.Component{

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);

    this.state = {
      accountAddress: undefined,
      accountBalance: undefined,
      accountBandwidth: undefined,
      dropdown:false,
      betAmount: 10,
      visible: false,
      countdown: 0,
      timeUntilDismissed: 2,
      success: false,
      alertText: 'none'
    };
  }

  componentDidMount() {
    this.fetchAccountAddress();
    this.fetchAccountBalance();
//    this.fetchAccountBandwidth();
  }

  async fetchAccountBalance() {
    const balanceInSun = await window.tronWeb.trx.getBalance(); //number
    const balanceInTRX = window.tronWeb.fromSun(balanceInSun); //string
    // const changeBackToSun = window.tronWeb.toSun(balanceInTRX); //string

    this.setState({
      accountBalance: balanceInTRX
    });
  }

  async fetchAccountAddress() {
    const account = await window.tronWeb.trx.getAccount();
    const accountAddress = account.address; // HexString(Ascii)
    // const accountAddressInBase58 = window.tronWeb.address.fromHex(
    //   accountAddress
    // ); // Base58
    console.log(accountAddress)
    this.setState({
      accountAddress: accountAddress
    });
  }

  toggle(which) {
    const newState = { ...this.state };
    newState[which] = !this.state[which];
    this.setState(newState);
  }

  showAlert = (result, data) => {
    this.clearInterval();
    this.setState({ visible: true, countdown: 0, timeUntilDismissed: 5, success: result, alertText: data});
    this.interval = setInterval(this.handleTimeChange, 1000);
  }

  handleTimeChange = () => {
    if (this.state.countdown < this.state.timeUntilDismissed - 1) {
      this.setState({
        ...this.state,
        ...{ countdown: this.state.countdown + 1 }
      });
      return;
    }

    this.setState({ ...this.state, ...{ visible: false } });
    this.clearInterval();
  }

  clearInterval = () => {
    clearInterval(this.interval);
    this.interval = null;
  }


  handleClick = (event) => {
    console.log(event.target.value)
  //   const currentNation = event.properties.name
  //   console.log("clicked on ", currentNation)
  //   this.props.selectNation(currentNation)
  //   console.log("nations: ", this.props.nations)
  }

  handleChange = (event) => {
    this.setState(
      {betAmount: event.target.value}
    )
  }

  handleSubmit = (e) => {

    const bet = {
      address: this.state.accountAddress,
      amount: this.state.betAmount,
      state: this.props.selectedNations
    }

    if(bet.address !== undefined && bet.amount && bet.state.length > 0){
      // actually do the transaction and verify that is ok
      axios.post('http://localhost:4000/bets/add', bet)
        .then(res => {
            console.log(res.data)
            res.status === 200 ? this.showAlert(true, "transaction executed succesfully") : this.showAlert(false, "transaction not executed")
          }
        );

    }
    else if (bet.address === undefined){
      this.showAlert(false, "address undefined")
    } else if (bet.state.length === 0){
      this.showAlert(false, "you have to select at list one state")
    }

  }

  render(){
    const { accountAddress, accountBalance, accountBandwidth } = this.state;
    return (
      <ListGroup flush>
        <ListGroupItem className="p-3">
          <Row>
            <Col>
              <Form>
              {/*}
                <InputGroup className="mb-3">
                  <FormInput />
                  <Dropdown
                    open={this.state.dropdown}
                    toggle={() => this.toggle("dropdown")}
                    addonType="append"
                  >
                    <DropdownToggle caret>Dropdown</DropdownToggle>
                    <DropdownMenu small right>
                      {this.props.nations.map((geography,id) => {
                        return (
                          <DropdownItem key={id} onClick={this.handleClick()}>{geography.properties.name}</DropdownItem>
                        )
                      })}
                    </DropdownMenu>
                  </Dropdown>
                </InputGroup>
              */}

                <FormGroup>
                  <label>Bet Amount</label>
                  <FormInput onChange={(event) => this.handleChange(event)} id="betAmount" defaultValue={10}/>
                </FormGroup>

                <FormGroup>
                  <label htmlFor="TRXBalance">TRX BAlance</label>
                  <FormInput
                    value = {accountBalance}
                    readOnly
                  />
                </FormGroup>

                <FormGroup>
                  <label htmlFor="currentPayBack">Current PayBack</label>
                  <FormInput
                    value = {3}
                    readOnly
                  />
                </FormGroup>

                <label>Seleceted States</label>
                {this.props.selectedNations.length > 0 ? (
                <ListGroup>
                  {this.props.selectedNations.map((nation,id) => {
                    return (
                      <ListGroupItem key={id}>{nation}</ListGroupItem>
                    )
                  })}
                </ListGroup>) : (
                  <ListGroupItem> no nation selected </ListGroupItem>
                )}


                <Button  onClick={(bet) => this.handleSubmit(bet)}>Bet</Button>
                <Alert className="mb-3" open={this.state.visible} theme={this.state.success ? "success" : "danger"}>
                  {this.state.alertText}
                </Alert>
              </Form>
            </Col>
          </Row>
        </ListGroupItem>
      </ListGroup>
  )}
}

const mapStateToProps = state => ({
  selectedNations: selectedNations(state)
});

const mapDispatchToProps = dispatch => ({
  selectNation: (nation) => dispatch(selectNation(nation)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BetBox);
