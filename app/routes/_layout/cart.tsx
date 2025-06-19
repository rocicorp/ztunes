import {useQuery, useZero} from '@rocicorp/zero/react';
import {createFileRoute} from '@tanstack/react-router';
import {Mutators} from 'zero/mutators';
import {authClient} from 'auth/client';
import {Schema} from 'zero/schema';
import {Button} from 'app/components/button';

export const Route = createFileRoute('/_layout/cart')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const session = authClient.useSession();
  const z = useZero<Schema, Mutators>();
  const [cartItems] = useQuery(
    z.query.cartItem
      .related('album', album =>
        album.one().related('artist', artist => artist.one()),
      )
      .where('userId', session.data?.user.id ?? ''),
  );

  if (!session.data?.user.id) {
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
