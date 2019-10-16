import * as Hapi from '@hapi/hapi';
import * as Knex from 'knex';
import { init } from '../../../../../../tests/utils/server';
import { getConfig } from '../../../../../../config';
import { User, Users, Organisation, Organisations } from '../../../../../models';
import { getTrx } from '../../../../../../tests/utils/database';
import { Credentials as StandardCredentials } from '../../../../../auth/strategies/standard';
import { injectCfg } from '../../../../../../tests/utils/inject';


describe('API PUT /community-businesses/me/visitors/{id}', () => {
  let server: Hapi.Server;
  let knex: Knex;
  let trx: Knex.Transaction;
  let user: User;
  let visitor: User;
  let organisation: Organisation;
  let credentials: Hapi.AuthCredentials;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);
    knex = server.app.knex;

    user = await Users.getOne(knex, { where: { name: 'GlaDos' } });
    visitor = await Users.getOne(knex, { where: { name: 'Chell' } });
    organisation = await Organisations.getOne(knex, { where: { id: 1 } });
    credentials = await StandardCredentials.create(knex, user, organisation);
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

  test('can perform partial update of user model', async () => {
    const res = await server.inject(injectCfg({
      method: 'PUT',
      url: `/v1.1/community-businesses/me/visitors/${visitor.id}`,
      payload: {
        name: 'Tubby',
      },
      credentials,
    }));

    const { modifiedAt, createdAt, deletedAt, password, qrCode, ...rest } = visitor;

    expect(res.statusCode).toBe(200);
    expect(res.result).toEqual({
      result: expect.objectContaining({ ...rest, name: 'Tubby' }),
    });
    expect((<any> res.result).result.modifiedAt).toBeTruthy();
    expect((<any> res.result).result.modifiedAt).not.toBe(modifiedAt);
  });

  test('can perform full update of user model', async () => {
    const res = await server.inject(injectCfg({
      method: 'PUT',
      url: `/v1.1/community-businesses/me/visitors/${visitor.id}`,
      payload: {
        name: 'Tubby',
        gender: 'male',
        birthYear: 1972,
        email: 'tubbs@aperture.com',
        phoneNumber: '07892374881',
        postCode: 'H3 3LP',
        isEmailConsentGranted: false,
        isSMSConsentGranted: true,
        disability: 'yes',
        ethnicity: 'prefer not to say',
      },
      credentials,
    }));

    expect(res.statusCode).toBe(200);
    expect(res.result).toEqual({
      result: expect.objectContaining({
        id: 1,
        name: 'Tubby',
        gender: 'male',
        birthYear: 1972,
        email: 'tubbs@aperture.com',
        phoneNumber: '07892374881',
        postCode: 'H3 3LP',
        isEmailConsentGranted: false,
        isSMSConsentGranted: true,
        disability: 'yes',
        ethnicity: 'prefer not to say',
      }),
    });
    expect((<any> res.result).result.modifiedAt).toBeTruthy();
    expect((<any> res.result).result.modifiedAt).not.toBe(user.modifiedAt);
  });

  test('bad update data returns 400', async () => {
    const res = await server.inject(injectCfg({
      method: 'PUT',
      url: `/v1.1/community-businesses/me/visitors/${visitor.id}`,
      payload: {
        name: 'Wheatley',
        ethnicity: 'thisisprobablynotaethnicity',
      },
      credentials,
    }));

    expect(res.statusCode).toBe(400);
  });

  test('idempotency', async () => {
    const res1 = await server.inject(injectCfg({
      method: 'PUT',
      url: `/v1.1/community-businesses/me/visitors/${visitor.id}`,
      payload: {
        name: 'Tubby',
      },
      credentials,
    }));

    const res2 = await server.inject(injectCfg({
      method: 'PUT',
      url: `/v1.1/community-businesses/me/visitors/${visitor.id}`,
      payload: {
        name: 'Tubby',
      },
      credentials,
    }));

    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
    expect(res1.result).toEqual(res2.result);
  });
});
