import {createFileRoute, Outlet} from '@tanstack/react-router';
import {ZeroInit} from 'app/components/zero-init';
import {createServerFn} from '@tanstack/react-start';
import {SiteLayout} from 'app/components/site-layout';

export const getAuthFromHeaders = createServerFn().handler(async () => {});

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
  staleTime: Infinity,
});

function RouteComponent() {
  return (
    <ZeroInit>
      <SiteLayout>
        <Outlet />
      </SiteLayout>
    </ZeroInit>
  );
}
