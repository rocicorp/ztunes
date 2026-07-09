import {createFileRoute, useRouter} from '@tanstack/react-router';
import {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {Link} from 'app/components/link';
import {queries, StartRow} from 'zero/queries';
import {useQuery} from '@rocicorp/zero/react';
import {
  useHistoryScrollState,
  useZeroVirtualizer,
  type GetPageQueryOptions,
  type GetSingleQueryOptions,
} from '@rocicorp/zero-virtual/react';
import {Row} from '@rocicorp/zero';

export const Route = createFileRoute('/_layout/')({
  component: Home,
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
    } as {q?: string | undefined};
  },
  loaderDeps: ({search}) => ({q: search.q}),
  loader: async ({context, deps: {q}}) => {
    context.zero?.run(queries.zeroOnlyProbe());
    context.zero?.run(queries.getHomepageArtists({search: q}));
  },
});

function getRowKey(item: Row['artist']) {
  return item.id;
}

function toStartRow(item: Row['artist']) {
  return {id: item.id, popularity: item.popularity};
}

function estimateSize() {
  return 28;
}

function getOptions(settled: boolean) {
  return {ttl: settled ? '5m' : 'none'} as const;
}

function Home() {
  const router = useRouter();
  useQuery(queries.zeroOnlyProbe());

  const qs = Route.useSearch();
  const searchParam = qs.q ?? '';
  const [search, setSearch] = useState(searchParam);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  const parentRef = useRef<HTMLDivElement>(null);
  const listContextParams = useMemo(() => ({search}), [search]);
  const [scrollState, setScrollState] = useHistoryScrollState<StartRow>();

  const {virtualizer, rowAt, settled} = useZeroVirtualizer({
    listContextParams,
    getScrollElement: useCallback(() => parentRef.current, []),
    estimateSize,
    getRowKey,
    toStartRow,
    getPageQuery: useCallback(
      ({limit, start, dir, settled}: GetPageQueryOptions<StartRow>) => {
        return {
          query: queries.getHomepageArtists({search, limit, start, dir}),
          options: getOptions(settled),
        };
      },
      [search],
    ),
    getSingleQuery: useCallback(({id, settled}: GetSingleQueryOptions) => {
      return {
        query: queries.getSingleArtist({artistId: id}),
        options: getOptions(settled),
      };
    }, []),
    scrollState,
    onScrollStateChange: setScrollState,
    settleTime: 1000,
    onSettled: useCallback(() => {
      const currentQ = router.state.location.search.q ?? '';
      if (search !== currentQ) {
        router.navigate({
          to: '/',
          search: {q: search || undefined},
        });
      }
    }, [router, search]),
  });

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{margin: '1em 0 0.2em 0'}}>
          Search 85,000 artists from the 1990s...
        </h3>
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          style={{fontSize: '125%', width: '100%', boxSizing: 'border-box'}}
        />
      </div>
      <div
        ref={parentRef}
        style={{flex: 1, minHeight: 0, marginTop: 12, overflow: 'auto'}}
      >
        <div style={{height: virtualizer.getTotalSize(), position: 'relative'}}>
          {virtualItems.map(virtualRow => {
            const row = rowAt(virtualRow.index);
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                style={{
                  position: 'absolute',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row ? (
                  <Link
                    to="/artist"
                    search={{id: row.id}}
                    preload={settled ? 'viewport' : false}
                  >
                    {row.name}
                  </Link>
                ) : (
                  <div>Loading...</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
