import {json} from '@tanstack/react-start';
import {schema} from 'zero/schema';
import {createServerFileRoute} from '@tanstack/react-start/server';
import {auth} from 'auth/auth';
import {handleGetQueriesRequest} from '@rocicorp/zero/server';
import {ReadonlyJSONValue, withValidation} from '@rocicorp/zero';
import {queries} from 'zero/queries';

const validated = Object.fromEntries(
  Object.values(queries).map(q => [q.queryName, withValidation(q)]),
);

export const ServerRoute = createServerFileRoute(
  '/api/zero/get-queries',
).methods({
  POST: async ({request}) => {
    const session = await auth.api.getSession(request);
    const userID = session?.user.id;
    console.log('!!!userID', userID);
    return json(
      await handleGetQueriesRequest(
        (name, args) => getQuery(userID, name, args),
        schema,
        request,
      ),
    );
  },
});

function getQuery(
  userID: string | undefined,
  name: string,
  args: readonly ReadonlyJSONValue[],
) {
  const q = validated[name];
  if (!q) {
    throw new Error('Unknown query: ' + name);
  }
  return {query: q(userID, ...args)};
}
