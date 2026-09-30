import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Body, Button, Card, EmptyState, Heading, Label, LoadingState, Screen, StatTile, StatusBadge } from '@/components/ui';
import { spacing } from '@/lib/theme';
import { useBookings, useReports } from '@/hooks/useApi';
import { useSession } from '@/lib/auth';

/** Shared by (admin)/index and (finance)/index — income KPIs only render for whoever's token carries fifi_view_reports (useReports is a no-op query otherwise). */
export function OverviewScreen() {
  const { user, signOut } = useSession();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: reports } = useReports();

  const pending = bookings?.filter((b) => b.booking_status === 'Awaiting Payment').length ?? 0;
  const confirmed = bookings?.filter((b) => b.booking_status === 'Booking Confirmed').length ?? 0;

  if (bookingsLoading) return <LoadingState />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Label>Welcome back</Label>
            <Heading>{user?.name ?? 'Studio'}</Heading>
          </View>
          <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
        </View>

        <View style={styles.statsRow}>
          <StatTile label="Awaiting payment" value={pending} />
          <StatTile label="Confirmed" value={confirmed} />
        </View>

        {reports ? (
          <View style={styles.statsRow}>
            <StatTile label={`Received (${reports.label})`} value={`£${reports.received.toFixed(2)}`} />
            <StatTile label="Outstanding" value={`£${reports.outstanding.toFixed(2)}`} />
          </View>
        ) : null}

        <View>
          <Label style={styles.sectionLabel}>Recent bookings</Label>
          {!bookings || bookings.length === 0 ? (
            <EmptyState title="No bookings yet" message="Bookings assigned to you will show up here." />
          ) : (
            bookings.slice(0, 5).map((b) => (
              <Card key={b.booking_id} style={styles.bookingRow}>
                <View style={{ flex: 1 }}>
                  <Body>{b.name}</Body>
                  <Body muted>{b.service} · {b.event_date}</Body>
                </View>
                <StatusBadge status={b.booking_status} />
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  sectionLabel: { marginBottom: spacing.sm },
  bookingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
});
