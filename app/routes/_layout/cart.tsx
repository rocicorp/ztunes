import {useQuery} from '@rocicorp/zero/react';
import {createFileRoute, useRouter} from '@tanstack/react-router';
import {builder} from 'zero/schema';
import {Button} from 'app/components/button';
import {syncedQueryWithContext} from '@rocicorp/zero';
import z from 'zod';

export const cartPage = syncedQueryWithContext(
  'cartPage',
  z.tuple([]),
  (userID: string) => {
    return builder.cartItem
      .related('album', album =>
        album.one().related('artist', artist => artist.one()),
      )
      .where('userId', userID);
  },
);

export const Route = createFileRoute('/_layout/cart')({
  component: RouteComponent,
  ssr: false,
  loader: async ({context}) => {
    const {zero, session} = context;
    const userID = session.data?.userID;
    if (userID) {
      zero.run(cartPage(userID));
    }
  },
});

function RouteComponent() {
  const {zero, session} = useRouter().options.context;
  const [cartItems, {type: resultType}] = useQuery(
    cartPage(session.data?.userID ?? ''), // TODO: This is not correct
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
