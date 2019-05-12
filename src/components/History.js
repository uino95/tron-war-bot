import React from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "shards-react";

import axios from 'axios'

const maxStringLength = 20

class History extends React.Component{

  constructor(props) {
    super(props);
    this.state = {bets: []};
  }

  componentDidMount() {
    axios.get('http://localhost:4000/bets/')
      .then(response => {
          this.setState({ bets: response.data });
      })
      .catch(function (error){
          console.log(error);
      })
  }

  render(){
    return(
      <Container fluid className="main-content-container px-4">

        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">History</h6>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <table className="table mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col" className="border-0">
                        Address
                      </th>
                      <th scope="col" className="border-0">
                        Bet 
                      </th>
                      <th scope="col" className="border-0">
                        Nation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                {/* show just the last five*/}
                    {this.state.bets.slice(this.state.bets.length - 5, this.state.bets.length).reverse().map((bet, i) => 
                     (
                        <tr>
                          <td>{bet.address.length < maxStringLength ? bet.address : bet.address.substring(0,maxStringLength-3).concat('...')}</td>
                          <td>{bet.amount}</td>
                          <td>{bet.state}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default History;
