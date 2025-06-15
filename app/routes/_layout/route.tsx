import {createFileRoute, Outlet} from '@tanstack/react-router';
import {SessionProvider} from '../../components/session-provider';
import {authClient} from '../../../auth/client';
import {ZeroProvider} from '../../components/zero-provider';

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
  loader: async () => {
    console.log('loader');
    const session = await authClient.getSession();
    console.log('session', session);
    return {session};
  },
});

function RouteComponent() {
  const {session} = Route.useLoaderData();
  return (
    <SessionProvider
      initialUserID={session.data?.user.id}
      initialToken={session.data?.session.token}
    >
      <ZeroProvider>
        <Outlet />
      </ZeroProvider>
    </SessionProvider>
  );
}
