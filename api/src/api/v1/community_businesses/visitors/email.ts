import * as Boom from '@hapi/boom';
import * as Joi from '@hapi/joi';
import { response, id } from '../schema';
import { isChildUser } from '../../prerequisites';
import { Visitors, CommunityBusinesses } from '../../../../models';
import * as PdfService from '../../../../services/pdf';
import * as QRCode from '../../../../services/qrcode';
import { Credentials as StandardCredentials } from '../../../../auth/strategies/standard';
import { Api } from '../../types/api';


const routes: [
  Api.CommunityBusinesses.Me.Visitors.Id.emails.POST.Route
] = [
  {
    method: 'POST',
    path: '/community-businesses/me/visitors/{userId}/emails',
    options: {
      description: 'Send visitors emails',
      auth: {
        strategy: 'standard',
        scope: ['user_details-child:write'],
      },
      validate: {
        params: {
          userId: id.required(),
        },
        payload: {
          // NOTE: As soon as this value can take more than one value,
          //       the handler must be explicitly changed to support it.
          type: Joi.any().only(['qrcode']),
        },
      },
      response: { schema: response },
      pre: [
        { method: isChildUser, assign: 'isChild' },
      ],
    },
    handler: async (request, h) => {
      const {
        pre: { isChild },
        params: { userId },
        server: { app: { knex, EmailService, config } },
      } = request;

      const { organisation } = StandardCredentials.fromRequest(request);

      if (!isChild) {
        return Boom.forbidden('Insufficient permissions to access this resource');
      }

      const cb = await CommunityBusinesses.getOne(knex, { where: { id: organisation.id } });

      const [visitor] = await Visitors.fromCommunityBusiness(
        knex,
        cb,
        { where: { id: Number(userId) } }
      );

      if (!visitor.email
        || /anon_\d+_org_\d+/.test(visitor.email)
      ) {
        return Boom.badRequest('User has not specified an email');
      }

      // Send QR code to visitor
      // // generate QR code data URL
      const qrCode = await QRCode.create(visitor.qrCode);
      // // create PDF blob
      const document = await PdfService.fromTemplate(
        PdfService.PdfTemplateEnum.VISITOR_QR_CODE,
        { qrCodeDataUrl: qrCode }
      );

      try {
        await EmailService.visitorReminder(config, visitor, cb, document);
        return null;

      } catch (error) {
        return Boom.badGateway(error);

      }
    },
  },
];


export default routes;
