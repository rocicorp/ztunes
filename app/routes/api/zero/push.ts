import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import {
  PushProcessor,
  ZQLDatabase,
  PostgresJSConnection,
} from '@rocicorp/zero/pg';
import postgres from 'postgres';
import { schema } from '../../../../zero/schema';
import { createMutators } from '../../../../zero/mutators';
import * as jose from 'jose';
import { must } from '../../../../shared/must';

const jwksURL = must(process.env.ZERO_AUTH_JWKS_URL, 'ZERO_AUTH_JWKS_URL is required');

const processor = new PushProcessor(
  new ZQLDatabase(
    new PostgresJSConnection(postgres(process.env.ZERO_UPSTREAM_DB! as string)),
    schema,
  ),
);

export const APIRoute = createAPIFileRoute('/api/zero/push')({
  POST: async ({ request }) => {
    const userID = await getUserID(request);
    if (typeof userID === 'object') {
      return userID;
    }

    try {
      const result = await processor.process(
        createMutators(userID ? { sub: userID } : undefined),
        request,
      );
      return json(result);
    } catch (err) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }
  },
})

async function getUserID(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return undefined;
  }

  const prefix = 'Bearer ';
  if (!authHeader.startsWith(prefix)) {
    return json({ error: 'Missing or invalid authorization header' }, { status: 401 });
  }

  const token = authHeader.slice(prefix.length);
  const jwks = jose.createRemoteJWKSet(new URL(jwksURL));

  const { payload } = await jose.jwtVerify(token, jwks);
  return must(payload.sub, 'Empty sub in token');
}
