import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SessionProvider, isAdminPersona, useSession } from '@/lib/auth';
import { AppQueryProvider } from '@/lib/queryClient';

SplashScreen.preventAutoHideAsync();

// react-native-keyboard-controller doesn't support web; only wrap native platforms.
const KeyboardRootProvider = Platform.OS === 'web' ? React.Fragment : KeyboardProvider;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  return (
    <KeyboardRootProvider>
      <SafeAreaProvider>
        <SessionProvider>
          <AppQueryProvider>
            <StatusBar style="dark" />
            <RootNavigator fontsLoaded={fontsLoaded} />
          </AppQueryProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </KeyboardRootProvider>
  );
}

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoading, token, capabilities } = useSession();
  const ready = fontsLoaded && !isLoading;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const isAdmin = isAdminPersona(capabilities);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>

      <Stack.Protected guard={!!token && isAdmin}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>

      <Stack.Protected guard={!!token && !isAdmin}>
        <Stack.Screen name="(photographer)" />
      </Stack.Protected>
    </Stack>
  );
}
