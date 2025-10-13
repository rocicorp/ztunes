import {json} from '@tanstack/react-start';
import {schema} from 'zero/schema';
import * as jose from 'jose';
import {must} from 'shared/must';
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
    const userID = await getUserID(request);
    if (typeof userID === 'object') {
      return userID;
    }

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

async function getUserID(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return undefined;
  }

  const prefix = 'Bearer ';
  if (!authHeader.startsWith(prefix)) {
    return json(
      {error: 'Missing or invalid authorization header'},
      {status: 401},
    );
  }

  const token = authHeader.slice(prefix.length);
  const set = await auth.api.getJwks();
  const jwks = jose.createLocalJWKSet(set);

  try {
    const {payload} = await jose.jwtVerify(token, jwks);
    return must(payload.sub, 'Empty sub in token');
  } catch (err) {
    console.info('Could not verify token: ' + (err.message ?? String(err)));
    return json({error: 'Invalid token'}, {status: 401});
  }
}
