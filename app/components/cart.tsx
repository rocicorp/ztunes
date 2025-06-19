import {useZero, useQuery} from '@rocicorp/zero/react';
import {Schema} from 'zero/schema';
import {authClient} from 'auth/client';
import {Link} from './link';

export function Cart() {
  const session = authClient.useSession();
  const z = useZero<Schema>();

  const [items] = useQuery(
    z.query.cartItem
      .where('userId', session.data?.user.id ?? '')
      .orderBy('addedAt', 'asc'),
  );

  if (!session.data) {
    return null;
  }

  return <Link to="/cart">Cart ({items.length ?? 0})</Link>;
}
