import React from 'react';
import { BookingsListScreen } from '@/components/BookingsListScreen';

export default function MyBookingsList() {
  return (
    <BookingsListScreen
      detailRoute={(id) => `/(photographer)/my-bookings/${id}`}
      emptyMessage="Bookings assigned to you will show up here."
    />
  );
}
