import {useRouter} from '@tanstack/react-router';
import {Button} from './button';
import {queries} from 'zero/queries';
import {useQuery} from '@rocicorp/zero/react';

export function LoginButton() {
  const {session} = useRouter().options.context;
  const [user] = useQuery(queries.user(session.data?.userID));
  if (user) {
    return (
      <div>
        {user.email} <Button onPress={() => session.logout()}>Sign out</Button>
      </div>
    );
  }
  return <Button onPress={() => session.login()}>Sign in</Button>;
}
