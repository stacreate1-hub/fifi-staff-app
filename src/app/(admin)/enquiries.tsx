import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Body, Card, EmptyState, Label, LoadingState, Screen } from '@/components/ui';
import { colors, radii, spacing } from '@/lib/theme';
import { useEnquiries, useUpdateEnquiry } from '@/hooks/useApi';
import type { Enquiry, EnquiryStage } from '@/lib/api';
import { useSession } from '@/lib/auth';

const STAGES: { key: EnquiryStage; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'consultation', label: 'Consultation' },
  { key: 'quote', label: 'Quote sent' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
];

export default function Enquiries() {
  const { capabilities } = useSession();
  const [stage, setStage] = useState<EnquiryStage | undefined>(undefined);
  const { data: enquiries, isLoading } = useEnquiries(stage);
  const updateEnquiry = useUpdateEnquiry();

  // /enquiries is gated server-side to fifi_manage_clients — both
  // Administrator and Fifi Office Admin have it. This check is a
  // defensive fallback; anyone else never sees this tab at all.
  if (!capabilities?.manage_clients) {
    return (
      <Screen>
        <EmptyState
          title="Not available"
          message="Enquiries are visible to full administrators only, to keep client contact details restricted."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <FilterChip label="All" active={!stage} onPress={() => setStage(undefined)} />
        {STAGES.map((s) => (
          <FilterChip key={s.key} label={s.label} active={stage === s.key} onPress={() => setStage(s.key)} />
        ))}
      </ScrollView>

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No enquiries" message="Nothing in this stage right now." />}
          renderItem={({ item }: { item: Enquiry }) => (
            <Card style={{ gap: spacing.xs }}>
              <View style={styles.rowBetween}>
                <Body>{item.name || item.email}</Body>
                <Label>{item.stage}</Label>
              </View>
              <Body muted>{item.email}{item.phone ? ` · ${item.phone}` : ''}</Body>
              {item.message ? <Body numberOfLines={2}>{item.message}</Body> : null}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.xs }}>
                <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                  {STAGES.map((s) => (
                    <FilterChip
                      key={s.key}
                      label={s.label}
                      active={item.stage === s.key}
                      small
                      onPress={() => updateEnquiry.mutate({ id: item.id, stage: s.key })}
                    />
                  ))}
                </View>
              </ScrollView>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

function FilterChip({ label, active, onPress, small }: { label: string; active: boolean; onPress: () => void; small?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, small && styles.chipSmall, active && styles.chipActive]}>
      <Body style={[styles.chipText, active && styles.chipTextActive]}>{label}</Body>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipSmall: { paddingVertical: 4, paddingHorizontal: spacing.sm },
  chipActive: { backgroundColor: colors.black, borderColor: colors.black },
  chipText: { fontSize: 12 },
  chipTextActive: { color: colors.cream },
});
