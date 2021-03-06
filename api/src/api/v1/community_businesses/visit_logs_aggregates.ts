import * as Boom from '@hapi/boom';
import { omit, filter, complement, isEmpty } from 'ramda';
import { query, response } from './schema';
import { CommunityBusinesses } from '../../../models';
import { getCommunityBusiness } from '../prerequisites';
import { filterQuery } from '../users/schema';
import { Api } from '../types/api';


const routes: [Api.CommunityBusinesses.Me.VisitLogs.Aggregates.GET.Route] = [
  {
    method: 'GET',
    path: '/community-businesses/me/visit-logs/aggregates',
    options: {
      description: 'Retrieve a list of aggregated visit data for your community businesses',
      auth: {
        strategies: ['standard', 'external'],
        access: {
          scope: ['visit_logs-child:read', 'api:visitor:read'],
        },
      },
      validate: {
        query: {
          ...query,
          ...filterQuery,
        },
      },
      response: { schema: response },
      pre: [
        { method: getCommunityBusiness , assign: 'communityBusiness' },
      ],
    },
    handler: async (request, h) => {

      const {
        server: { app: { knex } },
        query: { filter: filterOptions = {}, fields },
        pre: { communityBusiness } } = request;
      /*
       * fields define what aggregates are returned.
       * If no fields are requested the response is empty.
       */
      if (!fields) return {};

      const query = filter(complement(isEmpty), {
        where: omit(['age'], filterOptions),
        whereBetween: filterOptions.age
          ? { birthYear: filterOptions.age }
          : {},
      });
      try {
        const aggregates = await CommunityBusinesses
          .getVisitLogAggregates(knex, communityBusiness, fields, query);

        return aggregates;
      } catch (error) {
        if (error.message.includes('are not supported aggregate fields')) {
          return Boom.badRequest(error.message);
        }
        return error;
      }
    },
  },
];

export default routes;
