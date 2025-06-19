import {useLocation} from '@tanstack/react-router';
import {authClient} from 'auth/client';
import {Button} from './button';

export function LoginButton() {
  const location = useLocation();
  const session = authClient.useSession();
  if (session.data?.user) {
    return (
      <div>
        {session.data.user.email}{' '}
        <Button onPress={() => authClient.signOut()}>Sign out</Button>
      </div>
    );
  }
  const callbackURL = location.href;
  return (
    <Button
      onPress={() =>
        authClient.signIn.social({
          provider: 'github',
          callbackURL,
          errorCallbackURL: callbackURL,
          newUserCallbackURL: callbackURL,
        })
      }
    >
      Sign in
    </Button>
  );
}
