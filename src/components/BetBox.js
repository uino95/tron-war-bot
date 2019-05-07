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
  Button
} from "shards-react";

export default class BetBox extends React.Component{
  
  constructor(props) {
    super(props);

    this.state = {
      accountAddress: "account address will show up here",
      accountBalance: "account balance will show up here",
      accountBandwidth: "account bandwidth will show up here"
    };
  }

  componentDidMount() {
//    this.fetchAccountAddress();
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

  render(){
    const { accountAddress, accountBalance, accountBandwidth } = this.state;
    return (
      <ListGroup flush>
        <ListGroupItem className="p-3">
          <Row>
            <Col>
              <Form>
                
                <FormGroup>
                  <label htmlFor="feInputAddress">Bet Amount</label>
                  <FormInput id="feInputAddress" defaultValue={10} />
                </FormGroup>

                <FormGroup>
                  <label htmlFor="feInputAddress2">TRX BAlance</label>
                  <FormInput
                    value = {accountBalance}
                    readOnly
                  />
                </FormGroup>

                <FormGroup>
                  <label htmlFor="feInputAddress2">Current PayBack</label>
                  <FormInput
                    value = {3}
                    readOnly
                  />
                </FormGroup>

                <Button type="submit">Bet</Button>
              </Form>
            </Col>
          </Row>
        </ListGroupItem>
      </ListGroup>
  )}
}
