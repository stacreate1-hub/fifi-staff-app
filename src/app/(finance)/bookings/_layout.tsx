import React from 'react';
import { Stack } from 'expo-router';
import { colors, fonts } from '@/lib/theme';

export default function FinanceBookingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.text },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Bookings' }} />
      <Stack.Screen name="[bookingId]" options={{ title: 'Booking' }} />
    </Stack>
  );
}
