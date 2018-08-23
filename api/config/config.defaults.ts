/*
 * Configuration defaults
 *
 * Can also hold non-secret, environment-invariant configuration
 * Merged into environment-specific configurations
 */
import * as path from 'path';
import { Environment } from './types';

export default {
  root: path.resolve(__dirname, '..'),
  env: Environment.DEVELOPMENT,
  web: {
    host: 'localhost',
    port: 1000,
    tls: null,
    router: {
      stripTrailingSlash: true,
    },
    routes: {
      cors: {
        origin: ['https://visitor.twine-together.com'],
        credentials: true,
        additionalExposedHeaders: ['set-cookie'],
      },
    },
  },
  knex: {
    client: 'pg',
    connection: {
      host: null,
      port: null,
      database: null,
      user: null,
      ssl: false,
    },
  },
  secret: {
    jwt_secret: process.env.JWT_SECRET,
  },
  qrcode: {
    secret: process.env.QRCODE_HMAC_SECRET,
  },
  cookies: {
    token : {
      ttl: 24 * 60 * 60 * 1000,
      isSecure: true,
      isHttpOnly: true,
      isSameSite: 'Lax',
      path: '/',
    },
  },
};
