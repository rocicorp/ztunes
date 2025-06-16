import {useQuery, useZero} from '@rocicorp/zero/react';
import {createFileRoute} from '@tanstack/react-router';
import {Mutators} from '../../../zero/mutators';
import {authClient} from '../../../auth/client';
import {Schema} from '../../../zero/schema';

export const Route = createFileRoute('/_layout/cart')({
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();
  if (!session.data?.user.id) {
    return <div>Login to view cart</div>;
  }
  const z = useZero<Schema, Mutators>();
  const [cartItems] = useQuery(
    z.query.cartItem
      .related('album', album =>
        album.one().related('artist', artist => artist.one()),
      )
      .where('userId', session.data?.user.id),
  );

  const onRemove = (albumID: string) => {
    z.mutate.cart.remove(albumID);
  };

  return (
    <>
      <h1>Cart</h1>
      <table cellPadding={0} cellSpacing={0} border={0} style={{width: 500}}>
        {cartItems.map(item =>
          item.album ? (
            <tr key={item.albumId}>
              <td>
                {item.album?.title} ({item.album?.artist?.name})
              </td>
              <td style={{paddingLeft: '1em'}}>
                <button onMouseDown={() => onRemove(item.albumId)}>
                  Remove
                </button>
              </td>
            </tr>
          ) : null,
        )}
      </table>
    </>
  );
}
