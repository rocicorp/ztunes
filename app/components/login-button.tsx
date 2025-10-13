import {Button} from './button';
import {authClient} from 'auth/client';
import {login, logout} from 'auth/client';

export function LoginButton() {
  const session = authClient.useSession();
  if (session.data?.user) {
    return (
      <div>
        {session.data?.user.email}{' '}
        <Button onPress={() => logout()}>Sign out</Button>
      </div>
    );
  }
  return <Button onPress={() => login()}>Sign in</Button>;
}
