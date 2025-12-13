import {json} from '@tanstack/react-start';
import {schema} from 'zero/schema';
import {createServerFileRoute} from '@tanstack/react-start/server';
import {auth} from 'auth/auth';
import {handleQueryRequest} from '@rocicorp/zero/server';
import {mustGetQuery} from '@rocicorp/zero';
import {queries} from 'zero/queries';

export const ServerRoute = createServerFileRoute(
  '/api/zero/get-queries',
).methods({
  POST: async ({request}) => {
    const session = await auth.api.getSession(request);
    const ctx = session ? {userId: session.user.id} : undefined;
    return json(
      await handleQueryRequest(
        (name, args) => {
          const query = mustGetQuery(queries, name);
          return query.fn({args, ctx});
        },
        schema,
        request,
      ),
    );
  },
});
