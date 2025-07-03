import {useZero, useQuery} from '@rocicorp/zero/react';
import {Schema} from 'zero/schema';
import {Link} from './link';
import {useSession} from './session-provider';

export function Cart() {
  const session = useSession();
  const z = useZero<Schema>();

  const [items] = useQuery(
    z.query.cartItem
      .where('userId', session.data?.userID ?? '')
      .orderBy('addedAt', 'asc'),
    {
      ttl: '1m',
    },
  );

  if (!session.data) {
    return null;
  }

  return <Link to="/cart">Cart ({items.length ?? 0})</Link>;
}
