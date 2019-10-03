/*
 * Registration endpoints for visitors
 */
import * as Boom from '@hapi/boom';
import * as Joi from '@hapi/joi';
import { id, response } from '../schema';
import {
  Visitors,
  CommunityBusinesses,
  CbAdmins,
  Users,
  Volunteers,
  User,
} from '../../../../models';
import * as QRCode from '../../../../services/qrcode';
import * as PdfService from '../../../../services/pdf';
import { Api } from '../../types/api';
import { RoleEnum } from '../../../../models/types';
import Roles from '../../../../models/role';
import { Tokens } from '../../../../models/token';
import { Serialisers } from '../../serialisers';


const routes: [Api.Users.Register.Confirm.POST.Route] = [
  {
    method: 'POST',
    path: '/users/register/confirm',
    options: {
      description: 'Confirm adding a new role to an existing user',
      auth: false,
      validate: {
        payload: {
          organisationId: id.required(),
          userId: id.required(),
          role: Joi.alternatives(RoleEnum.VOLUNTEER, RoleEnum.VISITOR).required(),
          token: Joi.string().length(64).required(),
        },
      },
      response: { schema: response },
    },
    handler: async (request, h) => {
      const {
        payload: { role, userId, token, organisationId },
        server: { app: { EmailService, knex, config } },
      } = request;
      const cb = await CommunityBusinesses.getOne(knex, { where: { id: organisationId } });
      const user = await Users.getOne(knex, { where: { id: userId } });

      const [admin] = await CbAdmins.fromOrganisation(knex, { id: organisationId });

      /* istanbul ignore next */
      if (!admin) {
        // Because of a change in testing method, this is now unreachable
        // (and was always functionally impossible), but is kept **just
        // in case**
        throw Boom.badData('No associated admin for this organisation');
      }

      // Checks
      // check role doesnt exist on user account
      if (await Roles.userHas(knex, user, role)) {
        throw Boom.conflict(
          `${Roles.toDisplay(role)} with this e-mail already registered`);
      }
      // currently not supporting roles at different cbs
      if (!(await Users.isMemberOf(knex, user, cb))) {
        throw Boom.conflict(
          'User with this e-mail already registered at another Community Business');
      }
      /*
       * Main actions
       */

      // Create the account
      try {
        switch (role) {
        case RoleEnum.VISITOR:
          let updatedVisitor: User;
          let document: string;

          await knex.transaction(async (trx) => {
            await Tokens.useConfirmAddRoleToken(trx, user.email, token);
            await Roles.add(trx, { role, userId, organisationId });
            updatedVisitor = await Users.getOne(trx, { where: { id: user.id } });

            // generate & add QR CODE
            const userWithQr = await Users.update(trx, user,
              { qrCode: Visitors.create(updatedVisitor).qrCode });
            const qrCode = await QRCode.create(userWithQr.qrCode);
            document = await PdfService.fromTemplate(
              PdfService.PdfTemplateEnum.VISITOR_QR_CODE,
              { qrCodeDataUrl: qrCode }
            );
            return;
          });
          await EmailService.newVisitor(config, updatedVisitor, admin, cb, document);
          return Serialisers.visitor(updatedVisitor);

        case RoleEnum.VOLUNTEER:
          return knex.transaction(async (trx) => {
            await Tokens.useConfirmAddRoleToken(trx, user.email, token);
            await Roles.add(trx, { role, userId, organisationId });
            const updatedVolunteer = await Users.getOne(trx, { where: { id: user.id } });

            // create password reset token & send with response
            const { token: newToken } = await Tokens
              .createPasswordResetToken(trx, updatedVolunteer);
            return { ...Serialisers.volunteer(updatedVolunteer), token: newToken };
          });

        default:
          return Boom.notImplemented(`Not implemented for role $`);
        }
      } catch (error) {
        request.log('warning', error);
        return Boom.unauthorized('Invalid token. Request another reset e-mail.');
      }
    },
  },
];

export default routes;
