import {json} from '@tanstack/react-start';
import {auth} from 'auth/auth';
import * as jose from 'jose';
import {must} from 'shared/must';

export async function getUserID(request: Request) {
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
