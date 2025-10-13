import {createAuthClient} from 'better-auth/react';

export const authClient = createAuthClient({
  plugins: [],
});

export function login() {
  const callbackURL = location.href;
  authClient.signIn.social({
    provider: 'github',
    callbackURL,
    errorCallbackURL: callbackURL,
    newUserCallbackURL: callbackURL,
  });
}

export function logout() {
  authClient.signOut();
}
