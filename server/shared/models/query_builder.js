const { curry, pipe } = require('ramda');

/*
 * Query builder utilities
 *
 * Functions to build simple SELECT/INSERT/UPDATE queries
 */

/**
 * pg queryObject
 * @typedef {Object} QueryObject
 * @property {String} text - sql query
 * @property {String[]} values - parameterised values
 */

/**
 * options
 * @typedef {Object} Options
 * @property {Object} where - { [column_name]: string }
 * @property {Object} between - { column: string, values: string [] }
 * @property {String} sort - column name to sort by
 * @property {Object} pagination - { offset: int } 
//  * @property {String} returning
 */

/**
 * Dependant on options adds where clause and values to query object 
 * @param   {Options} 
 * @param   {QueryObject} 
 * @returns {QueryObject}   
 */

const addWhereClause = curry((options, queryObj) => {
  const parameter = queryObj.values.length;
  
  if (options.where) {
    const whereClause = `${Object.keys(options.where).map((k, i) => `${k}=$${i + 1 + parameter}`).join(' AND ')}`;

    return {
      text: `${queryObj.text} WHERE ${whereClause}`,
      values: [...queryObj.values, ...Object.values(options.where)],
    };
  }
   return queryObj;
});

/**
 * Dependant on options adds between clause and values to query object 
 * @param   {Options} 
 * @param   {QueryObject} 
 * @returns {QueryObject}   
 */

const addBetweenClause = curry((options, queryObj) => {
  const parameter = queryObj.values.length + 1;
  
  if (options.between) {
    const betweenClause = `${options.between.column} BETWEEN  $${parameter} AND $${parameter + 1}`;
    const joiner = options.where ? ` AND ` : ` WHERE `;
    return {
      text: `${queryObj.text} ${joiner} ${betweenClause}`,
      values: [...queryObj.values, ...options.between.values],
    };
    
  }
   return queryObj;
});

/**
 * Dependant on options adds sort clause to query object 
 * @param   {Options} 
 * @param   {QueryObject} 
 * @returns {QueryObject}   
 */

const addSortClause = curry((options, queryObj) => {

  if (options.sort) {
    return {
      text: `${queryObj.text} ORDER BY ${options.sort}`,
      values: [...queryObj.values],
    };
  }
   return queryObj;
});

/**
 * Dependant on options adds pagination clause and values to query object 
 * @param   {Options} 
 * @param   {QueryObject} 
 * @returns {QueryObject}   
 */

const addPagination = curry((options, queryObj) => {
  const parameter = queryObj.values.length + 1;

  if (options.pagination) {
    const offset = options.pagination.offset === 1
      ? 0
      : options.pagination.offset * 10 - 10;

    return {
      text: `${queryObj.text} LIMIT 10 OFFSET $${parameter}`,
      values: [...queryObj.values, offset],
    };
  }
   return queryObj;
});


/**
 * Generates SELECT query object with `text` and `value` fields
 * @param   {String}   table      Table name
 * @param   {String[]} columns    Columns to select
 * @param   {Options}  
 * @returns {QueryObject} {}              
 */
const selectQuery = (table, columns, options) => {
  const prefix = options.pagination ? `COUNT(*) OVER() AS full_count,` : ``;
  const base = `SELECT ${prefix} ${columns.join(', ')} FROM ${table}`;
  const queryObject = { text: base, values: [] };

  const queryPipe = pipe(
    addWhereClause(options), 
    addBetweenClause(options), 
    addSortClause(options), 
    addPagination(options));

  const value = queryPipe(queryObject);
  console.log(value);
  return value;
};

/**
 * Generates INSERT query object with `text` and `value` fields
 * @param   {String} table          Table name
 * @param   {Object} values         { column-name: value-to-insert }
 * @param   {String} [returning=''] Returning clause, raw
 * @returns {Query}                 { text: String, values: Array }
 */
const insertQuery = (table, values, returning = '') => {
  const base = `INSERT INTO ${table}`;
  const keys = Object.keys(values);
  const columns = `(${keys.join(', ')})`;
  const vals = `(${keys.map((_, i) => `$${i + 1}`).join(', ')})`;
  const suffix = returning ? `RETURNING ${returning}` : '';

  return { text: `${base} ${columns} VALUES ${vals} ${suffix}`.trim(), values: Object.values(values) };
};


/**
 * Generates UPDATE query object with `text` and `value` fields
 * @param   {String} table          Table name
 * @param   {Object} values         { column-name: value-to-insert }
 * @param   {Object} [where={}]     Constraint object
 * @param   {String} [returning=''] Returning clause, raw
 * @returns {Query}                 { text: String, values: Array }
 */
const updateQuery = (table, values, where = {}, returning = '') => {
  const suffix = returning ? `RETURNING ${returning}` : '';
  const base = `UPDATE ${table} SET`;
  const keys = Object.keys(values);
  const hasWhere = Object.keys(where).length > 0;
  const set = keys
    .reduce((acc, key, i) => acc.concat(`${key}=$${i + 1}`), [])
    .join(', ');

  const queryObj = { text: `${base} ${set} ${suffix}`.trim(), values: Object.values(values) };

  if (hasWhere) {
    const [whereText, whereVals] = whereClause(where, keys.length);
    return {
      text: `${base} ${set} ${whereText} ${suffix}`.trim(),
      values: Object.values(values).concat(whereVals),
    };
  }

  return { text: `${base} ${set} ${suffix}`.trim(), values: Object.values(values) };
};


module.exports = {
  selectQuery,
  insertQuery,
  updateQuery,
};
