import { DataTableRow } from '../../components/DataTable/types';
import DateRange from '../../util/dateRange';
import { UnitEnum } from '../../types';

interface Params { data: any[]; months: string[]; unit: UnitEnum; }

export const timeLogsToTable = ({ data, months, unit }: Params) =>
  data.reduce((acc: DataTableRow[], el: any) => {
    const activityExists = acc.some((x) => x.columns.Activity.content === el.activity);
    if (activityExists) {
      return acc.map((x) => {
        if (x.columns.Activity.content === el.activity) {
          const logMonth = DateRange.months[new Date(el.createdAt).getMonth()];
          x.columns[logMonth].content = Number(x.columns[logMonth].content) + 1;
        }
        return x;
      });
    }
    const monthsContent = months.map((m: string) => ({ [m]: { content: 1 } }));
    const newRow = {
      columns: Object.assign({
        Activity: { content: el.activity, },
        [`Total ${unit}`]: { content: 0 },
      }, ...monthsContent),
    };
    return acc.concat(newRow);
  }, [])
  .map((x) => {
    const total = Object.values(x.columns).reduce((total, cell) =>
      typeof cell.content === 'number' ? total + cell.content : total, 0);
    return {
      ...x,
      columns: {
        ...x.columns,
        [`Total ${unit}`]: { content: total },
      },
    };
  });
