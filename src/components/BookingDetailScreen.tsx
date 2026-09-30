import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Body, Button, Card, Heading, Label, LoadingState, Screen, StatusBadge } from '@/components/ui';
import { colors, radii, spacing } from '@/lib/theme';
import {
  useAssignPhotographer,
  useBooking,
  useMessages,
  usePayments,
  usePhotographers,
  useRecordPayment,
  useRecordRefund,
  useSendMessage,
  useUpdateStatus,
} from '@/hooks/useApi';
import { isAdminPersona, useSession } from '@/lib/auth';
import type { BookingStatus } from '@/lib/api';

const STATUS_OPTIONS: BookingStatus[] = ['Awaiting Payment', 'Booking Confirmed', 'Payment Arrangement', 'Refunded', 'Cancelled'];

/** Shared by (admin)/bookings/[bookingId] and (photographer)/my-bookings/[bookingId] — same data, same actions, gated by the same capability flags either way. */
export function BookingDetailScreen({ bookingId }: { bookingId: string }) {
  const { capabilities } = useSession();
  const { data: booking, isLoading } = useBooking(bookingId);
  const { data: payments } = usePayments(bookingId);
  const recordPayment = useRecordPayment(bookingId);
  const recordRefund = useRecordRefund(bookingId);
  const updateStatus = useUpdateStatus(bookingId);
  const { data: photographers } = usePhotographers();
  const assignPhotographer = useAssignPhotographer(bookingId);
  const { data: messages } = useMessages(bookingId);
  const sendMessage = useSendMessage(bookingId);

  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'payment' | 'refund' | null>(null);
  const [messageBody, setMessageBody] = useState('');

  if (isLoading || !booking) return <LoadingState />;

  const submitAmount = () => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    if (mode === 'payment') {
      recordPayment.mutate({ amount: value, method: 'Recorded via app' }, { onSuccess: () => { setAmount(''); setMode(null); } });
    } else if (mode === 'refund') {
      recordRefund.mutate({ amount: value, method: 'Recorded via app' }, { onSuccess: () => { setAmount(''); setMode(null); } });
    }
  };

  const submitMessage = () => {
    const body = messageBody.trim();
    if (!body) return;
    sendMessage.mutate({ body }, { onSuccess: () => setMessageBody('') });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Heading>{booking.name}</Heading>
          <Label style={{ marginTop: spacing.xs }}>{booking.booking_id}</Label>
        </View>

        <View style={styles.rowBetween}>
          <StatusBadge status={booking.booking_status} />
          <Body muted>{booking.event_date}</Body>
        </View>

        <Card style={{ gap: spacing.sm }}>
          <Row label="Service" value={`${booking.service}${booking.package ? ` — ${booking.package}` : ''}`} />
          <Row label="Venue" value={booking.venue || '—'} />
          <Row label="Client" value={`${booking.client.name} (${booking.client.email})`} />
          <Row label="Total" value={`£${Number(booking.total_amount).toFixed(2)}`} />
          <Row label="Balance due" value={`£${Number(booking.balance_due).toFixed(2)}`} />
        </Card>

        {capabilities?.manage_clients ? (
          <Card style={{ gap: spacing.sm }}>
            <Label>Photographer</Label>
            <View style={styles.rowGap}>
              <Button
                title="Unassigned"
                variant={!booking.assigned_photographer ? 'primary' : 'secondary'}
                onPress={() => assignPhotographer.mutate(null)}
                loading={assignPhotographer.isPending}
                disabled={!booking.assigned_photographer}
              />
              {(photographers ?? []).map((p) => (
                <Button
                  key={p.id}
                  title={p.label}
                  variant={booking.assigned_photographer === p.id ? 'primary' : 'secondary'}
                  onPress={() => assignPhotographer.mutate(p.id)}
                  loading={assignPhotographer.isPending}
                  disabled={booking.assigned_photographer === p.id}
                />
              ))}
            </View>
          </Card>
        ) : null}

        {capabilities?.manage_payments || capabilities?.manage_refunds ? (
          <Card style={{ gap: spacing.sm }}>
            <Label>Record a transaction</Label>
            <View style={styles.rowGap}>
              {capabilities?.manage_payments ? (
                <Button
                  title="Payment"
                  variant={mode === 'payment' ? 'primary' : 'secondary'}
                  onPress={() => setMode(mode === 'payment' ? null : 'payment')}
                />
              ) : null}
              {capabilities?.manage_refunds ? (
                <Button
                  title="Refund"
                  variant={mode === 'refund' ? 'primary' : 'secondary'}
                  onPress={() => setMode(mode === 'refund' ? null : 'refund')}
                />
              ) : null}
            </View>
            {mode ? (
              <View style={styles.rowGap}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
                <Button
                  title={mode === 'payment' ? 'Record payment' : 'Record refund'}
                  onPress={submitAmount}
                  loading={recordPayment.isPending || recordRefund.isPending}
                />
              </View>
            ) : null}
          </Card>
        ) : null}

        {/*
          edit_bookings also gates gallery upload for photographers (kept
          intentionally), so it alone can't gate status-change here — that
          control is restricted to the admin persona (Administrator / Fifi
          Office Admin) on top of the capability check.
        */}
        {isAdminPersona(capabilities) && capabilities?.edit_bookings ? (
          <Card style={{ gap: spacing.sm }}>
            <Label>Change status</Label>
            <View style={styles.statusWrap}>
              {STATUS_OPTIONS.map((s) => (
                <Button
                  key={s}
                  title={s}
                  variant={s === booking.booking_status ? 'primary' : 'secondary'}
                  onPress={() => updateStatus.mutate(s)}
                  disabled={s === booking.booking_status}
                  loading={updateStatus.isPending}
                />
              ))}
            </View>
          </Card>
        ) : null}

        <View>
          <Label style={{ marginBottom: spacing.sm }}>Payment history</Label>
          {!payments || payments.length === 0 ? (
            <Body muted>No payments recorded yet.</Body>
          ) : (
            payments.map((p, i) => (
              <Card key={i} style={styles.paymentRow}>
                <Body>{p.type === 'refund' ? 'Refund' : 'Payment'} · {p.method || '—'}</Body>
                <Body style={{ color: p.amount < 0 ? colors.danger : colors.success }}>
                  {p.amount < 0 ? '-' : ''}£{Math.abs(p.amount).toFixed(2)}
                </Body>
              </Card>
            ))
          )}
        </View>

        {capabilities?.edit_bookings ? (
          <View>
            <Label style={{ marginBottom: spacing.sm }}>Messages</Label>
            {!messages || messages.length === 0 ? (
              <Body muted>No messages yet.</Body>
            ) : (
              messages.map((m, i) => (
                <Card key={i} style={styles.messageRow}>
                  <View style={styles.rowBetween}>
                    <Label>{'staff' === m.from ? m.from_name : booking.client.name}{'meeting_note' === m.type ? ' · Meeting note' : ''}</Label>
                    <Body muted style={styles.messageTime}>{new Date(m.sent_at).toLocaleDateString()}</Body>
                  </View>
                  <Body>{m.body}</Body>
                </Card>
              ))
            )}
            <View style={styles.rowGap}>
              <TextInput
                style={[styles.amountInput, styles.messageInput]}
                placeholder="Write a message…"
                placeholderTextColor={colors.textMuted}
                value={messageBody}
                onChangeText={setMessageBody}
                multiline
              />
              <Button title="Send" onPress={submitMessage} loading={sendMessage.isPending} disabled={!messageBody.trim()} />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Body muted style={styles.detailLabel}>{label}</Body>
      <Body style={styles.detailValue}>{value}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailRow: { gap: 2 },
  detailLabel: { flexShrink: 0 },
  detailValue: { minWidth: 0, flexShrink: 1 },
  rowGap: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' },
  statusWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amountInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
    minWidth: 100,
  },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  messageRow: { gap: spacing.xs, marginBottom: spacing.sm },
  messageTime: { fontSize: 12 },
  messageInput: { flex: 1, minHeight: 44 },
});
