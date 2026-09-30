import React from 'react';
import { BookingsListScreen } from '@/components/BookingsListScreen';

/** Messaging is per-booking (see BookingDetailScreen's Messages section) — this tab is a shortcut into that same list, scoped to the photographer's own bookings same as My Bookings. */
export default function Messages() {
  return (
    <BookingsListScreen
      detailRoute={(id) => `/(photographer)/my-bookings/${id}`}
      emptyTitle="No bookings yet"
      emptyMessage="Messages live on each booking once you're assigned one."
    />
  );
}
