import {jwt} from 'better-auth/plugins';
import {createAuthClient} from 'better-auth/react';

export const authClient = createAuthClient({
  plugins: [],
});
