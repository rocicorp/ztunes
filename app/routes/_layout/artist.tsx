import {useQuery} from '@rocicorp/zero/react';
import {createFileRoute, useRouter} from '@tanstack/react-router';
import {Button} from 'app/components/button';
import {authClient} from 'auth/client';
import {mutators} from 'zero/mutators';
import {queries} from 'zero/queries';

export const Route = createFileRoute('/_layout/artist')({
  component: RouteComponent,
  ssr: false,
  loaderDeps: ({search}) => ({artistId: search.id}),
  loader: async ({context, deps: {artistId}}) => {
    context.zero.run(queries.getArtist({artistId}));
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: typeof search.id === 'string' ? search.id : undefined,
    } as {id: string | undefined};
  },
});

function RouteComponent() {
  const session = authClient.useSession();
  const {zero} = useRouter().options.context;
  const {id: artistId} = Route.useSearch();

  if (!artistId) {
    return <div>Missing required search parameter id</div>;
  }

  const [artist, {type}] = useQuery(queries.getArtist({artistId}));

  if (!artist && type === 'complete') {
    return <div>Artist not found</div>;
  }

  if (!artist) {
    return null;
  }

  const cartButton = (album: (typeof artist.albums)[number]) => {
    if (!session.data?.user) {
      return <Button disabled>Login to shop</Button>;
    }

    const message =
      album.cartItems.length > 0 ? 'Remove from cart' : 'Add to cart';
    const action =
      album.cartItems.length > 0
        ? () => zero.mutate(mutators.cart.remove({albumId: album.id}))
        : () =>
            zero.mutate(
              mutators.cart.add({albumId: album.id, addedAt: Date.now()}),
            );
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
