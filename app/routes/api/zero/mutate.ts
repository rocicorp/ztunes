import {handleMutateRequest} from '@rocicorp/zero/server';
import {zeroPostgresJS} from '@rocicorp/zero/server/adapters/postgresjs';
import postgres from 'postgres';
import {schema} from 'zero/schema';
import {must} from 'shared/must';
import {createFileRoute} from '@tanstack/react-router';
import {auth} from 'auth/auth';
import {mutators} from 'zero/mutators';
import {mustGetMutator} from '@rocicorp/zero';

const pgURL = must(process.env.PG_URL, 'PG_URL is required');

const dbProvider = zeroPostgresJS(schema, postgres(pgURL));

export const Route = createFileRoute('/api/zero/mutate')({
  server: {
    handlers: {
      POST: async ({request}) => {
        const session = await auth.api.getSession(request);

        if (!session) {
          return Response.json({error: 'Unauthorized'}, {status: 401});
        }

        const ctx = {userId: session.user.id};

        return Response.json(
          await handleMutateRequest({
            dbProvider,
            handler: async transact => {
              return await transact(async (tx, name, args) => {
                const mutator = mustGetMutator(mutators, name);
                return await mutator.fn({tx, ctx, args});
              });
            },
            request,
            userID: session.user.id,
          }),
        );
      },
    },
  },
});
