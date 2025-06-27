import {createContext, useContext, useMemo, useState} from 'react';
import Cookies from 'js-cookie';
import {authClient} from 'auth/client';

export type SessionContextType = {
  data:
    | {
        userID: string;
        email: string;
        jwt: string;
      }
    | undefined;
  login: () => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

export function SessionProvider({children}: {children: React.ReactNode}) {
  const [, setForceUpdate] = useState({});

  const userID = Cookies.get('userid') as string | undefined;
  const email = Cookies.get('email') as string | undefined;
  const jwt = Cookies.get('jwt') as string | undefined;

  const logout = useMemo(
    () => () => {
      authClient.signOut().then(() => {
        setForceUpdate({});
      });
    },
    [],
  );

  const data = useMemo(() => {
    if (!userID || !jwt || !email) {
      return undefined;
    }
    return {
      userID,
      email,
      jwt,
    };
  }, [userID, jwt, email]);

  const context = useMemo(() => {
    return {
      data,
      login,
      logout,
    };
  }, [data, login, logout]);

  return (
    <SessionContext.Provider value={context}>
      {children}
    </SessionContext.Provider>
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
