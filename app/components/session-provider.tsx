import {authClient} from 'auth/client';
import {useEffect, useState, createContext, useContext} from 'react';

export type SessionContextType = {
  userID: string | undefined;
  jwt: string | undefined;
  pending: boolean;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

export function SessionProvider({
  initialUserID,
  initialToken,
  children,
}: {
  initialUserID: string | undefined;
  initialToken: string | undefined;
  children: React.ReactNode;
}) {
  const session = authClient.useSession();

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
  }, [session.data?.session.token]);

  const value = {
    userID: initialUserID ?? session.data?.user.id,
    jwt: initialToken ?? jwt,
    pending: session.isPending || pending,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
