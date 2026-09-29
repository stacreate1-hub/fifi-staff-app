import React from 'react';
import { BookingsListScreen } from '@/components/BookingsListScreen';
import { isSameDay, parseSiteDate } from '@/lib/dates';

export default function Today() {
  const today = new Date();
  return (
    <BookingsListScreen
      detailRoute={(id) => `/(photographer)/my-bookings/${id}`}
      filter={(b) => {
        const d = parseSiteDate(b.event_date);
        return !!d && isSameDay(d, today);
      }}
      emptyTitle="Nothing on today"
      emptyMessage="No shoots scheduled for today."
    />
  );
}
