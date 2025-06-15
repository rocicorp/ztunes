import {useQuery, useZero} from '@rocicorp/zero/react';
import {createFileRoute} from '@tanstack/react-router';
import {Mutators} from '../../../zero/mutators';
import {authClient} from '../../../auth/client';
import {Schema} from '../../../zero/schema';

export const Route = createFileRoute('/_layout/cart')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const session = authClient.useSession();
  if (!session.data?.user.id) {
    return <div>Login to view cart</div>;
  }
  const z = useZero<Schema, Mutators>();
  const [cartItems] = useQuery(
    z.query.cartItem
      .related('album', album => album.one())
      .where('userId', session.data?.user.id),
  );

  const onRemove = (albumID: string) => {
    z.mutate.cart.remove(albumID);
  };

  return (
    <>
      <h1>Cart</h1>
      <ul>
        {cartItems.map(item =>
          item.album ? (
            <li key={item.albumId}>
              {item.album?.title}{' '}
              <button onMouseDown={() => onRemove(item.albumId)}>Remove</button>
            </li>
          ) : null,
        )}
      </ul>
    </>
  );
}
