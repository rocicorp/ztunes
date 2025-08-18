import {json} from '@tanstack/react-start';
import type {ReadonlyJSONValue} from '@rocicorp/zero';
import {anon, authed} from 'zero/queries';
import {schema} from 'zero/schema';
import {createServerFileRoute} from '@tanstack/react-start/server';
import {getQueries} from '@rocicorp/zero/server';
import {authHeader} from 'auth/auth-header';

export const ServerRoute = createServerFileRoute(
  '/api/zero/get-queries',
).methods({
  POST: async ({request}) => {
    const authResult = await authHeader(request);
    if ('error' in authResult) {
      return json({error: authResult.error}, {status: 401});
    }

    const {userID} = authResult;

    return json(
      await getQueries(
        async (name, args) => ({
          query: getQuery(userID, name, args),
        }),
        schema,
        request,
      ),
    );
  },
});

export function getQuery(
  userID: string | undefined,
  name: string,
  args: readonly ReadonlyJSONValue[],
) {
  // TODO: Validate!
  if (name in anon) {
    return anon[name as any](...args);
  } else if (name in authed) {
    return authed[name as any](userID ?? '', ...args);
  } else {
    throw new Error(`Unknown query: ${name}`);
  }
}
