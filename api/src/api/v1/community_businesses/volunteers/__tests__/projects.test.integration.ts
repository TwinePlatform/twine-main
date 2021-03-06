import * as Hapi from '@hapi/hapi';
import * as Knex from 'knex';
import { init } from '../../../../../../tests/utils/server';
import { getConfig } from '../../../../../../config';
import { CommunityBusinesses, Organisation, User, Volunteers, VolunteerLogs } from '../../../../../models';
import { Credentials as StandardCredentials } from '../../../../../auth/strategies/standard';
import { injectCfg } from '../../../../../../tests/utils/inject';
import { getTrx } from '../../../../../../tests/utils/database';


describe('API /community-businesses/me/volunteers/projects', () => {
  let server: Hapi.Server;
  let knex: Knex;
  let trx: Knex.Transaction;
  let organisation: Organisation;
  let vol: User;
  let volAdmin: User;
  let volCreds: Hapi.AuthCredentials;
  let adminCreds: Hapi.AuthCredentials;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);
    knex = server.app.knex;
    organisation = await CommunityBusinesses.getOne(knex, { where: { id: 2 } });
    vol = await Volunteers.getOne(knex, { where: { name: 'Emma Emmerich' } });
    volAdmin = await Volunteers.getOne(knex, { where: { name: 'Raiden' } });

    volCreds = await StandardCredentials.create(knex, vol, organisation);
    adminCreds = await StandardCredentials.create(knex, volAdmin, organisation);
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

  describe('GET /community-businesses/me/volunteers/projects', () => {
    test('can fetch own projects', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/volunteers/projects',
        credentials: volCreds,
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: [
          { name: 'Party', organisationId: organisation.id },
          { name: 'Take over the world', organisationId: organisation.id },
        ].map(expect.objectContaining),
      });
    });

    test('cannot fetch other orgs projects', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/2/volunteers/projects',
        credentials: volCreds,
      }));

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /community-businesses/me/volunteers/projects', () => {
    test('can create new project for own org', async () => {
      const res = await server.inject(injectCfg({
        method: 'POST',
        url: '/v1/community-businesses/me/volunteers/projects',
        credentials: adminCreds,
        payload: {
          name: 'new project',
        },
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({
          organisationId: organisation.id,
          name: 'new project',
        }),
      });

      const res2 = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/volunteers/projects',
        credentials: adminCreds,
      }));

      expect(res2.statusCode).toBe(200);
      expect((<any> res2.result).result).toHaveLength(3);
    });

    test('cannot create project with a duplicate name', async () => {
      const res = await server.inject(injectCfg({
        method: 'POST',
        url: '/v1/community-businesses/me/volunteers/projects',
        credentials: adminCreds,
        payload: { name: 'Party' },
      }));

      expect(res.statusCode).toBe(409);
      expect(res.result)
        .toEqual({ error: expect.objectContaining({ message: 'Cannot add duplicate project' }) });
    });

    // General {id} routes not implemented yet, remove the 'skip' when they are
    test.skip('cannot create new project for other org', async () => {
      const res = await server.inject(injectCfg({
        method: 'POST',
        url: '/v1/community-businesses/2/volunteers/projects',
        credentials: adminCreds,
      }));

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /community-businesses/me/volunteers/projects/{id}', () => {
    test('can get single project', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/volunteers/projects/1',
        credentials: volCreds,
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({
          id: 1,
          organisationId: organisation.id,
          name: 'Party',
        }),
      });
    });

    test('cannot get non-existent project', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/volunteers/projects/99999',
        credentials: volCreds,
      }));

      expect(res.statusCode).toBe(404);
    });

    test('cannot get project belonging to other CB', async () => {
      const res = await server.inject(injectCfg({
        method: 'GET',
        url: '/v1/community-businesses/me/volunteers/projects/2',
        credentials: volCreds,
      }));

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /community-businesses/me/volunteers/projects/{id}', () => {
    test('can update project name', async () => {
      const res = await server.inject(injectCfg({
        method: 'PUT',
        url: '/v1/community-businesses/me/volunteers/projects/1',
        credentials: adminCreds,
        payload: {
          name: 'Foo',
        },
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({
          id: 1,
          name: 'Foo',
          organisationId: organisation.id,
        }),
      });
    });

    test('can update casing on project name', async () => {
      const res = await server.inject(injectCfg({
        method: 'PUT',
        url: '/v1/community-businesses/me/volunteers/projects/1',
        credentials: adminCreds,
        payload: {
          name: 'party',
        },
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({
          id: 1,
          name: 'party',
          organisationId: organisation.id,
        }),
      });
    });

    test('cannot update organisationId', async () => {
      const res = await server.inject(injectCfg({
        method: 'PUT',
        url: '/v1/community-businesses/me/volunteers/projects/1',
        credentials: adminCreds,
        payload: {
          organisationId: 3,
        },
      }));

      expect(res.statusCode).toBe(400);
    });

    test('cannot update name to already existing name', async () => {
      const res = await server.inject(injectCfg({
        method: 'PUT',
        url: '/v1/community-businesses/me/volunteers/projects/1',
        credentials: adminCreds,
        payload: {
          name: 'Take over the world',
        },
      }));

      expect(res.statusCode).toBe(409);
      expect(res.result)
        .toEqual({ error: expect.objectContaining({ message: 'Project name is a duplicate' }) });
    });

    // General {id} routes not implemented yet, remove the 'skip' when they are
    test.skip('cannot update other organisations projects', async () => {
      const res = await server.inject(injectCfg({
        method: 'PUT',
        url: '/v1/community-businesses/2/volunteers/projects/1',
        credentials: adminCreds,
        payload: {
          name: 'Foo',
        },
      }));

      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /community-businesses/me/volunteers/projects/{id}', () => {
    test('can mark own project deleted', async () => {
      const res = await server.inject(injectCfg({
        method: 'DELETE',
        url: '/v1/community-businesses/me/volunteers/projects/1',
        credentials: adminCreds,
      }));

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({ result: null });
    });

    test('cannot mark non-existent project as deleted', async () => {
      const res = await server.inject(injectCfg({
        method: 'DELETE',
        url: '/v1/community-businesses/me/volunteers/projects/999',
        credentials: adminCreds,
      }));

      expect(res.statusCode).toBe(404);
    });

    // General {id} routes not implemented yet, remove the 'skip' when they are
    test.skip('cannot delete other organisations project', async () => {
      const res = await server.inject(injectCfg({
        method: 'DELETE',
        url: '/v1/community-businesses/2/volunteers/projects/2',
        credentials: adminCreds,
      }));

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PATCH /community-businesses/me/volunteers/projects/{id}/restore', () => {
    test('can restore own project', async () => {
      const res = await server.inject(injectCfg({
        method: 'DELETE',
        url: '/v1/community-businesses/me/volunteers/projects/1',
        credentials: adminCreds,
      }));

      expect(res.statusCode).toBe(200);
      
      const restoreRes = await server.inject(injectCfg({
        method: 'PATCH',
        url: '/v1/community-businesses/me/volunteers/projects/1/restore',
        credentials: adminCreds,
      }));

      expect(restoreRes.statusCode).toBe(200);
      expect(restoreRes.result).toEqual({ result: null });
    });

    test('cannot mark restore live project', async () => {
      const res = await server.inject(injectCfg({
        method: 'PATCH',
        url: '/v1/community-businesses/me/volunteers/projects/1/restore',
        credentials: adminCreds,
      }));

      expect(res.statusCode).toBe(404);
    });

    test('cannot mark restore non existent project', async () => {
      const res = await server.inject(injectCfg({
        method: 'PATCH',
        url: '/v1/community-businesses/me/volunteers/projects/101/restore',
        credentials: adminCreds,
      }));

      expect(res.statusCode).toBe(404);
    });

    // General {id} routes not implemented yet, remove the 'skip' when they are
    test.skip('cannot restore other organisations project', async () => {
      const res = await server.inject(injectCfg({
        method: 'DELETE',
        url: '/v1/community-businesses/2/volunteers/projects/2',
        credentials: adminCreds,
      }));

      expect(res.statusCode).toBe(401);
    });
  });
});
