import {json} from '@tanstack/react-start';
import {withValidation, type ReadonlyJSONValue} from '@rocicorp/zero';
import {schema} from 'zero/schema';
import {createServerFileRoute} from '@tanstack/react-start/server';
import {handleGetQueriesRequest} from '@rocicorp/zero/server';
import {authHeader} from 'auth/auth-header';
import {artistPage} from 'app/routes/_layout/artist';
import {cartPage} from 'app/routes/_layout/cart';
import {indexPage} from 'app/routes/_layout';
import {cartComponent} from 'app/components/cart';
import {preload} from 'app/components/zero-init';

const queries = Object.fromEntries(
  [indexPage, artistPage, preload, cartComponent, cartPage].map(q => [
    q.queryName,
    withValidation(q),
  ]),
);

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
      await handleGetQueriesRequest(
        async (name, args) => ({
          query: getQuery(userID ?? '', name, args),
        }),
        schema,
        request,
      ),
    );
  },
});

export function getQuery(
  userID: string,
  name: string,
  args: readonly ReadonlyJSONValue[],
) {
  if (name in queries) {
    const q = queries[name];
    return q(userID, ...args);
  }
  throw new Error(`Unknown query: ${name}`);
}
