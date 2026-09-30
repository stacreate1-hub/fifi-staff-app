import React from 'react';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Body, Card, EmptyState, Label, LoadingState, Screen } from '@/components/ui';
import { colors, spacing } from '@/lib/theme';
import { useTasks } from '@/hooks/useApi';
import type { Task } from '@/lib/api';
import { isAdminPersona, useSession } from '@/lib/auth';

const DONE_VALUES = new Set(['Signed', 'Viewed / Selected', 'Downloaded', 'Done', 'Paid in full', 'Received']);

/** Shared by (admin)/tasks and (finance)/tasks — six auto-generated follow-up threads per booking, no free-form tasks this phase. */
export function TasksScreen() {
  const { capabilities } = useSession();
  const { data: tasks, isLoading, refetch, isRefetching } = useTasks();

  const detailRoute = (bookingId: string) => (isAdminPersona(capabilities) ? `/(admin)/bookings/${bookingId}` : `/(finance)/bookings/${bookingId}`);

  if (isLoading) return <LoadingState />;

  return (
    <Screen>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.booking_id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={<EmptyState title="Nothing to follow up on" message="Active bookings will show their outstanding threads here." />}
        renderItem={({ item }: { item: Task }) => (
          <Pressable onPress={() => router.push(detailRoute(item.booking_id) as never)}>
            <Card style={styles.card}>
              <View style={styles.rowBetween}>
                <Body>{item.client_name}</Body>
                <Body muted>{item.event_date}</Body>
              </View>
              <View style={styles.threadWrap}>
                <TaskChip label="Contract" value={item.contract} />
                <TaskChip label="Picu proofs" value={item.picu_proofs} />
                <TaskChip label="Final gallery" value={item.final_gallery} />
                <TaskChip label="Meeting" value={item.meeting} />
                <TaskChip label="Payment" value={item.payment} />
                <TaskChip label="Testimonial" value={item.testimonial} />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

function TaskChip({ label, value }: { label: string; value: string }) {
  const done = DONE_VALUES.has(value);
  return (
    <View style={[styles.chip, done && styles.chipDone]}>
      <Label style={styles.chipLabel}>{label}</Label>
      <Body style={[styles.chipValue, done && styles.chipValueDone]}>{value}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.sm },
  card: { gap: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minWidth: '47%',
  },
  chipDone: { borderColor: colors.success, backgroundColor: colors.successBg },
  chipLabel: { fontSize: 10 },
  chipValue: { fontSize: 12 },
  chipValueDone: { color: colors.success },
});
