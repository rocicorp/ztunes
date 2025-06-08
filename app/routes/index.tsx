import {useQuery, useZero} from '@rocicorp/zero/react';
import {type Schema} from '../../zero/schema';
import {createFileRoute, useRouter, Link} from '@tanstack/react-router';
import {useEffect, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';
import {LoginButton} from '../components/login-button';
import {Cart} from '../components/cart';
import {SiteLayout} from '../components/site-layout';

export const Route = createFileRoute('/')({
  component: Home,
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
    };
  },
});

function Home() {
  const z = useZero<Schema>();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const searchParam = Route.useSearch().q;
  useEffect(() => {
    setSearch(searchParam ?? '');
  }, [searchParam]);

  let q = z.query.artist
    .related('albums')
    .orderBy('popularity', 'desc')
    .limit(100);
  if (search) {
    q = q.where('name', 'ILIKE', `%${search}%`);
  }

  const [artists] = useQuery(q, {ttl: '1m'});

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
    <SiteLayout>
      <div>
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          style={{flex: 1}}
        />
      </div>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>
            <Link
              to="/artist"
              search={{id: artist.id}}
              onMouseDown={e => e.currentTarget.click()}
            >
              {artist.name}
            </Link>
          </li>
        ))}
      </ul>
    </SiteLayout>
  );
}
