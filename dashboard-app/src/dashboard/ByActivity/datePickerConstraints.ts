import moment from 'moment';
import { DateRangePickerConfig } from '../../components/DatePicker/types';

// Date rules:
// all:
// 1. no future dates for either from or to
// 2. from < to
// 3. from >= 01 Jan 2017
//
// activity:
// 4. day picker
// 5. default from: 30 days ago
// 6. default to: now
//
// Activity:
// - min from: 01 Jan 2017     (3)
// - max from: now             (1)
//
// - min to: 01 Jan 2017       (3)
// - max to: now               (1)
//
// - default from: 30 days ago (5)
// - default to: now           (6)
//
// - validate:
//   - from:
//     - from < to || from     (2)
//   - to:
//     - from < to || from     (2)
//
// (1, 2, 3, 4, 5, 6)

const MIN_DATE = moment('2017-01-01');


export const ActivityConfig: DateRangePickerConfig = {
  from: {
    min: () => MIN_DATE.toDate(),
    max: () => moment().toDate(),
    default: () => moment().subtract(30, 'days').toDate(),
    validate: (_from, _to) => {
      const from = moment(_from).startOf('day');
      const to = moment(_to).endOf('day');

      if (from.isAfter(to)) {
        return from.toDate();
      }

      return from.toDate();
    },
  },

  to: {
    min: (from, to) => moment.max(MIN_DATE, moment(from)).toDate(),
    max: () => moment().toDate(),
    default: () => moment().toDate(),
    validate: (_from, _to) => {
      const from = moment(_from).startOf('day');
      const to = moment(_to).endOf('day');

      if (from.isAfter(to)) {
        return from.endOf('day').toDate();
      }

      return to.toDate();
    },
  },
};

export default ActivityConfig;
