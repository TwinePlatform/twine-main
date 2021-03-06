import * as Hapi from '@hapi/hapi';
import * as Knex from 'knex';
import { init } from '../../../../../tests/utils/server';
import { getConfig } from '../../../../../config';
import { User, Users, Organisations, Organisation } from '../../../../models';
import { Credentials as StandardCredentials } from '../../../../auth/strategies/standard';
import { ExternalCredentials, name as ExtName } from '../../../../auth/strategies/external';
import { injectCfg } from '../../../../../tests/utils/inject';
import { expectationFailed } from '@hapi/boom';


describe('GET /community-businesses', () => {
  let server: Hapi.Server;
  let knex: Knex;
  let twAdmin: User;
  let cbAdmin: User;
  let volunteer: User;
  let organisation: Organisation;
  let twAdminCreds: Hapi.AuthCredentials;
  let cbAdminCreds: Hapi.AuthCredentials;
  let volunteerCreds: Hapi.AuthCredentials;
  let extCreds: Hapi.AuthCredentials;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);
    knex = server.app.knex;

    twAdmin = await Users.getOne(knex, { where: { name: 'Big Boss' } });
    cbAdmin = await Users.getOne(knex, { where: { name: 'Gordon' } });
    volunteer = await Users.getOne(knex, { where: { name: 'Emma Emmerich' } });
    organisation = await Organisations.getOne(knex, { where: { name: 'Black Mesa Research' } });
    // This is only needed b/c the TWINE_ADMIN is registered to a ORG
    // In fact, TWINE_ADMIN users shouldn't be registered against any ORG
    // Data model, however, doesn't currently support this.
    const aperture = await Organisations.getOne(knex, { where: { name: 'Aperture Science' } });
    twAdminCreds = await StandardCredentials.create(knex, twAdmin, aperture);
    cbAdminCreds = await StandardCredentials.create(knex, cbAdmin, organisation);
    volunteerCreds = await StandardCredentials.create(knex, volunteer, organisation);
    extCreds = await ExternalCredentials.get(knex, 'aperture-token');
  });

  afterAll(async () => {
    await server.shutdown(true);
  });

  describe('GET /community-businesses', () => {
    test('success:: user TWINE_ADMIN return list of all cbs', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses',
        credentials: twAdminCreds,
      }));

      expect(res.statusCode).toBe(200);
      expect((<any>res.result).result).toHaveLength(2);
    });

    test.only('success:: definate pass', async () => {

    });

    test('success: admin code fields query returns subset of cbs', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses?fields[]=adminCode&fields[]=name',
        credentials: twAdminCreds,
      }));

      expect(res.statusCode).toBe(200);
      expect((<any>res.result).result).toEqual(expect.arrayContaining([
        { adminCode: '10101', name: 'Aperture Science' },
        { adminCode: '70007', name: 'Black Mesa Research' }])
      );
    });

    test('Fetching collection returns only list that user is authorised for', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses',
        credentials: cbAdminCreds,
      }));

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /community-businesses/me', () => {
    test('Returns CB that CB_ADMIN is authenticated against', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me',
        credentials: cbAdminCreds,
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({ _360GivingId: 'GB-COH-9302' }),
      });
      expect(Object.keys((<any>res.result).result)).toHaveLength(16);
    });

    test('Returns CB that VOLUNTEER is authenticated against', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me',
        credentials: volunteerCreds,
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({ _360GivingId: 'GB-COH-9302' }),
      });
      expect(Object.keys((<any>res.result).result)).toHaveLength(16);
    });

    test('can get own CB when using external strategy', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me',
        credentials: extCreds,
        strategy: ExtName,
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({ _360GivingId: 'GB-COH-3205' }),
      });
      expect(Object.keys((<any>res.result).result)).toHaveLength(16);
    });
  });

  describe('GET /community-businesses/:id', () => {
    test('Returns requested CB if user is authorised', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/2',
        credentials: twAdminCreds,
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({ _360GivingId: 'GB-COH-9302' }),
      });
      expect(Object.keys((<any>res.result).result)).toHaveLength(16);
    });

    test('Returns 403 if user is not authorised', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/1',
        credentials: cbAdminCreds,
      }));

      expect(res.statusCode).toBe(403);
    });
  });
});
