import {useQuery, useZero} from '@rocicorp/zero/react';
import {createFileRoute} from '@tanstack/react-router';
import {Mutators} from '../../zero/mutators';
import {authClient} from '../../auth/client';
import {Schema} from '../../zero/schema';
import {SiteLayout} from '../components/site-layout';

export const Route = createFileRoute('/cart')({
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
      .related('album', album => album.one())
      .where('userId', session.data?.user.id),
  );

  return (
    <SiteLayout>
      <h1>Cart</h1>
      <ul>
        {cartItems.map(item => (
          <li key={item.albumId}>{item.album?.title}</li>
        ))}
      </ul>
    </SiteLayout>
  );
}
