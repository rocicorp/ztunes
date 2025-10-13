import {useQuery} from '@rocicorp/zero/react';
import {Link} from './link';
import {queries} from 'zero/queries';
import {authClient} from 'auth/client';

export function Cart() {
  const session = authClient.useSession();
  const [items] = useQuery(queries.getCartItems(session.data?.user.id ?? ''));
  if (!session.data?.user) {
    return null;
  }

  return <Link to="/cart">Cart ({items.length ?? 0})</Link>;
}
