import React from 'react';
import { Screen, EmptyState } from '@/components/ui';

/**
 * No backing route exists yet in fifi-portal-api-v2.php for listing staff
 * or assigning a photographer to a booking (the real logic lives in
 * fifi_admin_ajax_assign_photographer() inside the Admin Portal snippet,
 * which was never wrapped for Phase 1). This screen is a placeholder
 * rather than fake data — wire it up once a GET /staff and
 * PATCH /bookings/{id}/photographer route exist.
 */
export default function Staff() {
  return (
    <Screen>
      <EmptyState
        title="Staff management coming soon"
        message="Listing staff and assigning photographers to bookings needs a new API route — it isn't part of the Phase 1 API yet."
      />
    </Screen>
  );
}
