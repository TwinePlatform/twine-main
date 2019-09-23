import * as Boom from '@hapi/boom';
import { since, until } from '../schema/request';
import { response } from '../schema/response';
import { isChildOrganisation } from '../prerequisites';
import { VolunteerLogs } from '../../../models';
import { Api } from '../types/api';


const routes: [Api.VolunteerLogs.GET.Route] = [
  {
    method: 'GET',
    path: '/volunteer-logs',
    options: {
      description: 'Retrieve a list of all volunteer logs',
      auth: {
        strategy: 'standard',
        access: {
          scope: ['volunteer_logs-child:read'],
        },
      },
      validate: {
        query: { since, until },
      },
      response: { schema: response },
      pre: [
        { method: isChildOrganisation , assign: 'isChild' },
      ],
    },
    handler: async (request, h) => {
      const {
        server: { app: { knex } },
        query: { since, until },
        pre: { isChild } } = request;

      if (!isChild) {
        return Boom.forbidden('Not Implemented for non Twine Admin');
      }
      /*
       * TODO:
       * - implement full query handling
       * - implement child orgs for FUNDING_BODYs
       *
       * created to support temp-admin-dashboard
       */

      const volunteerLogs = await VolunteerLogs.get(knex, {
        fields: [
          'userId',
          'userName',
          'organisationId',
          'organisationName',
          'activity',
          'duration',
          'startedAt'
        ],
        whereBetween: {
          startedAt: since || until
            ? [new Date(since), new Date(until)]
            : [null, null],
        },
        order: ['startedAt', 'asc'],
      });

      return Promise.all(volunteerLogs.map(VolunteerLogs.serialise));
    },
  },
];

export default routes;
