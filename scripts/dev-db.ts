import { execSync } from 'child_process';
import { must } from '../shared/must';
import '../shared/env';

const pgPassword = must(process.env.PG_PASSWORD, 'PG_PASSWORD is required');

function main() {
  try {
    console.log('Attempting to start existing ztunes container...');
    execSync('docker start -a ztunes', { stdio: 'inherit' });
    console.log('ztunes container started.');
  } catch (error) {
    console.log(
      'Existing ztunes container not found or could not be started. Creating a new one...',
    );
    try {
      execSync(
        `docker run --rm --name ztunes -e POSTGRES_PASSWORD=${pgPassword} -p 5432:5432 postgres -c wal_level=logical`,
        { stdio: 'inherit' },
      );
    } catch (runError) {
      console.error('Failed to create and run new container:', runError);
      process.exit(1);
    }
  }
}

main();
