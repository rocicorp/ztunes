import {useQuery} from '@rocicorp/zero/react';
import {createFileRoute, useRouter} from '@tanstack/react-router';
import {Button} from 'app/components/button';
import {getArtist} from 'zero/queries';

export const Route = createFileRoute('/_layout/artist')({
  component: RouteComponent,
  ssr: false,
  loaderDeps: ({search}) => ({artistId: search.id}),
  loader: async ({context: {zero}, deps: {artistId}}) => {
    console.log('preloading artist', artistId);
    getArtist(artistId ?? '')
      .delegate(zero.queryDelegate)
      .preload({ttl: '5m'})
      .cleanup();
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: typeof search.id === 'string' ? search.id : undefined,
    } as {id: string | undefined};
  },
});

function RouteComponent() {
  const {zero, session} = useRouter().options.context;
  const {id} = Route.useSearch();

  if (!id) {
    return <div>Missing required search parameter id</div>;
  }

  const [artist, {type}] = useQuery(getArtist(id), {ttl: '5m'});

  if (!artist && type === 'complete') {
    return <div>Artist not found</div>;
  }

  if (!artist) {
    return null;
  }

  const cartButton = (album: (typeof artist.albums)[number]) => {
    if (!session.data) {
      return <Button disabled>Login to shop</Button>;
    }

    const message =
      album.cartItems.length > 0 ? 'Remove from cart' : 'Add to cart';
    const action =
      album.cartItems.length > 0
        ? () => zero.mutate.cart.remove(album.id)
        : () => zero.mutate.cart.add({albumID: album.id, addedAt: Date.now()});
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
