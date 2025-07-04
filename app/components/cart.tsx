import {useQuery} from '@rocicorp/zero/react';
import {Link} from './link';
import {useRouter} from '@tanstack/react-router';
import {getCartItems} from 'zero/queries';

export function Cart() {
  const {zero, session} = useRouter().options.context;

  const [items] = useQuery(getCartItems({userID: session.data?.userID ?? ''}), {
    ttl: '1m',
  });

  if (!session.data) {
    return null;
  }

  return <Link to="/cart">Cart ({items.length ?? 0})</Link>;
}
