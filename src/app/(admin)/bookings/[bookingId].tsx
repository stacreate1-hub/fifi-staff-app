import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { BookingDetailScreen } from '@/components/BookingDetailScreen';

export default function AdminBookingDetail() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return <BookingDetailScreen bookingId={bookingId as string} />;
}
