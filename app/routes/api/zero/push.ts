import {json} from '@tanstack/react-start';
import {
  PushProcessor,
  ZQLDatabase,
  PostgresJSConnection,
} from '@rocicorp/zero/pg';
import postgres from 'postgres';
import {schema} from 'zero/schema';
import {createMutators} from 'zero/mutators';
import * as jose from 'jose';
import {must} from 'shared/must';
import {createServerFileRoute} from '@tanstack/react-start/server';
import {auth} from 'auth/auth';

const pgURL = must(process.env.PG_URL, 'PG_URL is required');

const processor = new PushProcessor(
  new ZQLDatabase(new PostgresJSConnection(postgres(pgURL)), schema),
);

export const ServerRoute = createServerFileRoute('/api/zero/push').methods({
  POST: async ({request}) => {
    const userID = await getUserID(request);
    if (typeof userID === 'object') {
      return userID;
    }

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
  const {payload} = await jose.jwtVerify(token, jwks);
  return must(payload.sub, 'Empty sub in token');
}
