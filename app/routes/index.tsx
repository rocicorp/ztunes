import {useQuery, useZero} from '@rocicorp/zero/react';
import {type Schema} from '../../zero/schema';
import {createFileRoute} from '@tanstack/react-router';
import {useWindowVirtualizer} from '@tanstack/react-virtual';
import {CSSProperties, useEffect, useRef, useState} from 'react';

export const Route = createFileRoute('/')({
  component: Home,
  ssr: false,
});

function Home() {
  const z = useZero<Schema>();
  const itemSize = 21;

  const [search, setSearch] = useState('');

  let q = z.query.artist.related('albums').orderBy('name', 'asc');
  if (search) {
    q = q.where('name', 'ILIKE', `%${search}%`);
  }

  const pageSize = Math.ceil(window.innerHeight / itemSize);
  const [limit, setLimit] = useState(pageSize);
  useEffect(() => {
    setLimit(pageSize);
    virtualizer.scrollToIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.hash()]);

  q = q.limit(limit);

  const [artists] = useQuery(q);
  const listRef = useRef<HTMLUListElement | null>(null);

  const virtualizer = useWindowVirtualizer({
    count: artists.length,
    estimateSize: () => itemSize,
    overscan: 0,
    scrollMargin: 0,
    getItemKey: index => artists[index].id,
  });
  const virtualItems = virtualizer.getVirtualItems();
  useEffect(() => {
    const [lastItem] = virtualItems.reverse();
    if (!lastItem) {
      return;
    }

    if (lastItem.index >= limit - pageSize / 4) {
      setLimit(limit + pageSize);
    }
  }, [limit, virtualItems]);

  const ArtistRow = ({index, style}: {index: number; style: CSSProperties}) => {
    return (
      <li style={{...style, position: 'absolute'}}>{artists[index].name}</li>
    );
  };

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul
        ref={listRef}
        style={{position: 'relative', listStyle: 'none', padding: 0}}
      >
        {virtualItems.map(virtualRow => (
          <ArtistRow
            key={virtualRow.key}
            index={virtualRow.index}
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </ul>
    </>
  );
}
