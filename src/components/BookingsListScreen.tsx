import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Card, EmptyState, Label, LoadingState, Screen, StatusBadge } from '@/components/ui';
import { colors, radii, spacing } from '@/lib/theme';
import { useBookings } from '@/hooks/useApi';
import type { Booking } from '@/lib/api';

/** Shared list UI for (admin)/bookings and (photographer)/my-bookings — the API already scopes results per role, so only the destination route differs. */
export function BookingsListScreen({
  detailRoute,
  filter,
  emptyTitle = 'No bookings',
  emptyMessage = 'Nothing matches this search yet.',
}: {
  detailRoute: (bookingId: string) => string;
  filter?: (booking: Booking) => boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  const { data: bookings, isLoading, refetch, isRefetching } = useBookings();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!bookings) return [];
    const base = filter ? bookings.filter(filter) : bookings;
    const needle = search.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((b) =>
      [b.name, b.booking_id, b.client?.email, b.service].some((v) => v?.toLowerCase().includes(needle))
    );
  }, [bookings, search, filter]);

  if (isLoading) return <LoadingState />;

  return (
    <Screen>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search name, email, reference…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.booking_id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={<EmptyState title={emptyTitle} message={emptyMessage} />}
        renderItem={({ item }: { item: Booking }) => (
          <Pressable onPress={() => router.push(detailRoute(item.booking_id) as never)}>
            <Card style={styles.row}>
              <View style={{ flex: 1 }}>
                <Body>{item.name}</Body>
                <Label style={{ marginTop: 2 }}>{item.booking_id}</Label>
                <Body muted>{item.service} · {item.event_date}</Body>
              </View>
              <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                <StatusBadge status={item.booking_status} />
                <Body muted>£{Number(item.balance_due).toFixed(2)} due</Body>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
