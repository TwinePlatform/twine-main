import React, { useEffect, useState, useCallback, FunctionComponent } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import styled from 'styled-components';
import { assoc } from 'ramda';
import { Grid, Row, Col } from 'react-flexbox-grid';

import DatePickerConstraints from './datePickerConstraints';
import _DataTable from '../../components/DataTable';
import UtilityBar from '../../components/UtilityBar';
import { H1 } from '../../components/Headings';
import { DataTableProps } from '../../components/DataTable/types';
import { displayErrors } from '../../components/ErrorParagraph';
import { CommunityBusinesses } from '../../api';
import { DurationUnitEnum } from '../../types';
import useRequest from '../../hooks/useRequest';
import { useAggDataOnRes } from '../../hooks/useAggDataOnRes';
import Months from '../../util/months';
import { tableType } from '../../util/dataManipulation/tableType';
import { aggregatedToTableData } from '../../util/dataManipulation/aggregatedToTableData';
import { downloadCsv } from '../../util/dataManipulation/downloadCsv';

const DataTable = styled(_DataTable)`
  margin-top: 4rem;
`;

const Container = styled(Grid)`
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: 100% !important;
`;

const ByActivity: FunctionComponent<RouteComponentProps> = (props) => {
  const [unit, setUnit] = useState(DurationUnitEnum.HOURS);
  const [activities, setActivities] = useState([]);
  const [volunteers, setVolunteers] = useState();
  const [fromDate, setFromDate] = useState(Months.defaultFrom());
  const [toDate, setToDate] = useState(Months.defaultTo());
  const [tableProps, setTableProps] = useState<DataTableProps | null>();
  const [aggData, setAggData] = useState();
  const [errors, setErrors] = useState();

  const { data: logs } = useRequest({
    apiCall: CommunityBusinesses.getLogs,
    params: { since: fromDate, until: toDate },
    updateOn: [fromDate, toDate],
    setErrors,
    push: props.history.push,
  });

  // Onload requests
  useRequest({
    apiCall: CommunityBusinesses.getVolunteerActivities,
    callback: (data) => setActivities(data.map((x: any) => x.name)),
    setErrors,
    push: props.history.push,
  });

  useRequest({
    apiCall: CommunityBusinesses.getVolunteers,
    callback: setVolunteers,
    setErrors,
    push: props.history.push,
  });

  // manipulate data on response
  useAggDataOnRes({
    data: { logs, volunteers },
    conditions: [logs, activities, volunteers],
    updateOn: [logs, unit, activities, volunteers],
    columnHeaders: ['Volunteer Name', ...activities],
    setErrors,
    setAggData,
    unit,
    tableType: tableType.ActivityByName,
  });

  // manipulate data for table
  useEffect(() => {
    if (aggData) {
      setTableProps(aggregatedToTableData({ title: 'Volunteer time on activities', data: aggData })); // tslint:disable-line:max-line-length
    }
  }, [aggData]);

  const onChangeSortBy = useCallback((column: string) => {
    setTableProps(assoc('sortBy', column, tableProps));
  }, [tableProps]);

  return (
    <Container>
      <Row center="xs">
        <Col>
          <H1>By Activity</H1>
        </Col>
      </Row>
      <Row center="xs">
        <Col xs={9}>
          <UtilityBar
            dateFilter="day"
            datePickerConstraint={DatePickerConstraints}
            onUnitChange={setUnit}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onDownloadClick={downloadCsv({ aggData, fromDate, toDate, setErrors, fileName: 'by_activity' })} // tslint:disable:max-line-length
          />
        </Col>
      </Row>
      <Row center="xs">
        <Col xs={9}>
          {displayErrors(errors)}
          {
            tableProps && (
              <DataTable
                {...tableProps}
                initialOrder="desc"
                onChangeSortBy={onChangeSortBy}
                showTotals
              />
            )
          }
        </Col>
      </Row>
    </Container>
  );
};

export default withRouter(ByActivity);
