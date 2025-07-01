import {useQuery, useZero} from '@rocicorp/zero/react';
import {createFileRoute} from '@tanstack/react-router';
import {Mutators} from 'zero/mutators';
import {Schema} from 'zero/schema';
import {Button} from 'app/components/button';
import {SessionContextType, useSession} from 'app/components/session-provider';
import {Zero} from '@rocicorp/zero';

function query(
  z: Zero<Schema>,
  _params: undefined,
  _search: undefined,
  session: SessionContextType,
) {
  return z.query.cartItem
    .related('album', album =>
      album.one().related('artist', artist => artist.one()),
    )
    .where('userId', session.data?.userID ?? '')
    .orderBy('addedAt', 'asc');
}

export const Route = createFileRoute('/_layout/cart')({
  component: RouteComponent,
  ssr: false,
  staticData: {
    query,
  },
});

function RouteComponent() {
  const session = useSession();
  const z = useZero<Schema, Mutators>();
  const [cartItems] = useQuery(query(z, undefined, undefined, session));
  if (!session.data) {
    return <div>Login to view cart</div>;
  }

  const onRemove = (albumID: string) => {
    z.mutate.cart.remove(albumID);
  };

  return (
    <>
      <h1>Cart</h1>
      <table cellPadding={0} cellSpacing={0} border={0} style={{width: 500}}>
        <tbody>
          {cartItems.map(item =>
            item.album ? (
              <tr key={item.albumId}>
                <td>
                  {item.album?.title} ({item.album?.artist?.name})
                </td>
                <td style={{paddingLeft: '1em'}}>
                  <Button onPress={() => onRemove(item.albumId)}>Remove</Button>
                </td>
              </tr>
            ) : null,
          )}
        </tbody>
      </table>
    </>
  );
}
