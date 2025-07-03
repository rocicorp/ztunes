import {Zero} from '@rocicorp/zero';
import {ZeroProvider} from '@rocicorp/zero/react';
import {schema, Schema} from 'zero/schema';
import {useMemo} from 'react';
import {createMutators, Mutators} from 'zero/mutators';
import {useRouter} from '@tanstack/react-router';
import {must} from 'shared/must';

const serverURL = must(
  import.meta.env.VITE_PUBLIC_SERVER,
  'VITE_PUBLIC_SERVER is required',
);

export function ZeroInit({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const {session} = router.options.context;

  const opts = useMemo(() => {
    return {
      schema,
      userID: session.data?.userID ?? 'anon',
      auth: session.zeroAuth,
      server: serverURL,
      mutators: createMutators(
        session.data?.userID ? {sub: session.data.userID} : undefined,
      ),
      init: (zero: Zero<Schema, Mutators>) => {
        router.update({
          context: {
            ...router.options.context,
            zero,
          },
        });

        router.invalidate();

        preload(zero);
      },
    };
  }, [session.data?.userID, router]);

  return <ZeroProvider {...opts}>{children}</ZeroProvider>;
}

function preload(z: Zero<Schema>) {
  // Delay preload() slightly to avoid blocking UI on first run. We don't need
  // this data to display the UI, it's used by search.
  setTimeout(() => {
    // Why this particular preload?
    //
    // The goal of Zero generally is for every user interaction to be instant.
    // This relies fundamentally on preloading data. But we cannot preload
    // everything, so preloading is at core about guessing data user will most
    // likely need. This is different in every app. Zero gives you the full
    // power of queries to express and orchestrate whatever preload sequence you
    // want.
    //
    // For this app, the primary interface is a search box. Users are more
    // likely to search for popular artists than unpopular so we preload the
    // first 1k artists by popularity.
    //
    // Note that we don't also preload their albums. We could, but there's no
    // reason to as the list UI will do that. We know the user can't navigate to
    // an album they don't see in the UI, so there's no point in preloading
    // more.
    //
    // There is also an interesting interaction with the UI. Since we will get
    // instant local results and full server results async, we ideally want to
    // avoid having the UI jostle. So we want to preload in the same order we
    // tend to display in the UI. That way local results are always also the
    // top ranked results.
    z.query.artist.orderBy('popularity', 'desc').limit(1_000).preload({
      ttl: '1m',
    });
  }, 1_000);
}
