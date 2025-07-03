import {useLocation} from '@tanstack/react-router';
import {Button} from './button';
import {useSession} from './session-provider';

export function LoginButton() {
  const location = useLocation();
  const session = useSession();
  if (session.data) {
    return (
      <div>
        {session.data.email}{' '}
        <Button onPress={() => session.logout()}>Sign out</Button>
      </div>
    );
  }
  const callbackURL = location.href;
  return <Button onPress={() => session.login()}>Sign in</Button>;
}
