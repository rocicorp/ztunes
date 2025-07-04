import {json} from '@tanstack/react-start';
import {
  PushProcessor,
  ZQLDatabase,
  PostgresJSConnection,
} from '@rocicorp/zero/pg';
import postgres from 'postgres';
import {schema} from 'zero/schema';
import {createMutators} from 'zero/mutators';
import {must} from 'shared/must';
import {createServerFileRoute} from '@tanstack/react-start/server';
import {getUserID} from './-auth';

const pgURL = must(process.env.PG_URL, 'PG_URL is required');

const processor = new PushProcessor(
  new ZQLDatabase(new PostgresJSConnection(postgres(pgURL)), schema),
);

export const ServerRoute = createServerFileRoute('/api/zero/push').methods({
  POST: async ({request}) => {
    const res = await getUserID(request);
    if (typeof res === 'object') {
      return res;
    }

    const userID = res;

    try {
      const result = await processor.process(
        createMutators(userID ? {sub: userID} : undefined),
        request,
      );
      return json(result);
    } catch (err) {
      return json({error: 'Invalid token'}, {status: 401});
    }
  },
});
