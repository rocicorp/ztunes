import {useQuery, useZero} from '@rocicorp/zero/react';
import {type Schema} from '../../zero/schema';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
  ssr: false,
});

function Home() {
  const z = useZero<Schema>();
  const [artists] = useQuery(z.query.artist.orderBy('name', 'asc').limit(20));

  return (
    <>
      <h1>Artists</h1>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
