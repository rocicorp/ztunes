import {useQuery} from '@rocicorp/zero/react';
import {Link} from './link';
import {queries} from 'zero/queries';

export function Cart() {
  const [items] = useQuery(queries.getCartItems());
  return <Link to="/cart">Cart ({items.length ?? 0})</Link>;
}
