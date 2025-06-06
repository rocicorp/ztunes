import {useQuery, useZero} from '@rocicorp/zero/react';
import {createFileRoute} from '@tanstack/react-router';
import {Schema} from '../../zero/schema';

export const Route = createFileRoute('/artist')({
  component: RouteComponent,
  ssr: false,
  validateSearch: (params: Record<string, unknown>) => {
    return {
      id: typeof params.id === 'string' ? params.id : undefined,
    };
  },
});

function RouteComponent() {
  const z = useZero<Schema>();
  const search = Route.useSearch();
  const id = search.id;

  if (!id) {
    return <div>Missing required search parameter id</div>;
  }

  const [artist, {type}] = useQuery(
    z.query.artist
      .where('id', id)
      .related('albums', album => album.orderBy('year', 'desc'))
      .one(),
  );

  if (!artist && type === 'complete') {
    return <div>Artist not found</div>;
  }

  // TODO: Figure out suspense?
  if (!artist) {
    return null;
  }

  return (
    <>
      <h1>{artist.name}</h1>
      <ul>
        {artist.albums.map(album => (
          <li key={album.id}>{album.title}</li>
        ))}
      </ul>
    </>
  );
}
