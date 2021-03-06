/*
 * Utilities for data processing (see ./data.js)
 */
import moment from 'moment';
import { curry, pick, zip, identity, toPairs, head, last, map, assoc, assocPath, mergeWith, add, uniq, fromPairs, mergeDeepWith, mergeRight } from 'ramda';
import { collectBy, mapValues, ones, combineValues } from '../../../../util';
import { createAgeGroups, Gender, BirthYear } from '../../../../shared/constants';
import DateRanges, { DateRangesEnum } from './dateRange';

export const AgeGroups = createAgeGroups(['0-17', '18-34', '35-50', '51-69', '70+']);

// normaliseDate :: DateRangeEnum -> DateLike -> Moment
const normaliseDate = curry((dateRange, d) =>
  dateRange === DateRangesEnum.LAST_MONTH
    ? moment(d).startOf('isoWeek')
    : moment(d));

// isAgeGiven :: Log -> Boolean
// const isAgeGiven = log => typeof log.birthYear === 'number';

// count :: { k: [a] } -> { k: Number }
const count = o => mapValues(xs => xs.length, o);

export const VisitsStats = {
  // calculateGenderStatistics :: [Log] -> { k: Number }
  calculateGenderStatistics: logs => count(collectBy(log => Gender.toDisplay(log.gender), logs)),

  // calculateAgeGroupStatistics :: [Log] -> { k: Number }
  calculateAgeGroupStatistics: logs =>
    count(collectBy(
      identity,
      logs.map(l => AgeGroups.fromBirthYear(l.birthYear)),
    )),

  // calculateCategoryStatistics :: [Log] -> { k: Number }
  calculateCategoryStatistics: logs =>
    count(collectBy(log => log.category, logs)),

  // calculateActivityStatistics :: [Log] -> { category: { activity: Number } }
  calculateActivityStatistics: logs =>
    mapValues(
      ls => count(collectBy(l => l.visitActivity, ls)),
      collectBy(log => log.category, logs),
    ),

  // calculateTimePeriodStatistics :: (Date, Date, DateRangeEnum, [Log]) -> { k: Number }
  calculateTimePeriodStatistics: (_since, _until, dateRange, logs) => {
    const since = normaliseDate(dateRange, _since);
    const until = normaliseDate(dateRange, _until);
    const zeros = DateRanges.zeroPadObject(since, until, dateRange, {});

    const stats = count(collectBy(
      identity,
      logs.map(log =>
        normaliseDate(dateRange, log.createdAt).format(DateRanges.toFormat(dateRange))),
    ));

    return mergeRight(zeros, stats);
  },
};

export const VisitorStats = {
  // calculateGenderStatistics :: [VisitorWithVisitData] -> { k: Number }
  calculateGenderStatistics: visitors =>
    count(collectBy(log => Gender.toDisplay(log.gender), visitors)),

  // calculateAgeGroupStatistics :: [VisitorWithVisitData] -> { k: Number }
  calculateAgeGroupStatistics: visitors =>
    count(collectBy(
      identity,
      visitors.map(v => AgeGroups.fromBirthYear(v.birthYear)),
    )),

  // calculateCategoryStatistics :: [VisitorWithVisitData] -> { k: Number }
  calculateCategoryStatistics: visitors =>
    visitors.reduce((acc, visitor) => {
      const cats = uniq(visitor.category);
      const categoriesCount = fromPairs(zip(cats, ones(cats.length)));
      return mergeWith(add, acc, categoriesCount);
    }, {}),

  // calculateActivityStatistics :: [VisitorWithVisitData] -> { category: { activity: Number } }
  calculateActivityStatistics: (visitors, activities) => {
    const activityToCategoryMap = activities
      .reduce((acc, act) => assoc(act.name, act.category, acc), {});

    return visitors.reduce((acc, visitor) => {
      const activitiesCount = uniq(visitor.visitActivity)
        .reduce((counts, activity) => {
          const cat = activityToCategoryMap[activity];
          return assocPath([cat, activity], 1, counts);
        }, {});

      return mergeDeepWith(add, acc, activitiesCount);
    }, {});
  },

  // calculateTimePeriodStatistics :: [VisitorWithVisitData] -> { k: Number }
  calculateTimePeriodStatistics: (_since, _until, dateRange, visitors) => {
    const since = normaliseDate(dateRange, _since);
    const until = normaliseDate(dateRange, _until);
    const zeros = DateRanges.zeroPadObject(since, until, dateRange, {});
    const fmt = DateRanges.toFormat(dateRange);
    return visitors.reduce((acc, visitor) => {
      const visitorTotals = visitor.createdAt
        .map(date => normaliseDate(dateRange, date).format(fmt))
        .reduce((counts, date) => assoc(date, date in counts ? counts[date] : 1, counts), {});
      return mergeWith(add, acc, visitorTotals);
    }, zeros);
  },
};

// calculateStepSize :: { k: Number } -> Number
export const calculateStepSize = stats =>
  Math.max(1, Math.floor(Math.max(...Object.values(stats)) / 5));

// formatChartData :: ({ k: v }, [string], { label?: string, sorter: (l, r) -> number }) -> { k: v }
export const formatChartData = (data, bgColor, { label, sorter } = {}) => {
  const pairedData = sorter
    ? toPairs(data)
      .filter(x => x[0] !== BirthYear.NULL_VALUE)
      .sort(sorter)
      .concat(toPairs(data).filter(x => x[0] === BirthYear.NULL_VALUE))
    : toPairs(data);

  const labels = map(head, pairedData);

  const backgroundColor = !Array.isArray(bgColor) && typeof bgColor === 'object'
    ? labels.map(l => bgColor[l])
    : bgColor;

  return {
    labels,
    datasets: [
      {
        label,
        data: map(last, pairedData),
        backgroundColor,
      },
    ],
  };
};


/*
 * Pre-processing of visitor/visits data in order to:
 * - apply filters
 * - make calculating statistics a little simpler
 */
// preProcessVisitors :: ([Visitor], Object, Date, Date) -> [VisitorWithVisitData]
export const preProcessVisitors = (visitors, filters, since, until) => visitors
  // Only keep those visitors whose visits fall within the date range
  // and match the visit activity filter (if set)
  .filter(visitor =>
    visitor.visits.some(visit =>
      new Date(visit.createdAt) >= since
      && new Date(visit.createdAt) <= until
      && (filters.activity ? visit.visitActivity === filters.activity : true),
    ))
  // Collect the values of the 'visitActivity', 'category' and 'createdAt' keys
  // onto the visitor object to make the calculation of statistics more straightforward
  .map(visitor => ({
    ...visitor,
    ...pick(
      ['visitActivity', 'category', 'createdAt'],
      combineValues(
        visitor.visits
          // Only keep those visits which fall within the date range
          // and match the visit activity filter (if set)
          .filter(visit =>
            new Date(visit.createdAt) >= since
            && new Date(visit.createdAt) <= until
            && (filters.activity ? visit.visitActivity === filters.activity : true),
          ),
      ),
    ),
  }));


// isChartJsDataEmpty :: { k: v } -> bool
export const isChartJsDataEmpty = (data) => {
  if (!('datasets' in data)
    || data.datasets.length === 0
    || data.datasets.every(dataset => dataset.data.length === 0)
    || data.datasets.every(dataset => dataset.data.every(datapoint => datapoint === 0))) {
    return true;
  }

  return false;
};
