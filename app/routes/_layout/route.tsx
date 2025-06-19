import {createFileRoute, Outlet} from '@tanstack/react-router';
import {SessionProvider} from 'app/components/session-provider';
import {auth} from 'auth/auth';
import {ZeroInit} from 'app/components/zero-init';
import {getWebRequest} from '@tanstack/react-start/server';
import {createServerFn} from '@tanstack/react-start';
import {SiteLayout} from 'app/components/site-layout';

export const getAuthFromHeaders = createServerFn().handler(async () => {
  const session = await auth.api.getSession({
    headers: getWebRequest().headers,
  });

  const token = await auth.api.getToken({
    headers: getWebRequest().headers,
  });

  return {
    userID: session?.user.id,
    token: token.token ? token.token : undefined,
  };
});

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
  loader: async () => {
    if (typeof window === 'undefined') {
      console.log('getting session from server');
      try {
        const session = await getAuthFromHeaders();
        console.log('got session', session);
        return session;
      } catch (e) {
        if (e.statusCode === 401) {
          console.log('user unauthenticated');
        } else {
          console.error(e);
        }
      }
    }

    return {
      userID: undefined,
      token: undefined,
    };
  },
  staleTime: Infinity,
});

function RouteComponent() {
  const {userID, token} = Route.useLoaderData();
  return (
    <SessionProvider initialUserID={userID} initialToken={token}>
      <ZeroInit>
        <SiteLayout>
          <Outlet />
        </SiteLayout>
      </ZeroInit>
    </SessionProvider>
  );
}
