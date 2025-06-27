import {useQuery, useZero} from '@rocicorp/zero/react';
import {Zero} from '@rocicorp/zero';
import {createFileRoute} from '@tanstack/react-router';
import {Schema} from 'zero/schema';
import {Mutators} from 'zero/mutators';
import {Button} from 'app/components/button';
import {useSession} from 'app/components/session-provider';
import {must} from 'shared/must';

export const Route = createFileRoute('/_layout/artist')({
  component: RouteComponent,
  ssr: false,
  validateSearch: (params: Record<string, unknown>) => {
    return {
      id: typeof params.id === 'string' ? params.id : undefined,
    };
  },
  staticData: {
    query,
  },
});

// TODO: Can get type of params and search from route somehow?
// Tried Route['types']['params'] and Route['types']['searchSchema'] but
// (a) params not strongly typed and (b) referencing either causes
// circular definition.
function query(z: Zero<Schema>, _params: {}, search: {id: string | undefined}) {
  const id = must(search.id);
  return z.query.artist
    .where('id', id)
    .one()
    .related('albums', album =>
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

  const [artist, {type}] = useQuery(query(z, {}, {id}));

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
