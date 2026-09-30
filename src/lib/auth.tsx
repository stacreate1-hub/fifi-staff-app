import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiError, type Capabilities } from './api';
import { saveToken, loadToken, clearToken } from './storage';

const SESSION_CACHE_KEY = 'fifi_session_cache';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

interface SessionCache {
  user: SessionUser;
  capabilities: Capabilities;
}

interface SessionContextValue {
  isLoading: boolean;
  token: string | null;
  user: SessionUser | null;
  capabilities: Capabilities | null;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  /** Marks the session invalid (e.g. after a 401 from any API call) without needing credentials. */
  invalidate: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

/**
 * The JWT itself is opaque to the app — capabilities come from the login
 * response, not by decoding the token. Only the token is treated as
 * sensitive (see lib/storage.ts); user/capabilities are cached in plain
 * AsyncStorage purely so the app can restore its UI instantly on launch
 * without a network round trip.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, cachedJson] = await Promise.all([
          loadToken(),
          AsyncStorage.getItem(SESSION_CACHE_KEY),
        ]);
        if (storedToken && cachedJson) {
          const cached = JSON.parse(cachedJson) as SessionCache;
          setToken(storedToken);
          setUser(cached.user);
          setCapabilities(cached.capabilities);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string, remember: boolean = true) => {
    const res = await api.login(email, password);
    await saveToken(res.token, remember);
    if (remember) {
      await AsyncStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ user: res.user, capabilities: res.capabilities }));
    } else {
      await AsyncStorage.removeItem(SESSION_CACHE_KEY);
    }
    setToken(res.token);
    setUser(res.user);
    setCapabilities(res.capabilities);
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([clearToken(), AsyncStorage.removeItem(SESSION_CACHE_KEY)]);
    setToken(null);
    setUser(null);
    setCapabilities(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{ isLoading, token, user, capabilities, signIn, signOut, invalidate: signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/**
 * True for Administrator or Fifi Office Admin — the CEO/Admin nav persona.
 * manage_clients (not view_all_bookings) is the discriminator: Fifi Finance
 * also has view_all_bookings, but never manage_clients.
 */
export function isAdminPersona(capabilities: Capabilities | null): boolean {
  return !!capabilities?.manage_clients;
}

/** True for Fifi Finance — has view_reports but, unlike Administrator, never manage_clients. */
export function isFinancePersona(capabilities: Capabilities | null): boolean {
  return !!capabilities?.view_reports && !capabilities?.manage_clients;
}

/** Re-throws non-auth errors; on a 401 from the API, signs the session out so the login screen reappears. */
export function isAuthError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}
