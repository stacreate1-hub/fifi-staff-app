import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'fifi_auth_token';

/**
 * expo-secure-store (Keychain/Keystore) has no web implementation. A true
 * httpOnly cookie isn't achievable here either — that requires the server
 * to set the cookie itself, and this API issues a bearer token, not a
 * cookie. sessionStorage is the closest practical equivalent on web: it's
 * still readable by any script on the page (unlike a real httpOnly
 * cookie), but unlike localStorage it's cleared when the tab closes and
 * isn't shared across tabs, which limits how long a stolen token stays
 * valid if this page is ever compromised by XSS.
 *
 * `remember` controls whether the token survives an app restart (native)
 * or browser/tab restart (web). When false, the token is kept out of any
 * persistent store entirely — it only lives in the SessionProvider's React
 * state for the current run, so relaunching the app forces sign-in again.
 */
export async function saveToken(token: string, remember: boolean): Promise<void> {
  if (Platform.OS === 'web') {
    if (remember) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    }
    return;
  }
  if (remember) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function loadToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
