import {useZero, useQuery} from '@rocicorp/zero/react';
import {Schema} from '../../zero/schema';
import {authClient} from '../../auth/client';

export function Cart() {
  const session = authClient.useSession();
  const z = useZero<Schema>();

  if (!session.data) {
    return null;
  }

  const [cart] = useQuery(
    z.query.cart.where('userId', session.data.user.id).related('items').one(),
  );

  return <div>Cart ({cart?.items.length ?? 0})</div>;
}
