// app/router.tsx
import {createRouter as createTanStackRouter} from '@tanstack/react-router';
import {routeTree} from './routeTree.gen';
import {Zero} from '@rocicorp/zero';
import {Schema} from 'zero/schema';
import {Mutators} from 'zero/mutators';
import {SessionContextType} from './components/session-init';

export interface RouterContext {
  zero: Zero<Schema, Mutators>;
  session: SessionContextType;
}

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'viewport',
    // It is fine to call Zero multiple times for same query, Zero dedupes the
    // queries internally.
    defaultPreloadStaleTime: 0,
    // We don't want TanStack skipping any calls to us. We want to be asked to
    // preload every link. This is fine because Zero has its own internal
    // deduping and caching.
    defaultPreloadGcTime: 0,
    context: {
      zero: undefined as unknown as Zero<Schema, Mutators>, // populated in ZeroInit,
      session: undefined as unknown as SessionContextType, // populated in SessionProvider
    } satisfies RouterContext,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
