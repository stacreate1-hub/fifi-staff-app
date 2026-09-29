import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider, isAdminPersona, useSession } from '@/lib/auth';
import { AppQueryProvider } from '@/lib/queryClient';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <AppQueryProvider>
          <StatusBar style="dark" />
          <RootNavigator fontsLoaded={fontsLoaded} />
        </AppQueryProvider>
      </SessionProvider>
    </SafeAreaProvider>
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
