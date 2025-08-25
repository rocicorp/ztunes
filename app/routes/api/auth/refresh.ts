import {createServerFileRoute} from '@tanstack/react-start/server';
import {auth, setCookies} from 'auth/init';
import {z} from 'zod';

const tokenSchema = z.object({
  token: z.string(),
});

export const ServerRoute = createServerFileRoute('/api/auth/refresh').methods({
  GET: async ({request}) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      console.info('Could not get session');
      return unauthorized();
    }

    const token = await getJwtToken(request.headers);
    if (!token) {
      console.info('Could not get JWT token');
      return unauthorized();
    }

    console.info('Refreshed JWT token');
    return authorized(session.user.id, session.user.email, token);
  },
});

async function getJwtToken(headers: Headers) {
  const result = await fetch('/api/auth/token', {
    headers,
  });
  if (!result.ok) {
    console.error(
      'could not refresh JWT token - api returned non-200',
      await result.text(),
    );
    return null;
  }
  const body = await result.json();
  const res = tokenSchema.safeParse(body);
  if (!res.success) {
    console.error(
      'could not refresh JWT token - response invalid: ' + res.error.message,
      body,
    );
    return null;
  }
  return res.data.token;
}

function unauthorized() {
  return createResponse(401, '', '', '');
}

function authorized(userid: string, email: string, jwt: string) {
  return createResponse(200, userid, email, jwt);
}

function createResponse(
  status: number,
  userid: string,
  email: string,
  jwt: string,
) {
  const headers = new Headers();
  setCookies(headers, {
    userid,
    email,
    jwt,
  });
  return new Response(null, {
    status,
    headers,
  });
}
