import * as Hapi from '@hapi/hapi';
import * as Knex from 'knex';
import * as moment from 'moment';
import { init } from '../../../../../tests/utils/server';
import { getConfig } from '../../../../../config';
import { User, Users, Organisation, Organisations } from '../../../../models';
import { getTrx } from '../../../../../tests/utils/database';
import { Credentials as StandardCredentials } from '../../../../auth/strategies/standard';
import { injectCfg } from '../../../../../tests/utils/inject';
import { ExternalCredentials } from '../../../../auth/strategies/external';


describe('API v1 :: Community Businesses :: Visit Logs', () => {
  let server: Hapi.Server;
  let knex: Knex;
  let trx: Knex.Transaction;
  let cbAdmin: User;
  let organisation: Organisation;
  let credentials: Hapi.AuthCredentials;
  let extCreds: Hapi.AuthCredentials;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);
    knex = server.app.knex;

    cbAdmin = await Users.getOne(knex, { where: { id: 2 } });
    organisation = await Organisations.getOne(knex, { where: { id: 1 } });
    credentials = await StandardCredentials.create(knex, cbAdmin, organisation);
    extCreds = await ExternalCredentials.get(knex, 'aperture-token');
  });

  afterAll(async () => {
    await server.shutdown(true);
  });

  beforeEach(async () => {
    trx = await getTrx(knex);
    server.app.knex = trx;
  });

  afterEach(async () => {
    await trx.rollback();
    server.app.knex = knex;
  });

  describe('POST', () => {
    test(':: successfully add new visit log', async () => {
      const res = await server.inject(injectCfg({
        method: 'POST',
        url: '/v1/community-businesses/me/visit-logs',
        payload: {
          userId: 1,
          visitActivityId: 2,
          signInType: 'sign_in_with_name',
        },
        credentials,
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({ userId: 1, visitActivityId: 2 }),
      });
    });

    test(':: user from another cb returns error', async () => {
      const res = await server.inject(injectCfg({
        method: 'POST',
        url: '/v1/community-businesses/me/visit-logs',
        payload: {
          userId: 2,
          visitActivityId: 2,
          signInType: 'sign_in_with_name',
        },
        credentials,
      }));

      expect(res.statusCode).toBe(403);
      expect((<any> res.result).error.message)
        .toBe('Visitor is not registered at Community Business');
    });

    test(':: incorrect activity id returns error', async () => {
      const res = await server.inject(injectCfg({
        method: 'POST',
        url: '/v1/community-businesses/me/visit-logs',
        payload: {
          userId: 1,
          visitActivityId: 200,
          signInType: 'sign_in_with_name',
        },
        credentials,
      }));

      expect(res.statusCode).toBe(400);
      expect((<any> res.result).error.message)
        .toBe('Activity not associated to Community Business');
    });
  });

  describe('GET', () => {
    test(':: get all visit logs for a cb', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/visit-logs',
        credentials,
      }));

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).meta).toEqual({ total: 11 });
      expect((<any> res.result).result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            visitActivity: 'Free Running',
            category: 'Sports',
            gender: 'female',
            id: 1,
            userId: 1}),
        ]));
    });

    test(':: filtered visit logs by activity with query', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/visit-logs?'
        + '&filter[visitActivity]=Wear%20Pink',
        credentials,
      }));

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).meta).toEqual({ total: 4 });
      expect((<any> res.result).result).toEqual(
        expect.arrayContaining([
          (<any> expect).not.objectContaining({
            visitActivity: 'Free Running',
            category: 'Sports',
          }),
        ]));
    });

    test(':: filtered visit logs by time with query', async () => {
      const since = moment().subtract(7, 'days').endOf('day').toISOString();
      const until = moment().toISOString();

      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/visit-logs?'
        + `&since=${since}&until=${until}`,
        credentials,
      }));

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).meta).toEqual({ total: 8 });
      expect((<any> res.result).result).toHaveLength(8);
      expect((<any> res.result).result).toEqual(
        expect.arrayContaining([
          (<any> expect).not.objectContaining({
            visitActivity: 'Free Running',
            category: 'Sports',
          }),
        ]));
    });

    test(':: filtered visit logs by time and age with query', async () => {
      const since = moment().subtract(7, 'days').endOf('day').toISOString();
      const until = moment().toISOString();

      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/visit-logs?'
        + `&since=${since}&until=${until}&filter[age][]=23&filter[age][]=48`,
        credentials,
      }));

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).meta).toEqual({ total: 7 });
      expect((<any> res.result).result).toHaveLength(7);
      expect((<any> res.result).result).toEqual(
        expect.arrayContaining([
          (<any> expect).not.objectContaining({
            visitActivity: 'Free Running',
            category: 'Sports',
          }),
        ]));
    });

    test(':: accessible via external strategy', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/visit-logs',
        credentials: extCreds,
        strategy: 'external',
      }));

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).meta).toEqual({ total: 11 });
      expect((<any> res.result).result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            visitActivity: 'Free Running',
            category: 'Sports',
            gender: 'female',
            id: 1,
            userId: 1}),
        ]));
    });
  });
});
