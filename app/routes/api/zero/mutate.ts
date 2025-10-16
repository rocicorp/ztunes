import {json} from '@tanstack/react-start';
import {PushProcessor} from '@rocicorp/zero/pg';
import {zeroPostgresJS} from '@rocicorp/zero/server/adapters/postgresjs';
import postgres from 'postgres';
import {schema} from 'zero/schema';
import {createMutators} from 'zero/mutators';
import {must} from 'shared/must';
import {createServerFileRoute} from '@tanstack/react-start/server';
import {auth} from 'auth/auth';

const pgURL = must(process.env.PG_URL, 'PG_URL is required');

const processor = new PushProcessor(zeroPostgresJS(schema, postgres(pgURL)));

export const ServerRoute = createServerFileRoute('/api/zero/mutate').methods({
  POST: async ({request}) => {
    const session = await auth.api.getSession(request);
    const userID = session?.user.id;
    console.log('!!!mutate-userID', userID);

    if (!session) {
      return json({error: 'Unauthorized'}, {status: 401});
    }

    try {
      const result = await processor.process(createMutators(userID), request);
      return json(result);
    } catch (err) {
      return json({error: 'Invalid token'}, {status: 401});
    }
  },
});
