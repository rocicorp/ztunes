import {Zero} from '@rocicorp/zero';
import {ZeroProvider} from '@rocicorp/zero/react';
import {schema, Schema} from 'zero/schema';
import {useMemo} from 'react';
import {createMutators, Mutators} from 'zero/mutators';
import {useRouter} from '@tanstack/react-router';
import {must} from 'shared/must';
import {queries} from 'zero/queries';
import {authClient} from 'auth/client';

const serverURL = must(
  import.meta.env.VITE_PUBLIC_SERVER,
  'VITE_PUBLIC_SERVER is required',
);

export function ZeroInit({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const session = authClient.useSession();

  const opts = useMemo(() => {
    return {
      schema,
      userID: session.data?.user.id ?? 'anon',
      server: serverURL,
      mutators: createMutators(session.data?.user.id),
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
  }, [session.data?.user.id, router]);

  return <ZeroProvider {...opts}>{children}</ZeroProvider>;
}

function preload(z: Zero<Schema>) {
  // Delay preload() slightly to avoid blocking UI on first run. We don't need
  // this data to display the UI, it's used by search.
  setTimeout(() => {
    // # Why this particular preload?
    //
    // The goal of Zero generally is for every user interaction to be instant.
    // This relies fundamentally on preloading data. But we cannot preload
    // everything, so preloading is at core about guessing data user will most
    // likely need. This is different in every app. Zero gives you the full
    // power of queries to express and orchestrate whatever preload sequence you
    // want.
    //
    // And if you guess wrong, it's nbd, because Zero queries automatically
    // fallback to the server.
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
    // # Preventing Jostle
    //
    // There is also an interesting interaction with the UI. Since we will get
    // instant local results and full server results async, we ideally want to
    // avoid having the UI jostle. So we want to preload in the same order we
    // tend to display in the UI. That way local results are always also the
    // top ranked results.
    //
    // # TTL
    //
    // For simple Zero apps you won't need or want a TTL on your preload,
    // because preload queries run at startup and run for entire length of app.
    // Since they are never not running, there is never an opp for them to get
    // evicted.
    //
    // For this app, because it is a demo of a shopping site (and also to show
    // off 😂) we want to optimize startup as much as possible. So we want to
    // delay the preload query until after the initial view comes up. Because
    // of this delay, there is a moment (actually 1s - because of setTimeout
    // below) where the preload query is *not* running and would get evicted if
    // it didn't have a TTL. We set the TTL to 1m just be safe, but anything
    // more than 1s should technically work.
    //
    // There is a slight downside here than when/if the preload query changes,
    // Users will momentarily do *both* preload queries at startup -- the old
    // and new ones, until the old one ages out.
    z.preload(queries.artistPreload(), {
      ttl: '1m',
    });
  }, 1_000);
}
