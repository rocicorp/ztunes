import {createFileRoute, Outlet} from '@tanstack/react-router';
import {SessionInit} from 'app/components/session-init';
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
      <SessionInit>
        <ZeroInit>
          <SiteLayout>
            <Outlet />
          </SiteLayout>
        </ZeroInit>
      </SessionInit>
    </CookiesProvider>
  );
}
