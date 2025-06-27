import {useQuery, useZero} from '@rocicorp/zero/react';
import {type Schema} from 'zero/schema';
import {createFileRoute, useRouter} from '@tanstack/react-router';
import {useEffect, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';
import {Link} from 'app/components/link';

export const Route = createFileRoute('/_layout/')({
  component: Home,
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
    } as {q?: string | undefined};
  },
});

function Home() {
  const z = useZero<Schema>();
  const router = useRouter();
  const limit = 20;

  const [search, setSearch] = useState('');
  const searchParam = Route.useSearch().q;
  useEffect(() => {
    setSearch(searchParam ?? '');
  }, [searchParam]);

  let q = z.query.artist.orderBy('popularity', 'desc').limit(limit);
  if (search) {
    q = q.where('name', 'ILIKE', `%${search}%`);
  }

  const [artists, {type}] = useQuery(q, {ttl: '1m'});

  const setSearchParam = useDebouncedCallback((text: string) => {
    router.navigate({
      to: '/',
      search: {
        q: text,
      },
    });
  }, 500);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSearchParam(e.target.value);
  };

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{margin: '1em 0 0.2em 0'}}>Search 85,000 Artists...</h3>
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          style={{fontSize: '125%'}}
        />
      </div>
      <ul style={{listStyle: 'none', padding: 0}}>
        {artists.map(artist => (
          <li key={artist.id} style={{marginBottom: '0.2em'}}>
            <Link to="/artist" search={{id: artist.id}}>
              {artist.name}
            </Link>
          </li>
        ))}
        {type === 'unknown' && artists.length < limit && <div>Loading...</div>}
      </ul>
    </>
  );
}
