import {useQuery} from '@rocicorp/zero/react';
import {Link} from './link';
import {useRouter} from '@tanstack/react-router';
import {builder} from 'zero/schema';
import {syncedQueryWithContext} from '@rocicorp/zero';
import z from 'zod';

export const cartComponent = syncedQueryWithContext(
  'cartComponent',
  z.tuple([]),
  (userID: string) => {
    return builder.cartItem.where('userId', userID).orderBy('addedAt', 'asc');
  },
);

export function Cart() {
  const {session} = useRouter().options.context;
  const [items] = useQuery(cartComponent(session.data?.userID ?? ''));

  if (!session.data) {
    return null;
  }

  return <Link to="/cart">Cart ({items.length ?? 0})</Link>;
}
