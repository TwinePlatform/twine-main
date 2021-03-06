import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { H1, H3 } from '../lib/ui/components/Headings';


const HoldingPage: React.FunctionComponent = () => (
  <Grid>
    <Row center="xs" middle="xs" style={{ height: '100vh' }}>
      <Col>
        <H1>Twine Volunteer Dashboard</H1>
        <H3>Coming Soon...</H3>
      </Col>
    </Row>
  </Grid>
);

export default HoldingPage;
