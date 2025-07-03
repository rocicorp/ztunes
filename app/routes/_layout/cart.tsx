import {useQuery} from '@rocicorp/zero/react';
import {createFileRoute, useRouter} from '@tanstack/react-router';
import {Mutators} from 'zero/mutators';
import {Schema} from 'zero/schema';
import {Button} from 'app/components/button';
import {Zero} from '@rocicorp/zero';

function query(z: Zero<Schema, Mutators>, userID: string | undefined) {
  return z.query.cartItem
    .related('album', album =>
      album.one().related('artist', artist => artist.one()),
    )
    .where('userId', userID ?? '');
}

export const Route = createFileRoute('/_layout/cart')({
  component: RouteComponent,
  ssr: false,
  loader: async ({context}) => {
    console.log('preloading cart', context.session);
    const {zero, session} = context;
    const userID = session.data?.userID;
    if (userID) {
      query(zero, userID).preload({ttl: '5m'}).cleanup();
    }
  },
});

function RouteComponent() {
  const {zero, session} = useRouter().options.context;
  const [cartItems, {type: resultType}] = useQuery(
    query(zero, session.data?.userID),
  );

  if (!session.data) {
    return <div>Login to view cart</div>;
  }

  const onRemove = (albumID: string) => {
    zero.mutate.cart.remove(albumID);
  };

  return (
    <>
      <h1>Cart</h1>
      {cartItems.length === 0 && resultType === 'complete' ? (
        <div>No items in cart 😢</div>
      ) : (
        <table cellPadding={0} cellSpacing={0} border={0} style={{width: 500}}>
          <tbody>
            {cartItems.map(item =>
              item.album ? (
                <tr key={item.albumId}>
                  <td>
                    {item.album?.title} ({item.album?.artist?.name})
                  </td>
                  <td style={{paddingLeft: '1em'}}>
                    <Button onPress={() => onRemove(item.albumId)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ) : null,
            )}
          </tbody>
        </table>
      )}
    </>
  );
}
