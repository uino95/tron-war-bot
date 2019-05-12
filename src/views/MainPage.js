import React from "react";
import PropTypes from "prop-types";
import { Container, Row, Col } from "shards-react";

import PageTitle from "./../components/common/PageTitle";
import SmallStats from "./../components/common/SmallStats";
import UsersOverview from "./../components/blog/UsersOverview";
import UsersByDevice from "./../components/blog/UsersByDevice";
import NewDraft from "./../components/blog/NewDraft";
import Discussions from "./../components/blog/Discussions";
import TopReferrals from "./../components/common/TopReferrals";

import BetBox from "./../components/BetBox"
import Map from "./../components/Map"
import History from "./../components/History"

import {connect} from 'react-redux'

const MainPage = () => (
  <Container fluid className="main-content-container px-4">
    {/* Page Header */}
    <Row noGutters className="page-header py-4">
      <PageTitle title="Tron War Bot" subtitle="Dashboard" className="text-sm-left mb-3" />
    </Row>

    <Row>
      {/* maps of the world */}
      <Col lg="12" md="12" sm="12" className="mb-4">
        <Map />
      </Col>

      {/* history box */}
      <Col lg="4" md="6" sm="12" className="mb-4">
        <History />
      </Col>

      {/* bet box */}
      <Col lg="4" md="6" sm="12" className="mb-4">
        <BetBox />
      </Col>

      {/* run status box */}
      <Col lg="4" md="12" sm="12" className="mb-4">
        <Discussions />
      </Col>

    </Row>
  </Container>
);

const mapStateToProps = state => ({
  
});

const mapDispatchToProps = dispatch => ({
  
});

export default connect(mapStateToProps,mapDispatchToProps)(MainPage);
