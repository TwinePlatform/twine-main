/*
 * "organisations_details-child" route pre-requisite
 *
 * Determines if the authenticated user is trying to access an organisation
 * which is actually a "child" entity.
 *
 * Conditions under which this is true for organisation X:
 * - User is a Twine admin
 *
 */
import * as Hapi from '@hapi/hapi';
import { Credentials as StandardCredentials } from '../../../auth/strategies/standard';
import { RoleEnum } from '../../../models/types';


export default async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  if (request.auth.strategy === 'external') {
    return false;
  }

  const { roles } = StandardCredentials.fromRequest(request);

  if (roles.includes(RoleEnum.TWINE_ADMIN)) {
    return true;
  }

  // TODO: Funding body case is unimplemented
  //       See: https:github.com/TwinePlatform/twine-api/issues/120
  return false;
};
