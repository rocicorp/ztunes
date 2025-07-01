import {useEffect, useMemo, useRef} from 'react';
import {
  LinkComponent,
  Link as TanstackLink,
  useRouter,
} from '@tanstack/react-router';
import {Query, Zero} from '@rocicorp/zero';
import {useZero} from '@rocicorp/zero/react';
import {Schema} from 'zero/schema';
import {useSession, SessionContextType} from 'app/components/session-provider';

type RouteQuery = (
  z: Zero<Schema>,
  params?: Record<string, string> | undefined,
  search?: Record<string, any> | undefined,
  session?: SessionContextType | undefined,
) => Query<Schema, keyof Schema['tables'], any>;

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    query?: RouteQuery | undefined;
  }
}

export const Link: LinkComponent<typeof TanstackLink> = ({
  onMouseDown,
  onClick,
  to,
  params,
  search,
  ...rest
}) => {
  // OK, the reason to do all of this manually rather than using the built-in
  // preload feature is that our desired semantics are a bit different than
  // classic APIs:
  //
  // - Materializing the query is the most expensive thing. Maintaining it is
  //   relatively cheap. So once we've materialized the query, we don't want
  //   to accidentally throw it away if user will end up needing it. So a
  //   fixed timeout like 5m, which is what built-in TS features do is
  //   non-ideal.
  //
  // - If the user re-views a link shortly after it was last viewed, we want
  //   to avoid re-materializing the query. Hence we do want a timeout, but
  //   it should start *after* the link is unmounted.
  const z = useZero<Schema>();
  const session = useSession();
  const ref = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const location = useMemo(() => {
    return router.buildLocation({
      to: to as any,
      params,
      search,
    });
  }, [to, params, search]);

  useEffect(() => {
    // TODO: This is marked deprecated in my editor, but according to .d.ts,
    // I think this siganture is valid.
    //
    // Also is this the correct way to do all this?
    //
    // TODO: Is there a way to disable strict mode and prevent all these queries
    // from getting called twice in dev mode. It's not a big deal because Zero
    // does dedupe them but it makes the network monitor hard to read.
    const matches = router.matchRoutes(location);
    const match = matches[matches.length - 1];
    if (!match) {
      console.info('No match found for location - not preloading', location);
      return;
    }

    const route = to && router.routesById[match.routeId];
    const queryFn = route?.options.staticData?.query as RouteQuery | undefined;
    if (!queryFn) {
      console.info('No query found for route - not preloading', route.id);
      return;
    }

    const query = queryFn(z, match.params, match.search, session);
    const {cleanup} = query.preload({
      ttl: '5m',
    });

    return () => {
      cleanup();
    };
  }, [location]);

  const handleMouseDown = e => {
    if (onMouseDown) {
      onMouseDown(e);
    }
    if (!e.defaultPrevented) {
      if (onClick) {
        onClick(e);
      }
    }
    ref.current?.click();
  };

  return (
    <TanstackLink
      ref={ref}
      to={to as any}
      params={params}
      search={search}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      {...rest}
    />
  );
};
