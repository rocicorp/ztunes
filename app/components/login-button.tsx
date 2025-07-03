import {useRouter} from '@tanstack/react-router';
import {Button} from './button';

export function LoginButton() {
  const {session} = useRouter().options.context;
  if (session.data) {
    return (
      <div>
        {session.data.email}{' '}
        <Button onPress={() => session.logout()}>Sign out</Button>
      </div>
    );
  }
  return <Button onPress={() => session.login()}>Sign in</Button>;
}
