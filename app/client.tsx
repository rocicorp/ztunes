// app/client.tsx
/// <reference types="vinxi/types/client" />
import {hydrateRoot} from 'react-dom/client';
import {StartClient} from '@tanstack/react-start';
import {createRouter} from './router';
import {dropAllDatabases, Zero} from '@rocicorp/zero';
import {schema} from '../zero/schema';
import {ZeroProvider} from '@rocicorp/zero/react';

const router = createRouter();

const z = new Zero({
  userID: 'anon',
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema,
});

(window as any).__zero = z;
(window as any).__inspector = await z.inspect();

// TODO: OK this is not great 😅 and will be improved.
//
// Couple things going on:
//
// 1. Despite the name, we don't want "preload" queries to generally block the
//    queries made by the UI. We need better nomenclature here maybe. But
//    generally I think these queries should be lower-priority and allow the
//    data the UI actually needs to get synced first.
//
// 2. We have found that setting a long ttl is not a good idea for most apps,
//    because as the app changes, the developer changes the queries they want,
//    but we keep syncing old queries with long ttls anyway even though the
//    app doesn't need them.
//
//    Anyway, the way ttl works is it only comes into play when a query is *not*
//    active (when a window is running that does *not* include the query). So
//    for the common preload case the ttl doesn't need to be long, because the
//    preload query is always running. Basically it just needs to be long enough
//    so that the query doesn't accidentally get evicted during page navigation.
//    A minute is plenty.
//
// We are going to rework the ttl API to take both of these into account, but
// for now we do not recomend ttls longer than 1h, and for preload we only
// recommend 1m.
window.setTimeout(() => {
  // Why this particular preload?
  //
  // Well it's a value judgement. This UI sorts by name and has a search box.
  // The main way users will be interacting with this data is via search, so we
  // probably want at least the artist names available.
  //
  // Basically we are trying to optimize the chance that something the user will
  // do will respond instantly. Since the UI doesn't allow accessing albums
  // immediately we don't need that.
  //
  // The artist data is about 10MB uncompressed so if we were dealing with more
  // data, or if we wanted search to work over album titles too, we might want
  // to reconsider this. Perhaps in that case we'd preload a prefix of artists
  // and albums sorted by popularity, so that when you search, popular results
  // will show up first.
  z.query.artist.limit(10_000).preload({
    ttl: '1m',
  });
}, 1000);

hydrateRoot(
  document,
  <ZeroProvider zero={z}>
    <StartClient router={router} />
  </ZeroProvider>,
);
