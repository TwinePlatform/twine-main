/*
 * Pre-requisites, global objects and other setup
 */
import { Config } from '../config/types';

import * as Hapi from '@hapi/hapi';
import * as Knex from 'knex';
import Service, { EmailService } from './services/email';


// Extend declaration from hapi
declare module '@hapi/hapi' {
  interface Server {
    shutdown: (a?: boolean) => Promise<void>;
  }

  interface Request {
    knex: Knex;
  }

  interface ServerApplicationState {
    config: Config;
    knex: Knex;
    EmailService: EmailService;
  }
}

export default (server: Hapi.Server, config: Config) => {
  server.app.config = config;
  server.app.knex = Knex(config.knex);
  server.app.EmailService = Service;

  server.decorate('server', 'shutdown', async (graceful = true) => {
    /* istanbul ignore else */
    if (graceful) {
      await server.stop();
      return server.app.knex.destroy();

    } else {
      return process.exit(1);

    }
  });
};
