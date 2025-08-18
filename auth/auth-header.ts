import {auth} from 'auth/init';
import * as jose from 'jose';
import {must} from 'shared/must';

export async function authHeader(
  request: Request,
): Promise<{error: string} | {userID: string | undefined}> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return {userID: undefined};
  }

  const prefix = 'Bearer ';
  if (!authHeader.startsWith(prefix)) {
    return {error: 'Missing or invalid authorization header'};
  }

  const token = authHeader.slice(prefix.length);
  const set = await auth.api.getJwks();
  const jwks = jose.createLocalJWKSet(set);

  try {
    const {payload} = await jose.jwtVerify(token, jwks);
    return {userID: must(payload.sub, 'Empty sub in token')};
  } catch (err) {
    console.info('Could not verify token: ' + (err.message ?? String(err)));
    return {error: 'Invalid token'};
  }
}
