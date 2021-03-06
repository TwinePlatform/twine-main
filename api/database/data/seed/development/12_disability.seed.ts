import * as Knex from 'knex';

exports.seed = (knex: Knex) =>
  knex('disability')
    .insert([
      { disability_name: 'yes' },
      { disability_name: 'no' },
      { disability_name: 'prefer not to say' },
      { disability_name: 'not applicable' },
    ]);
