import {useQuery} from '@rocicorp/zero/react';
import {Link} from './link';
import {useRouter} from '@tanstack/react-router';
import {queries} from 'zero/queries';

export function Cart() {
  const {session} = useRouter().options.context;

  const [items] = useQuery(queries.getCartItems(session.data?.userID ?? ''));

  if (!session.data) {
    return null;
  }

  return <Link to="/cart">Cart ({items.length ?? 0})</Link>;
}
