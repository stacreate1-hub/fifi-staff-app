import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Body, Card, EmptyState, Heading, Label, LoadingState, Screen, StatTile } from '@/components/ui';
import { spacing } from '@/lib/theme';
import { useReports } from '@/hooks/useApi';
import { useSession } from '@/lib/auth';

export default function Reports() {
  const { capabilities } = useSession();
  const { data, isLoading } = useReports();

  if (!capabilities?.manage_settings) {
    return (
      <Screen>
        <EmptyState title="Not available" message="Income reports are visible to full administrators only." />
      </Screen>
    );
  }

  if (isLoading || !data) return <LoadingState />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Heading>{data.label}</Heading>

        <View style={styles.statsRow}>
          <StatTile label="Received" value={`£${data.received.toFixed(2)}`} />
          <StatTile label="Refunds" value={`£${data.refunds.toFixed(2)}`} />
        </View>
        <View style={styles.statsRow}>
          <StatTile label="Net" value={`£${data.net.toFixed(2)}`} />
          <StatTile label="Outstanding" value={`£${data.outstanding.toFixed(2)}`} />
        </View>
        <View style={styles.statsRow}>
          <StatTile label="Jobs" value={data.jobs} />
          <StatTile label="Completed" value={data.completed} />
        </View>

        <View>
          <Label style={styles.sectionLabel}>By event type</Label>
          {Object.entries(data.by_type).length === 0 ? (
            <Body muted>No events in this period.</Body>
          ) : (
            Object.entries(data.by_type).map(([type, t]) => (
              <Card key={type} style={styles.row}>
                <Body>{type}</Body>
                <Body muted>{t.count} · £{t.value.toFixed(2)}</Body>
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
  statsRow: { flexDirection: 'row', gap: spacing.md },
  sectionLabel: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
});
