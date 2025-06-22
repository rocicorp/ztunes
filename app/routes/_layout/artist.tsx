import {useQuery, useZero} from '@rocicorp/zero/react';
import {Query} from '@rocicorp/zero';
import {createFileRoute} from '@tanstack/react-router';
import {Schema} from 'zero/schema';
import {Mutators} from 'zero/mutators';
import {Button} from 'app/components/button';
import {useSession} from 'app/components/session-provider';

export const Route = createFileRoute('/_layout/artist')({
  component: RouteComponent,
  ssr: false,
  validateSearch: (params: Record<string, unknown>) => {
    return {
      id: typeof params.id === 'string' ? params.id : undefined,
    };
  },
});

export function artistQuery(query: Query<Schema, 'artist'>) {
  return query.related('albums', album =>
    album.related('cartItems', ci => ci.one()).orderBy('year', 'desc'),
  );
}

function RouteComponent() {
  const session = useSession();
  const z = useZero<Schema, Mutators>();
  const search = Route.useSearch();
  const id = search.id;

  if (!id) {
    return <div>Missing required search parameter id</div>;
  }

  const [artist, {type}] = useQuery(
    artistQuery(z.query.artist.where('id', id)).one(),
  );

  if (!artist && type === 'complete') {
    return <div>Artist not found</div>;
  }

  // TODO: Figure out suspense?
  if (!artist) {
    return null;
  }

  const cartButton = (album: (typeof artist.albums)[number]) => {
    if (!session.data) {
      return <Button disabled>Login to shop</Button>;
    }

    const message = album.cartItems ? 'Remove from cart' : 'Add to cart';
    const action = album.cartItems
      ? () => z.mutate.cart.remove(album.id)
      : () => z.mutate.cart.add({albumID: album.id, addedAt: Date.now()});
    return <Button onPress={action}>{message}</Button>;
  };

  return (
    <>
      <h1>{artist.name}</h1>
      <ul>
        {artist.albums.map(album => (
          <li key={album.id}>
            {album.title} ({album.year}) {cartButton(album)}
          </li>
        ))}
      </ul>
    </>
  );
}
