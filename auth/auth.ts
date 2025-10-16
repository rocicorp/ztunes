import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {db} from 'db';
import {must} from 'shared/must';
import * as schema from './schema';

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
  socialProviders: {
    github: {
      clientId: clientID,
      clientSecret: clientSecret,
    },
  },
  advanced: process.env.COOKIE_DOMAIN
    ? {
        crossSubDomainCookies: {
          enabled: true,
          domain: process.env.COOKIE_DOMAIN,
        },
      }
    : undefined,
});
