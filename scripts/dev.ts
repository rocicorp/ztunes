import {concurrently} from 'concurrently';
import 'shared/env';
import {execSync} from 'child_process';

// Check env sync before starting dev servers
try {
  execSync('tsx scripts/check-env.ts', {stdio: 'inherit'});
} catch (error) {
  process.exit(1);
}

await concurrently([
  {
    command: 'pnpm run dev:clean && pnpm run dev:db',
    name: 'pg',
    prefixColor: '#32648c',
  },
  {command: 'pnpm run dev:ui', name: 'ts', prefixColor: '#7ce645'},
  {
    command:
      'until docker exec ztunes pg_isready -U postgres; do sleep 0.5; done && pnpm exec drizzle-kit push --force && pnpm run seed && sleep 1 && pnpm run dev:zero',
    name: 'z0',
    prefixColor: '#ff11cc',
  },
  {
    command:
      "chokidar 'db/schema.ts' 'auth/schema.ts' -c 'pnpm run generate-zero-schema'",
    name: 'gz',
    prefixColor: '#11ffcc',
  },
]).result;
