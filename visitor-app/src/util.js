import { curry, mergeDeepRight, pick, map, compose, filter, uniq, keys } from 'ramda';
import { ErrorUtils } from './api';


/**
 * Takes an object describing a mapping between strings,
 * and transforms a given object's keys according to the map
 *
 * @example
 * renameKeys({ a: b }, { a: 1, c: 2 })
 * // returns { b: 1, c: 2 }
 *
 * @param   {Object} keyMap Keys you have -> keys you want
 * @param   {Object} obj    Object with keys to map
 * @returns {Object}        Object with keys you want
 */
export const renameKeys = curry((keyMap, obj) => // eslint-disable-line import/prefer-default-export
  Object
    .keys(obj)
    .reduce((acc, key) => {
      acc[keyMap[key] || key] = obj[key];
      return acc;
    }, {}));


/**
 * Decorates given promise with method to cancel resolution
 * of the promise.
 *
 * NOTE: Promises are _eager_, so this does not cancel the async
 * job the function is performing, it mergely prevents the promise
 * from ever resolving.
 * @param   {Promise} p Promise to make cancellable
 * @returns {Promise}   Cancellable promise
 */
export const toCancellable = (p) => {
  let hasCancelled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    p.then(
      (value) => {
        if (hasCancelled) {
          wrappedPromise.isCancelled = true;
          return null;
        }

        return resolve(value);
      },
      (error) => {
        if (hasCancelled) {
          wrappedPromise.isCancelled = true;
          return null;
        }

        return reject(error);
      },
    );
  });

  wrappedPromise.cancel = () => {
    hasCancelled = true;
  };

  return wrappedPromise;
};

/**
 * Utility function to support client-side redirects based on
 * common status codes
 *
 * Allows passing custom redirects to override defaults
 */
export const redirectOnError = (historyPush, error, custom = {}) => {
  const defaults = {
    400: '/error/400',
    401: '/login',
    403: '/login',
    404: '/error/404',
    500: '/error/500',
    default: '/error/unknown',
  };

  const redirs = mergeDeepRight(defaults, custom);

  if (ErrorUtils.errorStatusEquals(error, 400)) {
    historyPush(redirs[400]);

  } else if (ErrorUtils.errorStatusEquals(error, 401)) {
    historyPush(redirs[401]);

  } else if (ErrorUtils.errorStatusEquals(error, 403)) {
    historyPush(redirs[403]);

  } else if (ErrorUtils.errorStatusEquals(error, 500)) {
    historyPush(redirs[500]);

  } else if (ErrorUtils.errorStatusEquals(error, 404)) {
    historyPush(redirs[404]);

  } else {
    historyPush(redirs.default);
  }
};


// pairs :: Groups elements of array into pairs
// pairs :: [a] -> [[a]]
export const pairs = xs =>
  xs.reduce((acc, x, i) => // eslint-disable-line no-confusing-arrow
    (i % 2 === 0)
      ? acc.concat([xs.slice(i, i + 2)])
      : acc
  , []);

// combineValues :: [{ k: v }] -> { k: [v] }
const combineValues = os =>
  os.reduce((acc, v) => {
    Object.keys(v)
      .forEach((k) => {
        acc[k] = (acc[k] || []).concat(v[k]);
      });
    return acc;
  }, {});

// reduceVisitorsToFields :: [Visitor] -> [Fields]
export const reduceVisitorsToFields =
  compose(
    keys,
    filter(fs => uniq(fs).length > 1), // keep fields that have at least two different values
    filter(fs => fs.some(f => f !== null)), // keep fields that have at least one non-null value
    combineValues, // concat all values for given keys
    map(pick(['name', 'email', 'postCode', 'phoneNumber', 'birthYear'])), // pick relevant keys
  );


export const status = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

