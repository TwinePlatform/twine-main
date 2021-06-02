import { Organisation, User } from '../../../models';

declare module '@hapi/hapi' {
  interface AppCredentials extends ExternalAppCredentials { }
}

export type ExternalAppCredentials = {
  scope: string[],
  user: User,
  organisation: Organisation,
};
