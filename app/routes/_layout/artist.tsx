import {useQuery, useZero} from '@rocicorp/zero/react';
import {Query} from '@rocicorp/zero';
import {createFileRoute} from '@tanstack/react-router';
import {Schema} from 'zero/schema';
import {Mutators} from 'zero/mutators';
import {Button} from 'app/components/button';
import {useSession} from 'app/components/session-provider';
import {artistQuery} from 'zero/queries';

export const Route = createFileRoute('/_layout/artist')({
  component: RouteComponent,
  ssr: false,
  validateSearch: (params: Record<string, unknown>) => {
    return {
      id: typeof params.id === 'string' ? params.id : undefined,
    };
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  const id = search.id;

  if (!id) {
    return <div>Missing required search parameter id</div>;
  }
  return <Artist id={id}></Artist>;
}

function Artist({id}: {id: string}) {
  const session = useSession();
  const z = useZero<Schema, Mutators>();
  const [artist, {type}] = useQuery(artistQuery(id));

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
