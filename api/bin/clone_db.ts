/*
 * Clone remote heroku database to local database
 *
 * Usage:
 *  npm run exec ./bin/clone_db.ts -- db_name [--clean] [--app=APP_NAME]
 *
 * Arguments:
 *  db_name: Name of local database to create to hold the contents of the remote
 *
 * Flags:
 *  clean: Boolean flag; determines whether to delete any existing dump file
 *  app: Name of heroku app from which to clone DB. Default = twine-api
 *
 * Note: Including the argument separator `--` before any of the flags is important.
 *       Without it, the argument parsing will not work.
 */
import * as path from 'path';
import { exists as existsOld } from 'fs';
import { exec as execOld } from 'child_process';
import { promisify } from 'util';
import * as parse from 'minimist';


const exec = promisify(execOld);
const exists = promisify(existsOld);

process.on('unhandledRejection', (err) => { throw err; });

const { _: [dbName], clean, app = 'twine-api' } = parse(process.argv.slice(2));

if (!dbName) {
  throw new Error('Missing arguments');
}

(async () => {
  try {
    if (clean) {
      await exec('rm latest.dump');
    }

    await exec(`psql -c "drop database if exists \\"${dbName}\\""`);
    await exec(`createdb ${dbName}`);

    if (await exists(path.resolve(__dirname, '..', 'latest.dump'))) {
      console.log('Using existing dumpfile');
    } else {
      await exec(`heroku pg:backups:download -a ${app}`);
    }

    await exec(`pg_restore --clean --if-exists --no-acl --no-owner -h localhost -d ${dbName} latest.dump`);
  } catch (error) {
    console.log(error);
  }
})();
