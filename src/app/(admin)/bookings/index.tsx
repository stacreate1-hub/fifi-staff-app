import React from 'react';
import { BookingsListScreen } from '@/components/BookingsListScreen';

export default function AdminBookingsList() {
  return <BookingsListScreen detailRoute={(id) => `/(admin)/bookings/${id}`} />;
}
