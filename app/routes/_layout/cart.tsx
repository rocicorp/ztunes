import {useQuery} from '@rocicorp/zero/react';
import {createFileRoute, useRouter} from '@tanstack/react-router';
import {Button} from 'app/components/button';
import {authClient} from 'auth/client';
import {queries} from 'zero/queries';

export const Route = createFileRoute('/_layout/cart')({
  component: RouteComponent,
  ssr: false,
  loader: async ({context}) => {
    const session = await authClient.getSession();
    const {zero} = context;
    const userID = session.data?.user.id;
    if (userID) {
      zero.run(queries.getCartItems(userID));
    }
  },
});

function RouteComponent() {
  const session = authClient.useSession();
  const {zero} = useRouter().options.context;
  const [cartItems, {type: resultType}] = useQuery(
    queries.getCartItems(session.data?.user.id),
  );

  if (!session.data?.user) {
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
