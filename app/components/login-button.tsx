import {authClient} from '../../auth/client';

export function LoginButton() {
  const session = authClient.useSession();
  if (session.data?.user) {
    return (
      <div>
        {session.data.user.email}{' '}
        <button onClick={() => authClient.signOut()}>Sign out</button>
      </div>
    );
  }
  return (
    <button
      onClick={() =>
        authClient.signIn.social({
          provider: 'github',
          callbackURL: '/',
          errorCallbackURL: '/',
          newUserCallbackURL: '/',
        })
      }
    >
      Sign in
    </button>
  );
}
