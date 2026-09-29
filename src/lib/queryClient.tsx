import React, { useMemo } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAuthError, useSession } from './auth';

/**
 * A 401 from any query (expired/invalid token) signs the session out
 * globally, so every screen falls back to the login flow the same way
 * rather than each screen handling it individually.
 */
export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const { invalidate } = useSession();

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

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
