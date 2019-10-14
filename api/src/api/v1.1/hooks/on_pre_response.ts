/*
 * onPreResponse Lifecycle hook
 *
 * This hook runs immediately before the response is sent, but after
 * all response validation
 *
 * Its purpose is to intercept any system runtime errors (either due to
 * uncaught or unhandled bugs or due to default Hapi framework responses)
 * and format them as required by the API.
 *
 * See also: https://hapijs.com/api#request-lifecycle
 */
import * as Hapi from '@hapi/hapi';
import { formatBoom, BoomWithValidation } from '../utils';
import { Environment } from '../../../../config';


export default async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { config: { env } } = request.server.app;

  if ('isBoom' in request.response) {
    const err = request.response as BoomWithValidation;
    if (env !== Environment.TESTING) console.log(err);
    return h.response(formatBoom(err)).code(err.output.statusCode);
  } else {
    return h.continue;
  }
};
