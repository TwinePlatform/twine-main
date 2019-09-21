import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { Dictionary } from 'ramda';
import { ApiRequestQuery } from '../schema/request';
import { GenderEnum, CommunityBusiness, User, CommonTimestamps, VolunteerLog } from '../../../models';
import { CbAdminCollection, CommunityBusinessCollection, Weekday, VisitActivity, VisitEvent } from '../../../models/types';
import { Unpack } from '../../../types/internal';

interface ServerRoute<
  TRequest extends Hapi.Request,
  TResponse extends Hapi.Lifecycle.ReturnValue
  > extends Hapi.ServerRoute {
  handler: (req: TRequest, h: Hapi.ResponseToolkit, e?: Error) => Promise<Boom<null> | TResponse>;
}

type Record = {
  id: number;
  name: string;
};



export namespace Api { // eslint-disable-line

  type ResponsePayload<T> = { meta: object; result: T } | T;

  /*
   * CommunityBusinesses route types
   */

  export namespace CommunityBusinesses { // eslint-disable-line
    export namespace GET { // eslint-disable-line
      export interface Request extends Hapi.Request { query: ApiRequestQuery & Dictionary<any> }
      export type Result = Unpack<ReturnType<CommunityBusinessCollection['serialise']>>[];
      export type Response = ResponsePayload<Result>;
      export type Route = ServerRoute<Request, Response>;
    }

    export namespace Me { // eslint-disable-line
      export namespace GET { // eslint-disable-line
        export interface Request extends Hapi.Request {
          query: ApiRequestQuery & Dictionary<any>;
          pre: { communityBusiness: CommunityBusiness };
        }
        export type Result = Unpack<ReturnType<CommunityBusinessCollection['serialise']>>;
        export type Response = ResponsePayload<Result>;
        export type Route = ServerRoute<Request, Response>;
      }

      export namespace PUT { // eslint-disable-line
        export interface Request extends Hapi.Request {
          payload:
            Omit<CommunityBusiness, 'createdAt' | 'modifiedAt' | 'deletedAt' | 'id' | '_360GivingId'>;
          pre: {
            communityBusiness: CommunityBusiness;
          };
        }
        export type Result = Unpack<ReturnType<CommunityBusinessCollection['serialise']>>;
        export type Response = ResponsePayload<Result>;
        export type Route = ServerRoute<Request, Response>;
      }

      export namespace Feedback { // eslint-disable-line
        export namespace GET { // eslint-disable-line
          export interface Request extends Hapi.Request {
            query: ApiRequestQuery & { since: string; until: string };
            pre: { communityBusiness: CommunityBusiness };
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['getFeedback']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }

        export namespace POST { // eslint-disable-line
          export interface Request extends Hapi.Request {
            payload: { feedbackScore: number };
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['addFeedback']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }

        export namespace Aggregates { // eslint-disable-line
          export namespace GET { // eslint-disable-line
            export interface Request extends Hapi.Request {
              query: { since: string; until: string };
              pre: { communityBusiness: CommunityBusiness };
            }
            export type Result = { totalFeedback: number; '-1': number; 0: number; 1: number };
            export type Response = ResponsePayload<Result>;
            export type Route = ServerRoute<Request, Response>;
          }
        }
      }

      export namespace VisitActivities { // eslint-disable-line
        export namespace GET { // eslint-disable-line
          export interface Request extends Hapi.Request {
            query: { day: Weekday | 'today' };
            pre: { communityBusiness: CommunityBusiness };
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['getVisitActivities']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }

        export namespace POST { // eslint-disable-line
          export interface Request extends Hapi.Request {
            payload: Pick<VisitActivity, 'name' | 'category'>;
            pre: { communityBusiness: CommunityBusiness };
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['addVisitActivity']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }

        export namespace PUT { // eslint-disable-line
          export interface Request extends Hapi.Request {
            params: { visitActivityId: string };
            pre: { communityBusiness: CommunityBusiness };
            payload: Omit<VisitActivity, 'id' | 'createdAt' | 'modifiedAt' | 'deletedAt'>;
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['updateVisitActivity']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }

        export namespace DELETE { // eslint-disable-line
          export interface Request extends Hapi.Request {
            params: { visitActivityId: string };
            pre: { communityBusiness: CommunityBusiness };
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['deleteVisitActivity']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }
      }

      export namespace VisitLogs { // eslint-disable-line
        export namespace GET { // eslint-disable-line
          export interface Request extends Hapi.Request {
            pre: { communityBusiness: CommunityBusiness };
            query: ApiRequestQuery & Dictionary<any> & {
              filter?: {
                age?: [number, number];
                gender?: GenderEnum;
                activity?: string;
              };
            };
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['getVisitLogsWithUsers']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }

        export namespace POST { // eslint-disable-line
          export interface Request extends Hapi.Request {
            pre: { communityBusiness: CommunityBusiness };
            payload: Pick<VisitEvent, 'userId' | 'visitActivityId'> & {
              signInType: 'sign_in_with_name' | 'qr_code';
            };
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['addVisitLog']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }

        export namespace Aggregates { // eslint-disable-line
          export namespace GET { // eslint-disable-line
            export type Request = VisitLogs.GET.Request;
            export type Result = Unpack<ReturnType<CommunityBusinessCollection['getVisitLogAggregates']>>;
            export type Route = ServerRoute<Request, ResponsePayload<Result>>;
          }
        }
      }

      export namespace VolunteerLogs { // eslint-disable-line
        export namespace GET
      }
    }

    export namespace Id { // eslint-disable-line
      export namespace GET { // eslint-disable-line
        export interface Request extends Hapi.Request {
          query: ApiRequestQuery & Dictionary<any>;
          pre: {
            communityBusiness: CommunityBusiness;
            isChild: boolean;
          };
        }
        export type Result = Unpack<ReturnType<CommunityBusinessCollection['serialise']>>;
        export type Response = ResponsePayload<Result>;
        export type Route = ServerRoute<Request, Response>;
      }

      export namespace PUT { // eslint-disable-line
        export interface Request extends Hapi.Request {
          payload:
          Omit<CommunityBusiness, 'createdAt' | 'modifiedAt' | 'deletedAt' | 'id' | '_360GivingId'>;
          pre: {
            communityBusiness: CommunityBusiness;
            isChild: boolean;
          };
        }
        export type Result = Unpack<ReturnType<CommunityBusinessCollection['serialise']>>;
        export type Response = ResponsePayload<Result>;
        export type Route = ServerRoute<Request, Response>;
      }

      export namespace Feedback { // eslint-disable-line
        export namespace GET { // eslint-disable-line
          export interface Request extends Hapi.Request {
            query: ApiRequestQuery & { since: string; until: string };
            pre: {
              communityBusiness: CommunityBusiness;
              isChild: boolean;
            };
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['getFeedback']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }
      }

      export namespace VisitActivities { // eslint-disable-line
        export namespace GET { // eslint-disable-line
          export interface Request extends Hapi.Request {
            query: { day: Weekday | 'today' };
            pre: { communityBusiness: CommunityBusiness; isChild: boolean };
            params: { organisationId: string };
          }
          export type Result = Unpack<ReturnType<CommunityBusinessCollection['getVisitActivities']>>;
          export type Response = ResponsePayload<Result>;
          export type Route = ServerRoute<Request, Response>;
        }
      }
    }

    export namespace Register { // eslint-disable-line
      export namespace POST { // eslint-disable-line
        export interface Request extends Hapi.Request {
          payload:
            Omit<CommunityBusiness, 'createdAt' | 'modifiedAt' | 'deletedAt' | 'id'>
            & {
              orgName: CommunityBusiness['name'];
              adminName: string;
              adminEmail: string;
            };
        }
        export type Result = Unpack<ReturnType<CommunityBusinessCollection['serialise']>>;
        export type Response = ResponsePayload<Result>;
        export type Route = ServerRoute<Request, Response>;
      }
    }

    export namespace CbAdmins { // eslint-disable-line
      export namespace GET { // eslint-disable-line
        export interface Request extends Hapi.Request { payload: {} }
        export type Result = Unpack<ReturnType<CbAdminCollection['serialise']>>[];
        export type Response = ResponsePayload<Result>;
        export type Route = ServerRoute<Request, Response>;
      }
    }
  }

// export interface LoginRequest extends Hapi.Request {
//   payload: {
//     restrict?: RoleEnum | RoleEnum[]
//     type: 'cookie' | 'body'
//     email: string
//     password: string
//   };
// }

// export interface GetVisitorsRequest extends Hapi.Request {
//   query: ApiRequestQuery & {
//     [k: string]: any
//     filter?: {
//       age?: [number, number]
//       gender?: GenderEnum
//       name?: string
//       email?: string
//       postCode?: string
//       phoneNumber?: string
//       visitActivity?: string
//     }
//     visits: boolean
//   };
// }

// export interface GetVisitorRequest extends Hapi.Request {
//   params: {
//     userId: string
//   };
//   query: {
//     visits: string
//   };
// }

// export interface PutUserRequest extends Hapi.Request {
//   payload: Partial<Omit<User, 'id' | keyof CommonTimestamps | 'qrCode'>>;
//   params: {
//     userId: string
//   };
// }
// export interface GetAllVolunteersRequest extends Hapi.Request {
//   query: ApiRequestQuery & {
//     [k: string]: string
//   };
// }

// export interface DeleteUserRequest extends Hapi.Request {
//   params: {
//     userId: string
//   };
// }


// export interface GetMyVolunteerLogsRequest extends Hapi.Request {
//   query: ApiRequestQuery & {
//     since: string
//     until: string
//     fields: (keyof VolunteerLog)[]
//   };
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// export interface PostMyVolunteerLogsRequest extends Hapi.Request {
//   payload: Pick<VolunteerLog, 'activity' | 'duration' | 'startedAt'> & {
//     userId?: number | 'me'
//   };
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// export interface GetVolunteerLogRequest extends Hapi.Request {
//   query: { fields: (keyof VolunteerLog)[] };
//   params: { logId: string };
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// export interface PutMyVolunteerLogRequest extends Hapi.Request {
//   params: { logId: string };
//   payload: Partial<Omit<VolunteerLog, 'id' | 'userId' | 'organisationId' | keyof CommonTimestamps>>;
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// export interface GetVolunteerLogSummaryRequest extends Hapi.Request {
//   query: { since: string, until: string };
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// export interface RegisterRequest extends Hapi.Request {
//   payload: {
//     organisationId: number
//     name: string
//     gender: GenderEnum
//     birthYear: number
//     email: string
//     phoneNumber: string
//     postCode: string
//     emailConsent: boolean
//     smsConsent: boolean
//     isAnonymous?: boolean
//   };
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }
// export interface RegisterConfirm extends Hapi.Request {
//   payload: {
//     organisationId: number
//     userId: number
//     token: string
//     role: RoleEnum
//   };
// }

// export interface VolunteerRegisterRequest extends Hapi.Request {
//   payload: RegisterRequest['payload'] & {
//     password: string
//     role: RoleEnum.VOLUNTEER | RoleEnum.VOLUNTEER_ADMIN
//     adminCode?: string
//   };
// }

// export interface GetMyVolunteerLogsAggregateRequest extends Hapi.Request {
//   query: ApiRequestQuery & Hapi.Util.Dictionary<string>;
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// export type SyncVolunteerLogPayloadItem = (
//   Pick<VolunteerLog, 'id' | 'activity' | 'duration' | 'startedAt' | 'deletedAt'>
//   & { userId: number | 'me' }
// );

// export interface SyncMyVolunteerLogsRequest extends Hapi.Request {
//   payload: SyncVolunteerLogPayloadItem[];
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// export interface GetMyVolunteerProjectRequest extends Hapi.Request {
//   params: {
//     projectId: string
//   };
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// export interface PostMyVolunteerProjectRequest extends Hapi.Request {
//   payload: {
//     name: string
//   };
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// export interface PutMyVolunteerProjectRequest extends Hapi.Request {
//   params: {
//     projectId: string
//   };
//   payload: {
//     name: string
//   };
//   pre: {
//     communityBusiness: CommunityBusiness
//   };
// }

// /*
//  * Test related types
//  */
// export type RouteTestFixture = {
//   name: string
//   setup?: (server: Hapi.Server) => Promise<void>
//   teardown?: (server: Hapi.Server) => Promise<void>
//   inject: {
//     url: string
//     method: HttpMethodEnum
//     credentials?: Hapi.AuthCredentials
//     payload?: object
//   }
//   expect: {
//     statusCode: number
//     payload?: object | ((a: Dictionary<any>) => void),
//   }
// }
}
