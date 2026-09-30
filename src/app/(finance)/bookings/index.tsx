import React from 'react';
import { BookingsListScreen } from '@/components/BookingsListScreen';

export default function FinanceBookingsList() {
  return <BookingsListScreen detailRoute={(id) => `/(finance)/bookings/${id}`} />;
}
