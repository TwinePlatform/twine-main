/*
 * Server initialisation and configuration
 */
import * as Hapi from '@hapi/hapi';
import * as qs from 'qs';
import { Dictionary } from 'ramda';
import v1 from './api/v1';
import webhooks from './webhooks/v1';
import setup from './setup';
import { Config } from '../config/types';
import Logger from './services/logger';
import Caches from './cache';


const queryParser = (raw: Dictionary<string>) => qs.parse(qs.stringify(raw));


const init = async (config: Config): Promise<Hapi.Server> => {

  const Hapi = require('@hapi/hapi');
  const Joi = require("@hapi/joi");


  const server = Hapi.Server({
    ...config.web,
    query: { parser: queryParser },
    cache: Caches(config),
  });

  setup(server, config);
  
  server.validator(Joi);

  await server.register([
    {
      plugin: Logger,
      options: { env: config.env },
    },
    {
      plugin: v1,
      routes: { prefix: '/v1' },
    },
    {
      plugin: webhooks,
      routes: { prefix: '/webhooks/v1' },
    },
  ]);

  return server;
};

/* istanbul ignore next */
const start = async (server: Hapi.Server) => {
  await server.start();
  return server;
};

export { init, start };
