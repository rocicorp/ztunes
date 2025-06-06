import {useQuery, useZero} from '@rocicorp/zero/react';
import {type Schema} from '../../zero/schema';
import {createFileRoute} from '@tanstack/react-router';
import {useState} from 'react';

export const Route = createFileRoute('/')({
  component: Home,
  ssr: false,
});

function Home() {
  const z = useZero<Schema>();
  const [search, setSearch] = useState('');

  let q = z.query.artist.related('albums').orderBy('name', 'asc').limit(100);
  if (search) {
    q = q.where('name', 'ILIKE', `%${search}%`);
  }

  const [artists] = useQuery(q);

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
