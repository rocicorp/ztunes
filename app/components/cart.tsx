import {useQuery} from '@rocicorp/zero/react';
import {Link} from './link';
import {useRouter} from '@tanstack/react-router';

export function Cart() {
  const {zero, session} = useRouter().options.context;

  const [items] = useQuery(
    zero.query.cartItem
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
