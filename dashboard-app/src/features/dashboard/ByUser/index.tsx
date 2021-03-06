import React, { useEffect, useState, useCallback, FunctionComponent, useContext } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import styled from 'styled-components';
import { Grid, Row, Col } from 'react-flexbox-grid';

import DatePickerConstraints from './datePickerConstraints';
import UsersDataTable from '../components/DataTable/UsersDataTable';
import { H1 } from '../../../lib/ui/components/Headings';
import { DataTableProps } from '../components/DataTable/types';
import { FullScreenBeatLoader } from '../../../lib/ui/components/Loaders';
import { aggregatedToTableData } from '../dataManipulation/aggregatedToTableDataLogs';
import { ColoursEnum } from '../../../lib/ui/design_system';
import Errors from '../components/Errors';
import useAggregateDataByUser from './useAggregateDataByUser';
import { useErrors } from '../../../lib/hooks/useErrorsLogs';
import { TitlesCopy } from '../copy/titles';
import { useOrderable } from '../hooks/useOrderable';
import { DashboardContext } from '../context';


/**
 * Types
 */
type TableData = Pick<DataTableProps, 'headers' | 'rows'>;



/**
 * Styles
 */
const Container = styled(Grid)`
`;


/**
 * Helpers
 */
const initTableData = { headers: [], rows: [] };

/**
 * Component
 */
const ByUser: FunctionComponent<RouteComponentProps> = () => {
  const { unit } = useContext(DashboardContext);
  const fromDate = DatePickerConstraints.from.default();
  const toDate = DatePickerConstraints.to.default();
  const [tableData, setTableData] = useState<TableData>(initTableData);
  const { loading, error, data, logFields} =
    useAggregateDataByUser({ from: fromDate, to: toDate });

  // set and clear errors on response
  const [errors] = useErrors(error, data);

  // get sorting state values
  const { orderable, onChangeOrderable } = useOrderable({
    initialOrderable: { sortByIndex: 1, order: 'desc' },
    updateOn: [tableData]
  });

  const onChangeSortBy = useCallback((column: string) => {
    const idx = tableData.headers.indexOf(column);
    onChangeOrderable(idx);
  }, [tableData.headers, onChangeOrderable]);

  // manipulate data for table
  useEffect(() => {
    if (!loading && data && logFields) {
      setTableData(aggregatedToTableData({ data, unit, yData: logFields }));
    }
  }, [logFields, data, loading, unit]);

  return (
    <Container>
      <Row center="xs">
        <Col>
          <H1>{TitlesCopy.Users.title}</H1>
        </Col>
      </Row>
      {
        loading
          ? (<FullScreenBeatLoader color={ColoursEnum.purple} />)
          : (
            <Row center="xs">
              <Col xs={12}>
                <Errors errors={errors} />
                  {
                    tableData && (
                    <div>
                        <UsersDataTable
                        {...tableData}
                        title={["Users","Users"]}
                        sortBy={tableData.headers[orderable.sortByIndex]}
                        order={orderable.order}
                        onChangeSortBy={onChangeSortBy}
                        showTotals
                      />
                    </div>
                    )
                  }
              </Col>
            </Row>
          )
      }
    </Container>
  );
};

export default withRouter(ByUser);
