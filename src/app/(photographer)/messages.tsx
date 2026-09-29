import React from 'react';
import { Screen, EmptyState } from '@/components/ui';

/**
 * The site has a "Fifi Booking Messaging" snippet, but its functionality
 * was never wrapped into fifi-portal-api-v2.php for Phase 1 — there is no
 * GET/POST /messages route to call yet. Placeholder rather than fake data.
 */
export default function Messages() {
  return (
    <Screen>
      <EmptyState
        title="Messages coming soon"
        message="Booking messaging isn't part of the Phase 1 API yet — it needs its own route added first."
      />
    </Screen>
  );
}
