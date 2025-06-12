import { concurrently } from 'concurrently';
import { must } from '../shared/must';
import '../shared/env';

const pgAddress = must(process.env.PG_ADDRESS, 'PG_ADDRESS is required');

concurrently([
  {
    command: 'npm run dev:clean && npm run dev:db',
    name: 'pg',
    prefixColor: '#32648c',
  },
  { command: 'npm run dev:ui', name: 'ts', prefixColor: '#7ce645' },
  {
    command:
      `wait-on tcp:${pgAddress} && sleep 1 && npx drizzle-kit push --force && npm run seed`,
    name: 'sd',
    prefixColor: '#ff5515',
  },
  {
    command: `wait-on tcp:${pgAddress} && sleep 1 && npm run dev:zero`,
    name: 'z0',
    prefixColor: '#ff11cc',
  },
  {
    command:
      "chokidar 'db/schema.ts' 'auth/schema.ts' -c 'npm run generate-zero-schema'",
    name: 'gz',
    prefixColor: '#11ffcc',
  },
]);
