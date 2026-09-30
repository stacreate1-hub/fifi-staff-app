import React, { useEffect, useMemo } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAuthError, useSession } from './auth';

/**
 * A 401 from any query (expired/invalid token) signs the session out
 * globally, so every screen falls back to the login flow the same way
 * rather than each screen handling it individually.
 */
export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const { invalidate, token } = useSession();

  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            if (isAuthError(error)) void invalidate();
          },
        }),
      }),
    [invalidate]
  );

  // The client is a singleton for the app's lifetime, so without this, a
  // sign-out followed by a different account signing in on the same device
  // would briefly serve the previous user's cached bookings/reports/etc. —
  // stale data from one role leaking into another role's screens.
  useEffect(() => {
    client.clear();
  }, [client, token]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
