import * as Hapi from '@hapi/hapi';
import * as Knex from 'knex';
import { init } from '../../../../../../tests/utils/server';
import { getConfig } from '../../../../../../config';
import { getTrx } from '../../../../../../tests/utils/database';
import { User, Organisation, Users, Organisations } from '../../../../../models';
import { Credentials as StandardCredentials } from '../../../../../auth/strategies/standard';
import { RoleEnum } from '../../../../../models/types';
import { injectCfg } from '../../../../../../tests/utils/inject';


describe('API v1 - register new users', () => {
  let server: Hapi.Server;
  let knex: Knex;
  let trx: Knex.Transaction;
  let user: User;
  let cbAdminBlackMesa: User;
  let organisation: Organisation;
  let blackMesa: Organisation;
  let credentials: Hapi.AuthCredentials;
  let credentialsBlackMesa: Hapi.AuthCredentials;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);
    knex = server.app.knex;

    user = await Users.getOne(knex, { where: { name: 'GlaDos' } });
    cbAdminBlackMesa = await Users.getOne(knex, { where: { name: 'Gordon' } });
    organisation = await Organisations.fromUser(knex, { where: user });
    blackMesa = await Organisations.getOne(knex, { where: { name: 'Black Mesa Research' } });
    credentials = await StandardCredentials.create(knex, user, organisation);
    credentialsBlackMesa = await StandardCredentials.create(knex, cbAdminBlackMesa, blackMesa);
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
  describe('POST /users/register/volunteers', () => {

    test(':: success - create VOLUNTEER', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/v1/users/register/volunteers',
        payload: {
          organisationId: 1,
          name: 'foo',
          gender: 'female',
          email: '13542@google.com',
          password: 'fighteS1994!',
          role: RoleEnum.VOLUNTEER,
        },
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toEqual(expect.objectContaining({
        name: 'foo',
        gender: 'female',
        email: '13542@google.com',
      }));
    });

    test(':: success - create VOLUNTEER_ADMIN', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/v1/users/register/volunteers',
        payload: {
          organisationId: 1,
          name: 'foo',
          gender: 'female',
          email: '13542@google.com',
          password: 'fighteS1994!',
          role: RoleEnum.VOLUNTEER_ADMIN,
          adminCode: '10101',
        },
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toEqual(expect.objectContaining({
        name: 'foo',
        gender: 'female',
        email: '13542@google.com',
      }));
    });

    test(':: SUCCESS - confirmation email sent if user is visitor at same CB', async () => {
      const realEmailServiceSend = server.app.EmailService.addRole;
      const mock = jest.fn(() => Promise.resolve());
      server.app.EmailService.addRole = mock;

      const res = await server.inject(injectCfg({
        method: 'POST',
        url: '/v1/users/register/volunteers',
        payload: {
          organisationId: 1,
          name: 'Chell',
          gender: 'female',
          email: '1498@aperturescience.com',
          password: 'c<3mpanionCube',
          role: RoleEnum.VOLUNTEER,
        },
        credentials,
      }));

      expect(res.statusCode).toBe(409);
      expect((<any> res.result).error.message).toBe(
        'Email is associated to a visitor, '
        + 'please see email confirmation to create volunteer account'
      );

      expect(mock).toHaveBeenCalledTimes(1);

      // Reset mock
      server.app.EmailService.addRole = realEmailServiceSend;
    });

    test(':: success - add volunteer with null birthYear', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/v1/users/register/volunteers',
        payload: {
          organisationId: 1,
          name: 'Ratman',
          gender: 'male',
          birthYear: null,
          email: '666@google.com',
          password: 'helpMe1mtrapped!',
          role: RoleEnum.VOLUNTEER,
        },
      });

      expect(res.statusCode).toBe(200);
    });

    test(':: fail - user already exists - cannot create second role for VOLUNTEER_ADMIN',
      async () => {
        const res = await server.inject(injectCfg({
          method: 'POST',
          url: '/v1/users/register/volunteers',
          payload: {
            organisationId: 1,
            name: 'Chell',
            gender: 'female',
            email: '1498@aperturescience.com',
            password: 'c<3mpanionCube',
            role: RoleEnum.VOLUNTEER_ADMIN,
          },
          credentials,
        }));

        expect(res.statusCode).toBe(409);
        expect((<any> res.result).error.message).toBe('User with this e-mail already registered');
      });

    test(':: fail - user already exists - cannot create second role if user is already a VOLUNTEER',
      async () => {
        const res = await server.inject(injectCfg({
          method: 'POST',
          url: '/v1/users/register/volunteers',
          payload: {
            organisationId: 1,
            name: 'Emma Emmerich',
            gender: 'female',
            email: 'emma@sol.com',
            password: 'c<3mpanionCube',
            role: RoleEnum.VOLUNTEER,
          },
          credentials: credentialsBlackMesa,
        }));

        expect(res.statusCode).toBe(409);
        expect((<any> res.result).error.message)
          .toBe('volunteer with this e-mail already registered');
      });

    test(':: fail - user already exists - cannot create second role if user signed upto another CB',
      async () => {
        const res = await server.inject(injectCfg({
          method: 'POST',
          url: '/v1/users/register/volunteers',
          payload: {
            organisationId: 2,
            name: 'Chell',
            gender: 'female',
            email: '1498@aperturescience.com',
            password: 'c<3mpanionCube',
            role: RoleEnum.VOLUNTEER,
          },
          credentials: credentialsBlackMesa,
        }));

        expect(res.statusCode).toBe(409);
        expect((<any> res.result).error.message)
          .toBe('User with this e-mail already registered at another Community Business');
      });

    test(':: fail - non-existent community business', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/v1/users/register/volunteers',
        payload: {
          organisationId: 9352,
          name: 'foo',
          gender: 'female',
          email: '13542@google.com',
          password: 'fighteS1994!',
          role: RoleEnum.VOLUNTEER,
        },
      });

      expect(res.statusCode).toBe(400);
      expect((<any> res.result).error.message).toBe('Unrecognised organisation');
    });

    test(':: fail - invalid admin code for VOLUNTEER_ADMIN', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/v1/users/register/volunteers',
        payload: {
          organisationId: 1,
          name: 'foo',
          gender: 'female',
          email: '13542@google.com',
          password: 'fighteS1994!',
          role: RoleEnum.VOLUNTEER_ADMIN,
          adminCode: '99999',
        },
      });

      expect(res.statusCode).toBe(401);
      expect((<any> res.result).error.message).toEqual('Invalid volunteer admin code');
    });

    test(':: fail - missing admin code for VOLUNTEER_ADMIN', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/v1/users/register/volunteers',
        payload: {
          organisationId: 1,
          name: 'foo',
          gender: 'female',
          email: '13542@google.com',
          password: 'fighteS1994!',
          role: RoleEnum.VOLUNTEER_ADMIN,
        },
      });

      expect(res.statusCode).toBe(400);
      expect((<any> res.result).error.message).toEqual('Missing volunteer admin code');
    });

    test(':: fail - unauthenticated request fails without a password', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/v1/users/register/volunteers',
        payload: {
          organisationId: 1,
          name: 'foo',
          gender: 'female',
          birthYear: 1988,
          email: '13542@google.com',
          role: RoleEnum.VOLUNTEER,
        },
      });

      expect(res.statusCode).toBe(400);
      expect((<any> res.result).error.message).toEqual('password is required');
    });

    test(':: success - authenticated request does not need password', async () => {
      const res = await server.inject(injectCfg({
        method: 'POST',
        url: '/v1/users/register/volunteers',
        payload: {
          organisationId: 1,
          name: 'foo',
          gender: 'female',
          birthYear: 1988,
          email: '13542@google.com',
          role: RoleEnum.VOLUNTEER,
        },
        credentials: credentialsBlackMesa,
      }));

      expect(res.statusCode).toBe(200);
    });
  });
});
