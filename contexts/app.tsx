'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import useOneTapLogin from '@/hooks/useOneTapLogin';
import { devLog } from '@/lib/utils';
import { ContextValue } from '@/types/context';
import { User } from '@/types/user';
import { useSession } from 'next-auth/react';

const AppContext = createContext({} as ContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  if (process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === 'true' && process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID) {
    useOneTapLogin();
  }

  const { data: session, status } = useSession();

  const [theme, setTheme] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_DEFAULT_THEME || '';
  });

  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Add mapping function for session to user
  const mapSessionToUser = (sessionUser: any): User => {
    return {
      email: sessionUser.email || '',
      nickname: sessionUser.nickname || sessionUser.name || '',
      avatar_url: sessionUser.avatar_url || sessionUser.image || '',
      uuid: sessionUser.uuid || sessionUser.id || '',
      created_at: sessionUser.created_at || new Date().toISOString(),
    };
  };

  // Check session changes and automatically retry fetching user information
  useEffect(() => {
    if (session && session.user) {
      // Map session user to our User interface
      const mappedUser = mapSessionToUser(session.user);

      // Log the mapped user data for debugging
      devLog('Session user mapped to:', mappedUser);

      // Check if important fields exist after mapping
      if (!mappedUser.avatar_url || !mappedUser.nickname) {
        devLog('Incomplete user info after mapping, retry count:', retryCount);

        // Maximum 3 retries, 2 seconds apart
        if (retryCount < 3) {
          const timer = setTimeout(() => {
            devLog('Retrying user mapping...');
            setRetryCount(prevCount => prevCount + 1);
            // Set the mapped user anyway to ensure some data is displayed
            setUser(mappedUser);
          }, 2000);

          return () => clearTimeout(timer);
        } else {
          // After max retries, use whatever data we have
          devLog('Max retries reached, using available user data');
          setUser(mappedUser);
        }
      } else {
        // User information is complete
        devLog('User info is complete after mapping');
        setUser(mappedUser);
        setRetryCount(0); // Reset retry counter
      }
    } else if (status === 'unauthenticated') {
      // Unauthenticated state, clear user info
      setUser(null);
      setRetryCount(0);
    }
  }, [session, status, retryCount]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        showSignModal,
        setShowSignModal,
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
