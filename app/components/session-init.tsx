import {useMemo} from 'react';
import {authClient} from 'auth/client';
import {Cookies, useCookies} from 'react-cookie';
import {RouterContextProvider, useRouter} from '@tanstack/react-router';

export type SessionContextType = {
  data:
    | {
        userID: string;
        email: string;
      }
    | undefined;
  login: () => void;
  logout: () => void;
  zeroAuth: () => Promise<string | undefined>;
};

export function SessionInit({children}: {children: React.ReactNode}) {
  const [cookies] = useCookies(['userid', 'email', 'jwt']);

  const data = useMemo(() => {
    if (!cookies.userid || !cookies.email) {
      return undefined;
    }
    return {
      userID: cookies.userid,
      email: cookies.email,
    };
  }, [cookies.userid, cookies.email]);

  const session = useMemo(() => {
    return {
      data,
      login,
      logout,
      zeroAuth,
    };
  }, [data, cookies.jwt]);

  const router = useRouter();
  return (
    <RouterContextProvider
      /**
       * key is a hack - it shouldn't be needed, but for some reason on logout,
       * when the session is changed to undefined, the router doesn't re-render.
       */
      key={data?.userID}
      router={router}
      context={{session}}
    >
      {children}
    </RouterContextProvider>
  );
}

function login() {
  const callbackURL = location.href;
  authClient.signIn.social({
    provider: 'github',
    callbackURL,
    errorCallbackURL: callbackURL,
    newUserCallbackURL: callbackURL,
  });
}

function logout() {
  authClient.signOut();
}

async function zeroAuth(error?: 'invalid-token') {
  if (error) {
    await fetch('/api/auth/refresh', {
      credentials: 'include',
    });
  }
  return new Cookies().get('jwt') as string | undefined;
}
