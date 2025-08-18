import {useQuery} from '@rocicorp/zero/react';
import {queries} from '@rocicorp/zero';
import {createFileRoute, useRouter} from '@tanstack/react-router';
import {builder} from 'zero/schema';
import {Button} from 'app/components/button';

export const {artistPage} = queries({
  artistPage: (artistID: string) => {
    return builder.artist
      .where('id', artistID)
      .related('albums', album => album.related('cartItems'))
      .one();
  },
});

export const Route = createFileRoute('/_layout/artist')({
  component: RouteComponent,
  ssr: false,
  loaderDeps: ({search}) => ({artistId: search.id}),
  loader: async ({context, deps: {artistId}}) => {
    artistPage(artistId ?? '')
      .delegate(context.zero.queryDelegate)
      .run();
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

  const [artist, {type}] = useQuery(artistPage(id));

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
