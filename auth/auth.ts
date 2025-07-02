import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {db} from 'db';
import {must} from 'shared/must';
import * as schema from './schema';
import {createAuthMiddleware, jwt} from 'better-auth/plugins';
import cookie from 'cookie';

const clientID = must(
  process.env.GITHUB_CLIENT_ID,
  'GITHUB_CLIENT_ID is required',
);
const clientSecret = must(
  process.env.GITHUB_CLIENT_SECRET,
  'GITHUB_CLIENT_SECRET is required',
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  plugins: [
    jwt({
      jwt: {
        // This is now long your websockets will be able to stay up. When the
        // websocket is closed, all the queries are dematerialized on the
        // server. So making the socket lifetime too short is bad for
        // performance.
        //
        // The Zero team is working on some improvements to auth that will
        // enable shorter-lived tokens.
        expirationTime: '1h',
      },
    }),
  ],
  socialProviders: {
    github: {
      clientId: clientID,
      clientSecret: clientSecret,
    },
  },
  hooks: {
    // We set the JWT, email, and userid in cookies to avoid needing an extra
    // round-trip to get them on startup.
    after: createAuthMiddleware(async ctx => {
      if (ctx.path.indexOf('/callback/') !== -1) {
        const headers = must(ctx.context.responseHeaders);
        const setCookieHeader = ctx.context.responseHeaders?.get('set-cookie');
        const cookieVal = setCookieHeader?.split(';')[0];

        const session = await auth.api.getSession({
          headers: new Headers({
            cookie: cookieVal ?? '',
          }),
        });
        const token = await auth.api.getToken({
          headers: new Headers({
            cookie: cookieVal ?? '',
          }),
        });

        if (session && token) {
          setCookies(headers, {
            userid: session.user.id,
            email: session.user.email,
            jwt: token.token,
          });
        }
        return;
      }

      if (ctx.path.indexOf('/sign-out') !== -1) {
        const headers = must(ctx.context.responseHeaders);
        setCookies(headers, {
          userid: '',
          email: '',
          jwt: '',
        });
        return;
      }
    }),
  },
});

export function setCookies(
  headers: Headers,
  cookies: {userid: string; email: string; jwt: string},
) {
  const opts = {
    // 1 year. Note that it doesn't really matter what this is as the JWT has
    // its own, much shorter expiry above. It makes sense for it to be long
    // since by default better auth will extend its own session indefinitely
    // as long as you keep calling getSession().
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  };
  for (const [key, value] of Object.entries(cookies)) {
    headers.append('Set-Cookie', cookie.serialize(key, value, opts));
  }
}
