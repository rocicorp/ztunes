import {must} from 'shared/must';
import * as jose from 'jose';
import {json} from '@tanstack/react-start';

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
  const jwks = jose.createRemoteJWKSet(new URL('/api/auth/jwks', request.url));

  const {payload} = await jose.jwtVerify(token, jwks);
  return must(payload.sub, 'Empty sub in token');
}
