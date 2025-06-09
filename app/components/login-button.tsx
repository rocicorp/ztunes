import {useLocation, useRouter} from '@tanstack/react-router';
import {authClient} from '../../auth/client';

export function LoginButton() {
  const location = useLocation();
  const session = authClient.useSession();
  if (session.data?.user) {
    return (
      <div>
        {session.data.user.email}{' '}
        <button onClick={() => authClient.signOut()}>Sign out</button>
      </div>
    );
  }
  const callbackURL = location.pathname + location.searchStr;
  return (
    <button
      onClick={() =>
        authClient.signIn.social({
          provider: 'github',
          callbackURL,
          errorCallbackURL: callbackURL,
          newUserCallbackURL: callbackURL,
        })
      }
    >
      Sign in
    </button>
  );
}
