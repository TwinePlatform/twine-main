import React, { useEffect, useState, useCallback, FunctionComponent, useContext } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import styled from 'styled-components';
import { Grid, Row, Col } from 'react-flexbox-grid';

import DatePickerConstraints from './datePickerConstraints';
import _LogsDataTable from '../components/DataTable/LogsDataTable';
import UsersDataTable from '../components/DataTable/UsersDataTable';
import UtilityBar from '../components/UtilityBar';
import { H1 } from '../../../lib/ui/components/Headings';
import { DataTableProps } from '../components/DataTable/types';
import { FullScreenBeatLoader } from '../../../lib/ui/components/Loaders';
import { aggregatedToTableData } from '../dataManipulation/aggregatedToTableDataLogs';
import { downloadCsv } from '../dataManipulation/downloadCsvLogs';
import { ColoursEnum } from '../../../lib/ui/design_system';
import Errors from '../components/Errors';
import useAggregateDataByLog from './useAggregateDataByLog';
import { TabGroup } from '../components/Tabs';
import { getTitleForDayPicker } from '../util';
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
const LogsDataTable = styled(_LogsDataTable)`
  margin-top: 4rem;
`;

const Container = styled(Grid)`
`;


/**
 * Helpers
 */
const initTableData = { headers: [], rows: [] };

const initSelectedLog = { ID: 42, name: "ET" };

/**
 * Component
 */
const ByLog: FunctionComponent<RouteComponentProps> = () => {
  const { unit } = useContext(DashboardContext);
  const [fromDate, setFromDate] = useState<Date>(DatePickerConstraints.from.default());
  const [toDate, setToDate] = useState<Date>(DatePickerConstraints.to.default());
  const [tableData, setTableData] = useState<TableData>(initTableData);
  const [tableDataProjects, setTableDataProjects] = useState<TableData>(initTableData);
  const { loading, error, data, logFields, dataProjects, projectFields } =
    useAggregateDataByLog({ from: fromDate, to: toDate });

  // set and clear errors on response
  const [errors, setErrors] = useErrors(error, data);

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
    if (!loading && data && dataProjects && logFields && projectFields) {
      setTableData(aggregatedToTableData({ data, unit, yData: logFields }));
      setTableDataProjects(aggregatedToTableData({ data: dataProjects, unit, yData: projectFields }));
    }
  }, [logFields, data, dataProjects, loading, unit]);

  const downloadAsCsv = useCallback(() => {
    if (!loading && data) {
      downloadCsv({ data, fromDate, toDate, fileName: 'activity', unit, orderable })
        .catch((error) => setErrors({ Download: error.message }));
    } else {
      setErrors({ Download: 'No data available to download' });
    }
  }, [loading, data, fromDate, toDate, unit, orderable, setErrors]);

  return (
    <Container>
      <Row center="xs">
        <Col>
          <H1>{TitlesCopy.Logs.title}</H1>
        </Col>
      </Row>
      <Row center="xs">
        <Col xs={12}>
          <UtilityBar
            dateFilter="day"
            datePickerConstraint={DatePickerConstraints}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onDownloadClick={downloadAsCsv}
          />
        </Col>
      </Row>
      {
        loading
          ? (<FullScreenBeatLoader color={ColoursEnum.purple} />)
          : (
            <Row center="xs">
              <Col xs={12}>
                <Errors errors={errors} />
                <TabGroup 
                    titles={['Users','Projects']}
                >
                  {
                    tableData && (
                    <div>
                        <UsersDataTable
                        {...tableData}
                        title={getTitleForDayPicker("Users", fromDate, toDate)}
                        sortBy={tableData.headers[orderable.sortByIndex]}
                        order={orderable.order}
                        onChangeSortBy={onChangeSortBy}
                        showTotals
                      />
                    </div>
                    )
                  }
                 
                  
                </TabGroup>
              </Col>
            </Row>
          )
      }
    </Container>
  );
};

export default withRouter(ByLog);
