import {createFileRoute, Outlet} from '@tanstack/react-router';
import {SessionProvider} from 'app/components/session-provider';
import {ZeroInit} from 'app/components/zero-init';
import {createServerFn} from '@tanstack/react-start';
import {SiteLayout} from 'app/components/site-layout';
import {CookiesProvider} from 'react-cookie';

export const getAuthFromHeaders = createServerFn().handler(async () => {});

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
  staleTime: Infinity,
});

function RouteComponent() {
  return (
    <CookiesProvider>
      <SessionProvider>
        <ZeroInit>
          <SiteLayout>
            <Outlet />
          </SiteLayout>
        </ZeroInit>
      </SessionProvider>
    </CookiesProvider>
  );
}
