import {betterAuth, serializeCookie} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {db} from 'db';
import {must} from 'shared/must';
import * as schema from './schema';
import {createAuthMiddleware, getJwtToken, jwt} from 'better-auth/plugins';
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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [jwt()],
  socialProviders: {
    github: {
      clientId: clientID,
      clientSecret: clientSecret,
    },
  },
  hooks: {
    // TODO: Is there a better way to implement the below with better-auth?
    //
    // ========================================================================
    //
    // We want to boot the app as fast as is possible within the constraint of
    // it being an SPA.
    //
    // This means we want to minimize network requests before the app comes up,
    // and those we must do we want to do to the edge not origin server.
    //
    // Without authentication, we can do pretty well: we can serve the root page
    // and all assets from the edge. The root page will have maxage=0, and the
    // rest of the resources will be permacached. So we will end up with:
    //
    // Cold cache: edge (root) -> edge (assets) -> origin (data)
    // Warm cache: edge (root) -> origin (data)
    //
    // With authentication, using the default patterns from better-auth, we end
    // up with another round trip to origin to get session and JWT on startup:
    //
    // Cold cache: edge (root) -> edge (assets) -> origin (auth) -> origin (data)
    // Warm cache: edge (root) -> origin (auth) -> origin (data)
    //
    // We can do the session initialization on the server (in a TanStack
    // loader), but then our root page has to go to origin server:
    //
    // Cold cache: origin (root) -> edge (assets) -> origin (data)
    // Warm cache: origin (root) -> origin (data)
    //
    // By utilizing cookies, we preserve the performance of the non-auth'd
    // setup. The auth round trip is pushed to when you actually login/out.
    //
    // The downside is that it is less secure because the JWT is exposed to the
    // client. But that is only necessary because Zero requires the JWT on the
    // client currently. In the future, Zero will be able to directly utilize
    // cookie login and then the same setup can work w/o exposing the token to
    // the client.
    after: createAuthMiddleware(async ctx => {
      if (ctx.path.indexOf('/callback/') !== -1) {
        const headers = must(ctx.context.responseHeaders);
        const session = ctx.context.newSession;
        const token =
          ctx.context.responseHeaders?.get('set-auth-jwt') ||
          (await getJwtToken(ctx));

        if (session && token) {
          setCookies(headers, {
            userid: session.user.id,
            email: session.user.email,
            jwt: token,
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

function setCookies(headers: Headers, cookies: Record<string, string>) {
  const opts = {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  };
  for (const [key, value] of Object.entries(cookies)) {
    headers.append('Set-Cookie', cookie.serialize(key, value, opts));
  }
}
