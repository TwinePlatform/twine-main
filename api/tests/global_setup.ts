/*
 * Global setup for Jest test runner
 *
 * This is run once before any tests run and before the framework is
 * installed into the runtime
 */
import * as Knex from 'knex';
import { getConfig } from '../config';
import { insertData } from '../database/tools';
import configureRedis from '../database/redis/configure';
const { migrate } = require('../database');


module.exports = async () => {
  const config = getConfig(process.env.NODE_ENV);
  const client = Knex(config.knex);

  await migrate.teardown({ client });
  await client.migrate.latest();
  await insertData(config, client, 'testing');
  await client.destroy();

  await configureRedis(config);
};
