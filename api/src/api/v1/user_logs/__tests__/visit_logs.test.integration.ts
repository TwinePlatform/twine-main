/*
 * API functional tests
 */
import * as Hapi from '@hapi/hapi';
import { init } from '../../../../../tests/utils/server';
import { assocPath } from 'ramda';
import * as moment from 'moment';
import { getConfig } from '../../../../../config';
import { User, Organisation, Users, Organisations } from '../../../../models';
import { Credentials as StandardCredentials } from '../../../../auth/strategies/standard';
import { RoleEnum } from '../../../../models/types';
import { injectCfg } from '../../../../../tests/utils/inject';


describe('GET /visit-logs', () => {
  let server: Hapi.Server;
  let user: User;
  let organisation: Organisation;
  let credentials: Hapi.AuthCredentials;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);

    user = await Users.getOne(server.app.knex, { where: { name: 'Big Boss' } });
    organisation =
      await Organisations.getOne(server.app.knex, { where: { name: 'Aperture Science' } });
    credentials = await StandardCredentials.create(server.app.knex, user, organisation);
  });

  afterAll(async () => {
    await server.shutdown(true);
  });

  test('success :: returns all logs', async () => {
    const res = await server.inject(injectCfg({
      method: 'GET',
      url: '/v1/visit-logs',
      credentials,
    }));

    expect(res.statusCode).toBe(200);
    expect((<any> res.result).result).toEqual(expect.arrayContaining([
      { category: 'Sports', gender: 'female', id: 1, visitActivity: 'Free Running' },
      { category: 'Sports', gender: 'female', id: 2, visitActivity: 'Free Running' },
      { category: 'Sports', gender: 'female', id: 3, visitActivity: 'Free Running' },
      { category: 'Sports', gender: 'female', id: 4, visitActivity: 'Free Running' },
      { category: 'Sports', gender: 'female', id: 5, visitActivity: 'Free Running' },
      { category: 'Sports', gender: 'female', id: 6, visitActivity: 'Free Running' },
      { category: 'Sports', gender: 'female', id: 7, visitActivity: 'Free Running' },
      { category: 'Socialising', gender: 'female', id: 8, visitActivity: 'Wear Pink' },
      { category: 'Socialising', gender: 'female', id: 9, visitActivity: 'Wear Pink' },
      { category: 'Socialising', gender: 'female', id: 10, visitActivity: 'Wear Pink' }]
      .map((x) => expect.objectContaining(x))
    ));
  });

  test('success :: returns subset of logs with date querystring', async () => {
    const today = moment();
    const until = today.clone().format('YYYY-MM-DD');
    const since = today.clone().subtract(1, 'day').format('YYYY-MM-DD');
    const res = await server.inject(injectCfg({
      method: 'GET',
      url: `/v1/visit-logs?since=${since}&until=${until}`,
      credentials,
    }));

    expect(res.statusCode).toBe(200);
    expect((<any> res.result).result).toEqual(expect.arrayContaining([
      {
        category: 'Socialising',
        gender: 'female',
        id: 8,
        organisationName: 'Aperture Science',
        userId: 1,
        visitActivity: 'Wear Pink',
      },
      {
        category: 'Sports',
        gender: 'female',
        id: 7,
        organisationName: 'Aperture Science',
        userId: 1,
        visitActivity: 'Free Running',
      }]
      .map((x) => expect.objectContaining(x))
    ));
  });

  test('failure :: funding body cannot access as not implemented', async () => {
    const res = await server.inject(injectCfg({
      method: 'GET',
      url: '/v1/visit-logs',
      credentials: assocPath(['user', 'roles'], [RoleEnum.FUNDING_BODY], credentials),
    }));

    expect(res.statusCode).toBe(403);
  });
});

