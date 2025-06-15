import {Zero} from '@rocicorp/zero';
import {schema, Schema} from '../../zero/schema';
import {ZeroProvider as ZeroProviderImpl} from '@rocicorp/zero/react';
import {authClient} from '../../auth/client';
import {useEffect, useState} from 'react';
import {createMutators, Mutators} from '../../zero/mutators';

type Session = {
  userID: string | undefined;
  sessionToken: string | undefined;
  pending: boolean;
};

type JWT = {value: string | undefined; pending: boolean};

function toSession(betterAuthSession: {
  data: {user: {id: string}; session: {token: string}} | null;
  isPending: boolean;
}): Session {
  if (betterAuthSession.isPending) {
    return {userID: undefined, sessionToken: undefined, pending: true};
  }

  return {
    userID: betterAuthSession.data?.user.id,
    sessionToken: betterAuthSession.data?.session.token,
    pending: false,
  };
}

export function ZeroProvider({children}: {children: React.ReactNode}) {
  const session = toSession(authClient.useSession());
  const jwt = useJWT(session);
  const zero = useZero(session, jwt);
  if (zero) {
    console.timeStamp('got zero');
  }
  useExposeZero(zero);
  usePreload(zero);

  if (!zero) {
    return null;
  }

  return <ZeroProviderImpl zero={zero}>{children}</ZeroProviderImpl>;
}

function useJWT(session: Session): JWT {
  const [jwt, setJwt] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    setPending(true);

    const fetchToken = async () => {
      const res = await fetch('/api/auth/token', {
        credentials: 'include',
      });
      if (res.ok) {
        if (isCancelled) {
          return;
        }

        const data = await res.json();
        if (isCancelled) {
          return;
        }

        if (!data.token) {
          console.error('No token found in /api/auth/token response');
          return;
        }

        setJwt(data.token);
      }
      setPending(false);
    };

    // We fetch even if session is pending because better-auth can return JWT
    // in parallel. No need to wait for userID. When userID comes back, we
    // will do another token request which is kinda lame but it will be same
    // JWT so won't cause any impact on app. And better than waiting for a
    // whole round trip for userID.
    fetchToken();

    return () => {
      isCancelled = true;
    };
  }, [session.sessionToken]);

  return {value: jwt, pending};
}

function useZero(session: Session, jwt: JWT) {
  const [zero, setZero] = useState<Zero<Schema, Mutators> | undefined>(
    undefined,
  );

  useEffect(() => {
    const isLoggedIn = session.userID && jwt.value;
    const isLoginPending = session.pending || jwt.pending;

    if (!isLoggedIn && isLoginPending) {
      return;
    }

    const z = new Zero({
      userID: session.userID ?? 'anon',
      auth: jwt.value,
      server: import.meta.env.VITE_PUBLIC_SERVER,
      schema,
      mutators: createMutators(
        session.userID ? {sub: session.userID} : undefined,
      ),
    });

    setZero(z);

    return () => {
      zero?.close();
      setZero(undefined);
    };
  }, [session.userID, session.pending, jwt.value, jwt.pending]);

  return zero;
}

function useExposeZero(zero: Zero<Schema> | undefined) {
  useEffect(() => {
    let canceled = false;

    if (!zero) {
      return;
    }

    (window as any).__zero = zero;
    zero.inspect().then(inspector => {
      if (!canceled) {
        (window as any).__inspector = inspector;
      }
    });

    return () => {
      (window as any).__zero = undefined;
      (window as any).__inspector = undefined;
      canceled = true;
    };
  }, [zero]);
}

function usePreload(zero: Zero<Schema> | undefined) {
  useEffect(() => {
    if (zero) {
      preload(zero);
    }
  }, [zero]);
}

function preload(z: Zero<Schema>) {
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
  //    Anyway, the way ttl works is it only comes into play when a query is
  //    *not* active (when a window is running that does *not* include the
  //    query). So for the common preload case the ttl doesn't need to be long,
  //    because the preload query is always running. Basically it just needs to
  //    be long enough so that the query doesn't accidentally get evicted during
  //    page navigation. A minute is plenty.
  //
  // We are going to rework the ttl API to take both of these into account, but
  // for now we do not recomend ttls longer than 1h, and for preload we only
  // recommend 1m.
  //
  // PS: You are probably wondering about calling preload() multiple times here
  // due to re-renders. It's fine. Zero dedupes queries.
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
