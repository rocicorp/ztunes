import {Zero} from '@rocicorp/zero';
import {ZeroProvider} from '@rocicorp/zero/react';
import {schema, Schema} from 'zero/schema';
import {useMemo} from 'react';
import {createMutators, Mutators} from 'zero/mutators';
import {useRouter} from '@tanstack/react-router';
import {must} from 'shared/must';
import {anon} from 'zero/queries';

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
    z.preload(anon.preload(), {
      ttl: '1m',
    });
  }, 1_000);
}
