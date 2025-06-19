import { must } from 'shared/must';
import 'shared/env';
import { exec } from 'shared/exec';

const pgPassword = must(process.env.PG_PASSWORD, 'PG_PASSWORD is required');

function main() {
  try {
    console.log('Attempting to start existing zero-records container...');
    exec('docker start -a zero-records');
    console.log('zero-records container started.');
  } catch (error) {
    console.log(error.message);
    console.log(
      'Existing zero-records container not found or could not be started. Creating a new one...',
    );
    try {
      exec(
        `docker run --rm --name zero-records -e POSTGRES_PASSWORD=${pgPassword} -p 5432:5432 postgres -c wal_level=logical`,
      );
    } catch (runError) {
      console.error('Failed to create and run new container:', runError);
    }
  }
}

main();
