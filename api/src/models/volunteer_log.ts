import * as Knex from 'knex';
import { assoc, compose, evolve, has, filter, invertObj, omit, pick } from 'ramda';
import { Objects, Duration, Promises } from 'twine-util';
import { VolunteerLog, VolunteerLogCollection, RoleEnum, User } from './types';
import { CommunityBusinesses } from './community_business';
import { applyQueryModifiers } from './applyQueryModifiers';
import { Dictionary } from '../types/internal';
import Roles from './role';
import Permissions from './permission';
import { PermissionLevelEnum } from '../auth';
import { ResourceEnum, AccessEnum } from '../auth/types';
import { silent } from 'twine-util/promises';


/*
 * Field name mappings
 *
 * ColumnToModel - DB column names       -> keys of the User type
 * ModelToColumn - keys of the User type -> DB column names
 */
export const ColumnToModel: Record<string, keyof VolunteerLog> = {
  'volunteer_hours_log.volunteer_hours_log_id': 'id',
  'volunteer_hours_log.user_account_id': 'userId',
  'volunteer_hours_log.created_by': 'createdBy',
  'volunteer_hours_log.organisation_id': 'organisationId',
  'volunteer_hours_log.duration': 'duration',
  'volunteer_hours_log.started_at': 'startedAt',
  'volunteer_hours_log.created_at': 'createdAt',
  'volunteer_hours_log.modified_at': 'modifiedAt',
  'volunteer_hours_log.deleted_at': 'deletedAt',
  'volunteer_activity.volunteer_activity_name': 'activity',
  'volunteer_project.volunteer_project_name': 'project',
};
export const ModelToColumn = invertObj(ColumnToModel);

const optionalFields: Dictionary<string> = {
  organisationName: 'organisation.organisation_name',
  userName: 'user_account.user_name',

};

const stripTablePrefix = Objects.mapKeys((s) => s.replace('volunteer_hours_log.', ''));

const replaceConstantsWithForeignKeys = Objects.renameKeys({
  'volunteer_activity.volunteer_activity_name': 'volunteer_hours_log.volunteer_activity_id',
  'volunteer_project.volunteer_project_name': 'volunteer_hours_log.volunteer_project_id',
});

const transformForeignKeysToSubQueries = (client: Knex, org_id: number) => evolve({
  'volunteer_hours_log.volunteer_activity_id': (s: string) =>
    client('volunteer_activity')
      .select('volunteer_activity_id')
      .where({ volunteer_activity_name: s, deleted_at: null }),

  'volunteer_hours_log.volunteer_project_id': (s: string) =>
    s && client('volunteer_project')
      .select('volunteer_project_id')
      .where({ volunteer_project_name: s, organisation_id: org_id, deleted_at: null }),
});

const transformDuration = evolve({
  duration: Duration.toSeconds,
});

const dropUnwhereableUserFields = omit([
  'createdAt',
  'modifiedAt',
  'deletedAt',
]);

export const VolunteerLogs: VolunteerLogCollection = {
  toColumnNames (o = {}) {
    return filter(
      (s) => typeof s !== 'undefined',
      Object.entries(ColumnToModel)
        .reduce((acc, [k, v]) => has(v, o) ? assoc(k, o[v], acc) : acc, {})
    );
  },

  create (o) {
    return {
      id: o.id,
      userId: o.userId,
      organisationId: o.organisationId,
      duration: o.duration,
      startedAt: o.startedAt,
      createdAt: o.createdAt,
      modifiedAt: o.modifiedAt,
      deletedAt: o.deletedAt,
      activity: o.activity,
      project: o.project,
    };
  },

  async get (client, q = {}) {
    const query = evolve({
      where: VolunteerLogs.toColumnNames,
      whereNot: VolunteerLogs.toColumnNames,
      whereBetween: VolunteerLogs.toColumnNames,
    }, q);

    return applyQueryModifiers(
      client('volunteer_hours_log')
        .innerJoin(
          'volunteer_activity',
          'volunteer_activity.volunteer_activity_id',
          'volunteer_hours_log.volunteer_activity_id')
        .innerJoin(
          'organisation',
          'volunteer_hours_log.organisation_id',
          'organisation.organisation_id'
        )
        .innerJoin(
          'user_account',
          'volunteer_hours_log.user_account_id',
          'user_account.user_account_id'
        )
        .leftOuterJoin(
          'volunteer_project',
          'volunteer_project.volunteer_project_id',
          'volunteer_hours_log.volunteer_project_id'
        )
        .select(query.fields
          ? pick(query.fields, { ...ModelToColumn, ...optionalFields })
          : ModelToColumn),
      query
    );
  },

  async getOne (client, q = {}) {
    const [res] = await VolunteerLogs.get(client, { ...q, limit: 1 });
    return res || null;
  },

  async exists (client, query) {
    return null !== await VolunteerLogs.getOne(client, query);
  },

  async add (client, log) {
    const isVolunteer = await Roles.userHasAtCb(client, {
      userId: log.userId,
      organisationId: log.organisationId,
      role: [RoleEnum.VOLUNTEER, RoleEnum.VOLUNTEER_ADMIN],
    });

    const isCB = await CommunityBusinesses.exists(client, { where: { id: log.organisationId } });

    if (!isVolunteer || !isCB) {
      throw new Error('Volunteer logs must be registered against volunteer and community business');
    }

    const preProcessLog = compose(
      stripTablePrefix,
      transformForeignKeysToSubQueries(client, log.organisationId),
      replaceConstantsWithForeignKeys,
      VolunteerLogs.toColumnNames,
      transformDuration
    );

    const [id] = await client('volunteer_hours_log')
      .insert(preProcessLog(log))
      .returning('volunteer_hours_log_id');

    if (!id) {
      throw new Error('Failed to insert volunteer log');
    }

    return VolunteerLogs.getOne(client, { where: { id } });
  },

  async update (client, log, changes) {
    const preProcessChangeSet = compose(
      stripTablePrefix,
      transformForeignKeysToSubQueries(client, log.organisationId),
      replaceConstantsWithForeignKeys,
      VolunteerLogs.toColumnNames,
      transformDuration
    );

    const preProcessLog = compose(
      preProcessChangeSet,
      dropUnwhereableUserFields
    );

    const [id] = await client('volunteer_hours_log')
      .update(preProcessChangeSet(changes))
      .where(preProcessLog(log))
      .returning('volunteer_hours_log_id');

    if (!id) {
      throw new Error('Unable to perform update');
    }

    return VolunteerLogs.getOne(client, { where: { id } });
  },

  async destroy (client, log) {
    const preProcessLog = compose(
      transformForeignKeysToSubQueries(client, log.organisationId),
      (a: Dictionary<any>) => replaceConstantsWithForeignKeys<any>(a),
      VolunteerLogs.toColumnNames,
      dropUnwhereableUserFields
    );

    return client('volunteer_hours_log')
      .update({
        deleted_at: new Date(),
      })
      .where(preProcessLog(log));
  },

  async fromUser (client, user, q = {}) {
    return VolunteerLogs.get(client, {
      where: { userId: user.id, deletedAt: null },
      whereBetween: q.since || q.until
        ? { startedAt: [q.since, q.until] }
        : undefined,
    });
  },

  async fromCommunityBusiness (client, cb, q = {}) {
    return VolunteerLogs.get(client, {
      ...q,
      where: {
        organisationId: cb.id,
        deletedAt: null,
      },
      whereBetween: q.since || q.until
        ? { startedAt: [q.since, q.until] }
        : undefined,
    });
  },

  async fromUserAtCommunityBusiness (client, user, cb, q = {}) {
    return VolunteerLogs.get(client, {
      where: {
        organisationId: cb.id,
        userId: user.id,
        deletedAt: null,
      },
      whereBetween: q.since || q.until
        ? { startedAt: [q.since, q.until], }
        : undefined,
    });
  },

  async recordInvalidLog (client, user, organisation, payload) {
    return client('invalid_synced_logs_monitoring')
      .insert({
        payload: JSON.stringify(payload),
        user_account_id: user.id,
        organisation_id: organisation.id,
      });
  },

  async serialise (log) {
    return log;
  },

  async getProjects (client, cb) {
    return client('volunteer_project')
      .select({
        id: 'volunteer_project_id',
        organisationId: 'organisation_id',
        name: 'volunteer_project_name',
        createdAt: 'created_at',
        modifiedAt: 'modified_at',
        deletedAt: 'deleted_at',
      })
      .where({
        organisation_id: cb.id,
        deleted_at: null,
      });
  },

  async addProject (client, cb, name) {
    const { rows: [{ exists }] } = await client.raw('SELECT EXISTS ?', [
      client('volunteer_project')
        .select()
        .where({ organisation_id: cb.id, deleted_at: null, volunteer_project_name: name }),
    ]);

    if (exists) {
      throw new Error('Cannot add duplicate project');
    }

    const [project] = await client('volunteer_project')
      .insert({
        organisation_id: cb.id,
        volunteer_project_name: name,
      })
      .returning([
        'volunteer_project_id AS id',
        'organisation_id AS organisationId',
        'volunteer_project_name AS name',
        'created_at AS createdAt',
        'modified_at AS modifiedAt',
        'deleted_at AS deletedAt',
      ]);

    return project;
  },

  async updateProject (client, project, changeset) {
    if (changeset.name) {
      const { rows: [{ exists }] } = await client.raw('SELECT EXISTS ?', [
        client('volunteer_project')
          .select()
          .where({
            organisation_id: project.organisationId,
            deleted_at: null,
            volunteer_project_name: changeset.name,
          }),
      ]);

      if (exists) {
        throw new Error('Project name is a duplicate');
      }
    }

    return client('volunteer_project')
      .update(filter((a) => typeof a !== 'undefined', {
        volunteer_project_name: changeset.name,
        organisation_id: changeset.organisationId,
        deleted_at: changeset.deletedAt,
      }))
      .where(filter((a) => typeof a !== 'undefined', {
        volunteer_project_id: project.id,
        volunteer_project_name: project.name,
        organisation_id: project.organisationId,
        deleted_at: project.deletedAt,
      }))
      .returning([
        'volunteer_project_id AS id',
        'organisation_id AS organisationId',
        'volunteer_project_name AS name',
        'created_at AS createdAt',
        'modified_at AS modifiedAt',
        'deleted_at AS deletedAt',
      ]);
  },

  async deleteProject (client, project) {
    return client.transaction(async (trx) => {
      const rows = await VolunteerLogs.updateProject(
        trx,
        project,
        { deletedAt: new Date() }
      );

      await trx('volunteer_hours_log')
        .update({ volunteer_project_id: null })
        .where({ volunteer_project_id: project.id });

      return rows.length;
    });
  },

  async syncLogs (client, communityBusiness, user, logs) {
    // can user write logs for others?
    const doAnyLogsTargetOtherUsers = logs.some((log) => log.userId !== user.id);
    const canUserWriteOthersLogs = await VolunteerLogPermissions.canWriteOthers(client, user);
    if (doAnyLogsTargetOtherUsers && !canUserWriteOthersLogs) {
      throw new Error('Insufficient permissions to write other users logs');
    }

    // do all logs correspond to users who can add logs?
    const targetUsersCheck = await Promise.all(logs
      .filter((log) => log.userId !== user.id)
      .map((log) => VolunteerLogPermissions.canWriteOwn(client, log.userId)));

    if (!targetUsersCheck.every((a) => a)) {
      throw new Error('Some users do not have permission to write volunteer logs');
    }

    const results = await Promises.some(logs.map(async (log) => {
      const existsInDB = log.hasOwnProperty('id');
      const shouldUpdate = existsInDB && !log.deletedAt;
      const shouldDelete = existsInDB && log.deletedAt;

      try {
        if (shouldUpdate) {

          return VolunteerLogs.update(client,
            { id: log.id, organisationId: communityBusiness.id },
            {
              ...omit(['id', 'deletedAt'], log),
              organisationId: communityBusiness.id,
            }
          );

        } else if (shouldDelete) {

          return VolunteerLogs.update(client, { id: log.id }, { deletedAt: log.deletedAt });

        } else {
          // otherwise, add log to DB

          return VolunteerLogs.add(client, {
            ...log,
            createdBy: user.id,
            organisationId: communityBusiness.id,
          });

        }

      } catch (error) {
        silent(VolunteerLogs.recordInvalidLog(
          client,
          user,
          communityBusiness,
          { message: error.message, stack: error.stack, payload: log }
        ));

        throw error;
      }
    }));

    return results.reduce((acc, result, i) => {
      if (result instanceof Error) {
        acc.ignored = acc.ignored + 1;
      } else {
        acc.synced = acc.synced + 1;
      }
      return acc;
    }, { ignored: 0, synced: 0 });
  },
};


const VolunteerLogPermissions = {
  async canWriteOwn (client: Knex, user: User | number) {
    return Permissions.userHas(client, {
      resource: ResourceEnum.VOLUNTEER_LOGS,
      access: AccessEnum.WRITE,
      permissionLevel: PermissionLevelEnum.OWN,
      userId: typeof user === 'number' ? user : user.id,
    });
  },

  async canWriteOthers (client: Knex, user: User) {
    const canWrite = await Promise.all(
      [PermissionLevelEnum.SIBLING, PermissionLevelEnum.CHILD]
        .map((permissionLevel) => ({
          permissionLevel,
          resource: ResourceEnum.VOLUNTEER_LOGS,
          access: AccessEnum.WRITE,
          userId: user.id,
        }))
        .map((args) => Permissions.userHas(client, args))
    );

    return canWrite.some((a) => a);
  },
};
